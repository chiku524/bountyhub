const fs = require('fs');
const path = require('path');

function loadDeploymentInfo() {
  const deploymentPath = path.join(__dirname, 'bounty-bucks-deployment.json');
  if (!fs.existsSync(deploymentPath)) {
    throw new Error('Deployment info not found. Please deploy the token first.');
  }
  return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
}

function setupMetadataGuide() {
  const deployment = loadDeploymentInfo();
  
  console.log('🖼️ BountyBucks Metadata Setup Guide');
  console.log('=====================================');
  console.log('Token Address:', deployment.mint.address);
  console.log('Token Symbol:', 'BBUX');
  console.log('=====================================\n');

  console.log('📋 Step-by-Step Metadata Setup:\n');

  console.log('1️⃣ UPLOAD LOGO TO IPFS/ARWEAVE');
  console.log('-------------------------------');
  console.log('Option A: NFT.Storage (Free)');
  console.log('- Visit: https://nft.storage/');
  console.log('- Upload: bountybucks-logo.svg');
  console.log('- Copy the IPFS hash (starts with ipfs://)');
  console.log('- Convert to HTTP: https://ipfs.io/ipfs/YOUR_HASH\n');

  console.log('Option B: Arweave (Permanent)');
  console.log('- Visit: https://arweave.net/');
  console.log('- Upload: bountybucks-logo.svg');
  console.log('- Copy the Arweave ID\n');

  console.log('Option C: Your Website');
  console.log('- Upload logo to: https://bountybucks.vercel.app/logo.png');
  console.log('- Upload SVG to: https://bountybucks.vercel.app/logo.svg\n');

  console.log('2️⃣ UPDATE METADATA JSON');
  console.log('------------------------');
  console.log('- Open: bountybucks-metadata.json');
  console.log('- Update "image" field with your logo URL');
  console.log('- Update "external_url" if needed');
  console.log('- Save the updated JSON\n');

  console.log('3️⃣ REGISTER METADATA ON SOLANA');
  console.log('-------------------------------');
  console.log('Option A: Solana Tools');
  console.log('- Visit: https://sol-tools.tonic.foundation/token-metadata');
  console.log('- Connect your wallet');
  console.log('- Enter mint address:', deployment.mint.address);
  console.log('- Upload metadata JSON');
  console.log('- Confirm transaction\n');

  console.log('Option B: Metaplex CLI');
  console.log('- Install: npm install -g @metaplex-foundation/mpl-token-metadata-cli');
  console.log('- Run: metaplex create-metadata --mint', deployment.mint.address);
  console.log('- Follow prompts to upload metadata\n');

  console.log('4️⃣ VERIFY METADATA');
  console.log('------------------');
  console.log('- Check: https://solscan.io/token/', deployment.mint.address);
  console.log('- Verify logo and description appear');
  console.log('- Check: https://birdeye.so/token/', deployment.mint.address);
  console.log('- Ensure metadata is visible\n');

  console.log('5️⃣ UPDATE TOKEN LISTS');
  console.log('----------------------');
  console.log('Solana Token List:');
  console.log('- Fork: https://github.com/solana-labs/token-list');
  console.log('- Add your token to tokens/solana/mainnet-beta.json');
  console.log('- Submit pull request\n');

  console.log('Jupiter Token List:');
  console.log('- Visit: https://station.jup.ag/');
  console.log('- Submit token for listing');
  console.log('- Provide mint address and metadata\n');

  console.log('💰 COST ESTIMATES');
  console.log('=================');
  console.log('IPFS Upload: Free');
  console.log('Arweave Upload: ~$0.01-0.10');
  console.log('Metadata Registration: ~0.001 SOL');
  console.log('Total: ~$0.01-0.10 + gas fees\n');

  console.log('🔒 SECURITY TIPS');
  console.log('================');
  console.log('✅ Use your platform wallet for metadata registration');
  console.log('✅ Keep logo files backed up');
  console.log('✅ Verify metadata after registration');
  console.log('✅ Test logo display on multiple platforms\n');

  console.log('📊 SUCCESS METRICS');
  console.log('==================');
  console.log('✅ Logo displays on Solscan');
  console.log('✅ Logo displays on Birdeye');
  console.log('✅ Metadata shows correct information');
  console.log('✅ Token appears in Jupiter search\n');

  return deployment;
}

function generateQuickCommands() {
  const deployment = loadDeploymentInfo();
  
  console.log('⚡ Quick Commands:\n');
  
  console.log('// Check token metadata');
  console.log(`spl-token display ${deployment.mint.address} --url mainnet-beta\n`);
  
  console.log('// View token on Solscan');
  console.log(`open https://solscan.io/token/${deployment.mint.address}\n`);
  
  console.log('// View token on Birdeye');
  console.log(`open https://birdeye.so/token/${deployment.mint.address}\n`);
  
  console.log('// Add to Jupiter');
  console.log(`open https://station.jup.ag/token/${deployment.mint.address}\n`);
}

function main() {
  try {
    console.log('🖼️ BountyBucks Metadata Setup\n');
    
    // Load deployment info
    const deployment = loadDeploymentInfo();
    
    // Show setup guide
    setupMetadataGuide();
    
    // Generate commands
    generateQuickCommands();
    
    console.log('✅ Metadata setup guide generated successfully!');
    console.log('📞 Need help? Contact: bountybucks524@gmail.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure to deploy the token first using: node deploy-bounty-bucks.cjs');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupMetadataGuide, loadDeploymentInfo }; 