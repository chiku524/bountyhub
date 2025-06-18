const fs = require('fs');
const path = require('path');

function main() {
  console.log('🚀 BountyBucks Quick Setup Guide');
  console.log('================================\n');

  // Load deployment info
  const deploymentPath = path.join(__dirname, 'bounty-bucks-deployment.json');
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment info not found. Please deploy the token first.');
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  console.log('✅ Token Deployed Successfully!');
  console.log('📍 Mint Address:', deployment.mint.address);
  console.log('💰 Symbol: BBUX');
  console.log('🎨 Logo: Ready (SVG format)');
  console.log('📄 Metadata: Ready (JSON format)\n');

  console.log('🎯 NEXT STEPS (5 minutes):\n');

  console.log('1️⃣ DEPLOY WEBSITE (2 minutes)');
  console.log('-----------------------------');
  console.log('✅ Logo already placed in public/logo.svg');
  console.log('✅ Metadata updated with website URL');
  console.log('🌐 Deploy to Vercel:');
  console.log('   - Push to GitHub');
  console.log('   - Connect to Vercel');
  console.log('   - Deploy automatically\n');

  console.log('2️⃣ REGISTER METADATA (3 minutes)');
  console.log('--------------------------------');
  console.log('🔗 Visit: https://sol-tools.tonic.foundation/token-metadata');
  console.log('👛 Connect your wallet');
  console.log('📝 Enter mint address:', deployment.mint.address);
  console.log('📄 Upload: bountybucks-metadata.json');
  console.log('✅ Confirm transaction (~0.001 SOL)\n');

  console.log('3️⃣ VERIFY SUCCESS');
  console.log('-----------------');
  console.log('🔍 Check: https://solscan.io/token/', deployment.mint.address);
  console.log('🔍 Check: https://birdeye.so/token/', deployment.mint.address);
  console.log('✅ Logo should appear on both sites\n');

  console.log('💰 COST: ~0.001 SOL (gas fee only)');
  console.log('⏱️  TIME: 5 minutes total\n');

  console.log('📋 FILES READY:');
  console.log('✅ bountybucks-logo.svg - Logo file');
  console.log('✅ bountybucks-metadata.json - Metadata');
  console.log('✅ public/logo.svg - Website logo');
  console.log('✅ Logo URL: https://bountybucks.vercel.app/logo.svg\n');

  console.log('🎉 You\'re all set! The logo is ready to use.');
  console.log('📞 Need help? Contact: bountybucks524@gmail.com');
}

main(); 