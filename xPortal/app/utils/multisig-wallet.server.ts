import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface MultisigConfig {
  threshold: number; // Number of signatures required
  signers: string[]; // Array of signer public keys
  multisigAddress: string; // The multisig wallet address
}

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

export class MultisigWalletService {
  /**
   * Get multisig configuration from environment
   */
  private static buildMultisigConfig(env: any): MultisigConfig {
    return {
      threshold: 2, // Require 2 out of 3 signatures
      signers: [
        env.PLATFORM_SIGNER_1 || "",
        env.PLATFORM_SIGNER_2 || "",
        env.PLATFORM_SIGNER_3 || ""
      ].filter(key => key.length > 0),
      multisigAddress: env.PLATFORM_MULTISIG_ADDRESS || ""
    };
  }

  /**
   * Get the platform's multisig wallet address
   */
  static getMultisigAddress(env: any): string {
    const config = this.buildMultisigConfig(env);
    if (!config.multisigAddress) {
      throw new Error("Multisig wallet address not configured");
    }
    return config.multisigAddress;
  }

  /**
   * Get multisig configuration
   */
  static getMultisigConfig(env: any): MultisigConfig {
    return this.buildMultisigConfig(env);
  }

  /**
   * Verify if a transaction has sufficient signatures
   */
  static async verifyMultisigTransaction(transactionSignature: string, env: any): Promise<boolean> {
    try {
      const rpcUrl = getSolanaRpcUrl(env);
      const value = await solanaRpc('getTransaction', [transactionSignature, { commitment: 'confirmed' }], rpcUrl);
      if (!value) {
        return false;
      }
      // Check if transaction has required number of signatures
      const config = this.buildMultisigConfig(env);
      const requiredSignatures = config.threshold;
      const actualSignatures = value.transaction.signatures.length;
      return actualSignatures >= requiredSignatures;
    } catch (error) {
      console.error("Error verifying multisig transaction:", error);
      return false;
    }
  }

  /**
   * Get multisig wallet balance
   */
  static async getMultisigBalance(env: any): Promise<number> {
    try {
      const config = this.buildMultisigConfig(env);
      const rpcUrl = getSolanaRpcUrl(env);
      const multisigPubkey = new PublicKey(config.multisigAddress);
      const value = await solanaRpc('getBalance', [multisigPubkey.toBase58()], rpcUrl);
      return value.value / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting multisig balance:", error);
      return 0;
    }
  }

  /**
   * Check if multisig is properly configured
   */
  static isMultisigConfigured(env: any): boolean {
    const config = this.buildMultisigConfig(env);
    return config.multisigAddress.length > 0 && 
           config.signers.length >= config.threshold;
  }
} 