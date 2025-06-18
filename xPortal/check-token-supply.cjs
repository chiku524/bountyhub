const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint } = require('@solana/spl-token');
require('dotenv').config();

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TOKEN_MINT = 'HbLcoUfkeBPNrWs4w7PmkeS3FHbxB8DMPSe2G1cReCwH';
const INITIAL_SUPPLY = 1000000000; // 1 billion tokens
const TOKEN_DECIMALS = 9;

async function checkTokenSupply() {
  const connection = new Connection(SOLANA_RPC_URL);
  
  try {
    console.log('Checking PORTAL token supply...');
    console.log('Token mint:', TOKEN_MINT);
    
    // Get mint info
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const mintInfo = await getMint(connection, mintPubkey);
    
    const currentSupply = Number(mintInfo.supply) / Math.pow(10, TOKEN_DECIMALS);
    const burnedAmount = INITIAL_SUPPLY - currentSupply;
    const burnPercentage = (burnedAmount / INITIAL_SUPPLY) * 100;
    const remainingPercentage = 100 - burnPercentage;
    
    console.log('\n=== PORTAL TOKEN SUPPLY ===');
    console.log(`Initial Supply: ${INITIAL_SUPPLY.toLocaleString()} PORTAL`);
    console.log(`Current Supply: ${currentSupply.toLocaleString()} PORTAL`);
    console.log(`Burned Amount: ${burnedAmount.toLocaleString()} PORTAL`);
    console.log(`Burn Percentage: ${burnPercentage.toFixed(4)}%`);
    console.log(`Remaining Percentage: ${remainingPercentage.toFixed(4)}%`);
    console.log(`Mint Authority: ${mintInfo.mintAuthority?.toString()}`);
    console.log(`Decimals: ${mintInfo.decimals}`);
    
    // Calculate time estimates
    const monthlyBurnRate = 1; // Assume 1% per month (conservative)
    const monthsUntilLow = remainingPercentage > 10 ? (remainingPercentage - 10) / monthlyBurnRate : 0;
    const yearsUntilLow = monthsUntilLow / 12;
    
    console.log('\n=== SUPPLY PROJECTIONS ===');
    console.log(`Estimated months until 10% remaining: ${monthsUntilLow.toFixed(1)}`);
    console.log(`Estimated years until 10% remaining: ${yearsUntilLow.toFixed(1)}`);
    
    if (remainingPercentage <= 10) {
      console.log('\n⚠️  WARNING: Supply is running low! Consider governance action.');
    } else if (remainingPercentage <= 25) {
      console.log('\n⚠️  NOTICE: Supply is getting low. Monitor burn rates.');
    } else {
      console.log('\n✅ Supply is healthy for now.');
    }
    
  } catch (error) {
    console.error('Error checking token supply:', error);
  }
}

checkTokenSupply(); 