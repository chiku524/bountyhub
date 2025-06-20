import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import bountyBucksInfo from '../../bounty-bucks-info.json';

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

const TOKEN_MINT = bountyBucksInfo.mint;
const TOKEN_SYMBOL = bountyBucksInfo.symbol;
const TOKEN_DECIMALS = 9; // From the attributes in the JSON

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

export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getTokenBalance(publicKey: PublicKey, mintAddress: string): Promise<number> {
  const mintPubkey = new PublicKey(mintAddress);
  const tokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
  
  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
  } catch (error) {
    return 0;
  }
}

export async function verifyTransaction(signature: string): Promise<boolean> {
  try {
    const status = await connection.getSignatureStatus(signature);
    return status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized';
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
} 