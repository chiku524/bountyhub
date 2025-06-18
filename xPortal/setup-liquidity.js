const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Load deployment info
function loadDeploymentInfo() {
  const deploymentPath = path.join(__dirname, 'bounty-bucks-deployment.json');
  if (!fs.existsSync(deploymentPath)) {
    throw new Error('Deployment info not found. Please deploy the token first.');
  }
  return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
}

// Liquidity pool setup guide
function setupLiquidityGuide() {
  const deployment = loadDeploymentInfo();
  
  console.log('🌊 BountyBucks Liquidity Setup Guide');
  console.log('=====================================');
  console.log('Token Address:', deployment.mint.address);
  console.log('Token Symbol:', 'BBUX');
  console.log('Platform Wallet:', deployment.platformWallet);
  console.log('=====================================\n');

  console.log('📋 Step-by-Step Liquidity Setup:\n');

  console.log('1️⃣ RAYDIUM LIQUIDITY POOL');
  console.log('------------------------');
  console.log('Visit: https://raydium.io/liquidity/create');
  console.log('Token A: BBUX (', deployment.mint.address, ')');
  console.log('Token B: SOL (So11111111111111111111111111111111111111112)');
  console.log('Initial BBUX: 100,000,000 BBUX');
  console.log('Initial SOL: 100 SOL');
  console.log('Fee: 0.25%');
  console.log('Estimated Value: $10,000\n');

  console.log('2️⃣ ORCA LIQUIDITY POOL');
  console.log('----------------------');
  console.log('Visit: https://www.orca.so/pools');
  console.log('Token A: BBUX (', deployment.mint.address, ')');
  console.log('Token B: USDC (EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)');
  console.log('Initial BBUX: 50,000,000 BBUX');
  console.log('Initial USDC: 5,000 USDC');
  console.log('Fee: 0.3%');
  console.log('Estimated Value: $5,000\n');

  console.log('3️⃣ JUPITER LISTING');
  console.log('------------------');
  console.log('Visit: https://station.jup.ag/');
  console.log('Submit token for listing');
  console.log('Token address:', deployment.mint.address);
  console.log('Liquidity requirement: $10K+ in pools\n');

  console.log('4️⃣ BIRDEYE TRACKING');
  console.log('-------------------');
  console.log('Visit: https://birdeye.so/');
  console.log('Submit token for tracking');
  console.log('Token address:', deployment.mint.address);
  console.log('Social links: Add your Twitter/Discord\n');

  console.log('💰 LIQUIDITY ALLOCATION');
  console.log('=======================');
  console.log('Total BBUX for Liquidity: 150,000,000 BBUX (15% of supply)');
  console.log('Raydium Pool: 100,000,000 BBUX + 100 SOL');
  console.log('Orca Pool: 50,000,000 BBUX + 5,000 USDC');
  console.log('Total Value: $15,000\n');

  console.log('🔒 SECURITY CONSIDERATIONS');
  console.log('==========================');
  console.log('✅ Use multisig wallet for LP tokens');
  console.log('✅ Lock liquidity for 6-12 months');
  console.log('✅ Monitor pool health regularly');
  console.log('✅ Have emergency withdrawal plan');
  console.log('✅ Backup all wallet keys securely\n');

  console.log('📊 SUCCESS METRICS');
  console.log('==================');
  console.log('Day 1: $10K+ liquidity added');
  console.log('Week 1: $1K+ daily trading volume');
  console.log('Month 1: $10K+ daily trading volume');
  console.log('Target: $100K+ market cap\n');

  console.log('🚀 NEXT STEPS AFTER LIQUIDITY');
  console.log('=============================');
  console.log('1. Announce launch on social media');
  console.log('2. Update website with token info');
  console.log('3. Submit to token aggregators');
  console.log('4. Start community building');
  console.log('5. Plan token sale launch');
  console.log('6. Develop staking pools\n');

  return deployment;
}

// Generate liquidity setup commands
function generateLiquidityCommands() {
  const deployment = loadDeploymentInfo();
  
  console.log('⚡ Quick Setup Commands:\n');
  
  console.log('// Check token balance');
  console.log(`spl-token balance ${deployment.mint.address} --url mainnet-beta\n`);
  
  console.log('// Transfer tokens to liquidity wallet');
  console.log(`spl-token transfer ${deployment.mint.address} <LIQUIDITY_WALLET> 100000000 --url mainnet-beta\n`);
  
  console.log('// Create token account for liquidity wallet');
  console.log(`spl-token create-account ${deployment.mint.address} --url mainnet-beta\n`);
  
  console.log('// Verify token account');
  console.log(`spl-token accounts --url mainnet-beta\n`);
}

// Main function
function main() {
  try {
    console.log('🚀 BountyBucks Liquidity Setup\n');
    
    // Load deployment info
    const deployment = loadDeploymentInfo();
    
    // Show setup guide
    setupLiquidityGuide();
    
    // Generate commands
    generateLiquidityCommands();
    
    console.log('✅ Liquidity setup guide generated successfully!');
    console.log('📞 Need help? Contact: nicochikuji@gmail.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure to deploy the token first using: node deploy-bounty-bucks.js');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupLiquidityGuide, loadDeploymentInfo }; 