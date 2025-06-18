import { Connection, PublicKey, Transaction, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface MultisigConfig {
  threshold: number; // Number of signatures required
  signers: string[]; // Array of signer public keys
  multisigAddress: string; // The multisig wallet address
}

export class MultisigWalletService {
  private static connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com");
  
  // Platform multisig configuration
  private static readonly MULTISIG_CONFIG: MultisigConfig = {
    threshold: 2, // Require 2 out of 3 signatures
    signers: [
      process.env.PLATFORM_SIGNER_1 || "",
      process.env.PLATFORM_SIGNER_2 || "",
      process.env.PLATFORM_SIGNER_3 || ""
    ].filter(key => key.length > 0),
    multisigAddress: process.env.PLATFORM_MULTISIG_ADDRESS || ""
  };

  /**
   * Get the platform's multisig wallet address
   */
  static getMultisigAddress(): string {
    if (!this.MULTISIG_CONFIG.multisigAddress) {
      throw new Error("Multisig wallet address not configured");
    }
    return this.MULTISIG_CONFIG.multisigAddress;
  }

  /**
   * Get multisig configuration
   */
  static getMultisigConfig(): MultisigConfig {
    return this.MULTISIG_CONFIG;
  }

  /**
   * Verify if a transaction has sufficient signatures
   */
  static async verifyMultisigTransaction(transactionSignature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(transactionSignature, {
        commitment: "confirmed",
      });

      if (!transaction) {
        return false;
      }

      // Check if transaction has required number of signatures
      const requiredSignatures = this.MULTISIG_CONFIG.threshold;
      const actualSignatures = transaction.transaction.signatures.length;

      return actualSignatures >= requiredSignatures;
    } catch (error) {
      console.error("Error verifying multisig transaction:", error);
      return false;
    }
  }

  /**
   * Get multisig wallet balance
   */
  static async getMultisigBalance(): Promise<number> {
    try {
      const multisigPubkey = new PublicKey(this.MULTISIG_CONFIG.multisigAddress);
      const balance = await this.connection.getBalance(multisigPubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error getting multisig balance:", error);
      return 0;
    }
  }

  /**
   * Check if multisig is properly configured
   */
  static isMultisigConfigured(): boolean {
    return this.MULTISIG_CONFIG.multisigAddress.length > 0 && 
           this.MULTISIG_CONFIG.signers.length >= this.MULTISIG_CONFIG.threshold;
  }
} 