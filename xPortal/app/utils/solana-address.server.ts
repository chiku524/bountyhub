import { Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import bountyBucksInfo from '../../bounty-bucks-info.json';

const TOKEN_MINT = bountyBucksInfo.mint;

export class SolanaAddressService {
  /**
   * Generate a new Solana keypair for a user
   */
  static generateUserKeypair(): { keypair: Keypair; address: string } {
    const keypair = Keypair.generate();
    return {
      keypair,
      address: keypair.publicKey.toString(),
    };
  }

  /**
   * Get the associated token account address for a user's Solana address
   */
  static async getUserTokenAccountAddress(solanaAddress: string): Promise<string> {
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const userPubkey = new PublicKey(solanaAddress);
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintPubkey,
      userPubkey
    );

    return associatedTokenAddress.toString();
  }

  /**
   * Generate both Solana address and token account address for a new user
   */
  static async generateUserAddresses(): Promise<{
    solanaAddress: string;
    tokenAccountAddress: string;
  }> {
    const { address: solanaAddress } = this.generateUserKeypair();
    const tokenAccountAddress = await this.getUserTokenAccountAddress(solanaAddress);

    return {
      solanaAddress,
      tokenAccountAddress,
    };
  }

  /**
   * Validate a Solana address format
   */
  static isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
} 