import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import portalTokenInfo from '../../portal-token-info';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const TOKEN_MINT = portalTokenInfo.mint;
const INITIAL_SUPPLY = portalTokenInfo.config.initialSupply;
const TOKEN_DECIMALS = portalTokenInfo.config.decimals;

export class TokenSupplyService {
  private static connection = new Connection(SOLANA_RPC_URL);

  /**
   * Get current token supply information
   */
  static async getSupplyInfo() {
    try {
      const mintPubkey = new PublicKey(TOKEN_MINT);
      const mintInfo = await getMint(this.connection, mintPubkey);
      
      const currentSupply = Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS);
      const burnedAmount = INITIAL_SUPPLY - currentSupply;
      const burnPercentage = (burnedAmount / INITIAL_SUPPLY) * 100;
      
      return {
        initialSupply: INITIAL_SUPPLY,
        currentSupply,
        burnedAmount,
        burnPercentage,
        mintAuthority: mintInfo.mintAuthority?.toString(),
        freezeAuthority: mintInfo.freezeAuthority?.toString(),
        decimals: mintInfo.decimals,
        isInitialized: mintInfo.isInitialized,
      };
    } catch (error) {
      console.error("Error getting supply info:", error);
      throw error;
    }
  }

  /**
   * Check if supply is running low (for future governance decisions)
   */
  static async isSupplyLow(thresholdPercentage: number = 10) {
    const supplyInfo = await this.getSupplyInfo();
    const remainingPercentage = (supplyInfo.currentSupply / supplyInfo.initialSupply) * 100;
    return remainingPercentage <= thresholdPercentage;
  }

  /**
   * Get supply statistics for dashboard
   */
  static async getSupplyStats() {
    const supplyInfo = await this.getSupplyInfo();
    
    return {
      ...supplyInfo,
      // Add additional metrics
      tokensPerUser: supplyInfo.currentSupply / 1000, // Assuming 1000 users, adjust as needed
      dailyBurnRate: 0, // Would need to track daily burns
      weeklyBurnRate: 0, // Would need to track weekly burns
      estimatedDaysUntilLow: this.estimateDaysUntilLow(supplyInfo.burnPercentage),
    };
  }

  /**
   * Estimate days until supply runs low based on current burn rate
   */
  private static estimateDaysUntilLow(currentBurnPercentage: number) {
    // This is a simplified calculation
    // In a real implementation, you'd track actual burn rates over time
    const remainingPercentage = 100 - currentBurnPercentage;
    const lowSupplyThreshold = 10; // 10% remaining
    
    if (remainingPercentage <= lowSupplyThreshold) {
      return 0; // Already low
    }
    
    // Assume 1% burn per month (very conservative estimate)
    const monthlyBurnRate = 1;
    const monthsUntilLow = (remainingPercentage - lowSupplyThreshold) / monthlyBurnRate;
    
    return Math.floor(monthsUntilLow * 30); // Convert to days
  }

  /**
   * Log supply information for monitoring
   */
  static async logSupplyInfo() {
    try {
      const supplyInfo = await this.getSupplyInfo();
      console.log("=== TOKEN SUPPLY INFO ===");
      console.log(`Initial Supply: ${supplyInfo.initialSupply.toLocaleString()} PORTAL`);
      console.log(`Current Supply: ${supplyInfo.currentSupply.toLocaleString()} PORTAL`);
      console.log(`Burned Amount: ${supplyInfo.burnedAmount.toLocaleString()} PORTAL`);
      console.log(`Burn Percentage: ${supplyInfo.burnPercentage.toFixed(2)}%`);
      console.log(`Mint Authority: ${supplyInfo.mintAuthority}`);
      console.log("=========================");
    } catch (error) {
      console.error("Error logging supply info:", error);
    }
  }
} 