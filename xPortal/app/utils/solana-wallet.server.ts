import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
  clusterApiUrl,
} from "@solana/web3.js";
import { confirmDeposit, confirmWithdrawal } from "./virtual-wallet.server";
import type { Db } from "./db.server";

export class SolanaWalletService {
  private static connection = new Connection(clusterApiUrl('devnet'));
  private static platformWallet = Keypair.generate(); // In production, this would be loaded from environment

  static getPlatformWalletAddress(): string {
    return this.platformWallet.publicKey.toString();
  }

  static async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  static async processDeposit(
    db: Db,
    userId: string,
    amount: number,
    userSolanaAddress: string,
    transactionId: string,
    solanaSignature: string
  ) {
    try {
      // Verify the Solana transaction
      const transaction = await this.connection.getTransaction(solanaSignature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        throw new Error('Transaction not found on Solana network');
      }

      // Process the deposit in the virtual wallet
      const result = await confirmDeposit(db, transactionId, solanaSignature);
      
      return {
        success: true,
        transaction: result,
        message: `Successfully processed deposit of ${amount} SOL`
      };
    } catch (error) {
      console.error('Process deposit error:', error);
      throw error;
    }
  }

  static async processWithdrawal(
    db: Db,
    userId: string,
    amount: number,
    userSolanaAddress: string,
    transactionId: string
  ) {
    try {
      // Create a transaction to send SOL to the user
      const userPublicKey = new PublicKey(userSolanaAddress);
      const platformPublicKey = this.platformWallet.publicKey;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: platformPublicKey,
          toPubkey: userPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Sign and send the transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.platformWallet]
      );

      // Update the virtual wallet transaction
      const result = await confirmWithdrawal(db, transactionId, signature);
      
      return {
        success: true,
        transaction: result,
        signature,
        message: `Successfully sent ${amount} SOL to ${userSolanaAddress}`
      };
    } catch (error) {
      console.error('Process withdrawal error:', error);
      throw error;
    }
  }

  static async processUserWithdrawal(
    db: Db,
    userId: string,
    amount: number,
    userSolanaAddress: string,
    transactionId: string
  ) {
    try {
      // Create a transaction to send SOL to the user
      const userPublicKey = new PublicKey(userSolanaAddress);
      const platformPublicKey = this.platformWallet.publicKey;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: platformPublicKey,
          toPubkey: userPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Sign and send the transaction
      const userSolSignature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.platformWallet]
      );

      // Update the virtual wallet transaction
      const result = await confirmWithdrawal(db, transactionId, userSolSignature);
      
      return {
        success: true,
        transaction: result,
        signature: userSolSignature,
        message: `Successfully sent ${amount} SOL to ${userSolanaAddress}`
      };
    } catch (error) {
      console.error('Process user withdrawal error:', error);
      throw error;
    }
  }
} 