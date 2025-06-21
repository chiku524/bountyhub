import { PublicKey } from "@solana/web3.js";
import bountyBucksInfo from '../../bounty-bucks-info.json';

// Function to get RPC URL from env or fallback
function getSolanaRpcUrl(env: any) {
  return env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
}

const TOKEN_MINT = new PublicKey(bountyBucksInfo.mint);
const INITIAL_SUPPLY = 1000000000; // 1 billion tokens
const TOKEN_DECIMALS = 9; // From the attributes in the JSON

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

function parseMintInfo(data: string) {
  // Data is base64 encoded, decode and parse according to SPL Token Mint layout
  // See: https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/state.rs
  const buffer = Buffer.from(data, 'base64');
  // Supply: bytes 36-44 (u64 LE)
  const supply = buffer.readBigUInt64LE(36);
  // Decimals: byte 44 (u8)
  const decimals = buffer.readUInt8(44);
  // Mint authority: bytes 0-32 (Pubkey, 32 bytes)
  const mintAuthorityOption = buffer.readUInt8(0 + 32);
  const mintAuthority = mintAuthorityOption ? new PublicKey(buffer.slice(0, 32)).toString() : null;
  // Freeze authority: bytes 45-77 (Pubkey, 32 bytes)
  const freezeAuthorityOption = buffer.readUInt8(45 + 32);
  const freezeAuthority = freezeAuthorityOption ? new PublicKey(buffer.slice(45, 77)).toString() : null;
  // isInitialized: byte 108 (u8)
  const isInitialized = !!buffer.readUInt8(108);
  return { supply, decimals, mintAuthority, freezeAuthority, isInitialized };
}

export class TokenSupplyService {
  /**
   * Get current token supply information
   */
  static async getSupplyInfo(env: any) {
    try {
      const rpcUrl = getSolanaRpcUrl(env);
      // Use getAccountInfo to fetch the raw mint account data
      const result = await solanaRpc('getAccountInfo', [TOKEN_MINT.toBase58(), { encoding: 'base64' }], rpcUrl);
      const data = result.value?.data?.[0];
      if (!data) throw new Error('No mint data found');
      const mintInfo = parseMintInfo(data);
      const currentSupply = Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS);
      const burnedAmount = INITIAL_SUPPLY - currentSupply;
      const burnPercentage = (burnedAmount / INITIAL_SUPPLY) * 100;
      return {
        initialSupply: INITIAL_SUPPLY,
        currentSupply,
        burnedAmount,
        burnPercentage,
        mintAuthority: mintInfo.mintAuthority,
        freezeAuthority: mintInfo.freezeAuthority,
        decimals: mintInfo.decimals,
        isInitialized: mintInfo.isInitialized,
      };
    } catch (error) {
      console.error("Error getting supply info:", error);
      // If it's a network error, return fallback data
      if (error instanceof Error && (
        error.message.includes('timeout') || 
        error.message.includes('connection') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        console.log("Network error detected, returning fallback supply data");
        return {
          initialSupply: INITIAL_SUPPLY,
          currentSupply: INITIAL_SUPPLY,
          burnedAmount: 0,
          burnPercentage: 0,
          mintAuthority: null,
          freezeAuthority: null,
          decimals: TOKEN_DECIMALS,
          isInitialized: true,
        };
      }
      throw error;
    }
  }

  /**
   * Check if supply is running low (for future governance decisions)
   */
  static async isSupplyLow(env: any, thresholdPercentage: number = 10) {
    const supplyInfo = await this.getSupplyInfo(env);
    const remainingPercentage = (supplyInfo.currentSupply / supplyInfo.initialSupply) * 100;
    return remainingPercentage <= thresholdPercentage;
  }

  /**
   * Get supply statistics for dashboard
   */
  static async getSupplyStats(env: any) {
    const supplyInfo = await this.getSupplyInfo(env);
    
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
  static async logSupplyInfo(env: any) {
    try {
      const supplyInfo = await this.getSupplyInfo(env);
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