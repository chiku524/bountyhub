import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

// Function to get RPC URL from env or fallback
function getSolanaRpcUrl(env: any) {
  return env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

async function solanaRpc(method: string, params: any[], rpcUrl: string) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params,
  };
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function createBountyTransaction(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: number,
  mintAddress?: string
): Promise<Transaction> {
  const transaction = new Transaction();

  if (mintAddress) {
    // Handle SPL token transfer
    const mintPubkey = new PublicKey(mintAddress);
    const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromPublicKey);
    const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPublicKey);

    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromPublicKey,
      BigInt(amount)
    );

    transaction.add(transferInstruction);
  } else {
    // Handle SOL transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
  }

  return transaction;
}

export async function getBalance(publicKey: PublicKey, env: any): Promise<number> {
  try {
    const rpcUrl = getSolanaRpcUrl(env);
    const value = await solanaRpc('getBalance', [publicKey.toBase58()], rpcUrl);
    return value.value / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

export async function getTokenBalance(publicKey: PublicKey, mintAddress: string, env: any): Promise<number> {
  try {
    const rpcUrl = getSolanaRpcUrl(env);
    const mintPubkey = new PublicKey(mintAddress);
    const tokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
    const value = await solanaRpc('getTokenAccountBalance', [tokenAccount.toBase58()], rpcUrl);
    return Number(value.value.amount) / Math.pow(10, value.value.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

export async function verifyTransaction(signature: string, env: any): Promise<boolean> {
  try {
    const rpcUrl = getSolanaRpcUrl(env);
    const value = await solanaRpc('getSignatureStatuses', [[signature]], rpcUrl);
    const status = value && value.value && value.value[0];
    return status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized';
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
} 