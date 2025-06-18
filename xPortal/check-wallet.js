const fs = require('fs');
const { Keypair, Connection, clusterApiUrl } = require('@solana/web3.js');

async function checkWallet() {
  try {
    console.log('🔍 Checking platform wallet...\n');

    // Check if wallet file exists
    if (!fs.existsSync('wallet-info.json')) {
      throw new Error('wallet-info.json not found');
    }

    // Read wallet data
    const walletData = JSON.parse(fs.readFileSync('wallet-info.json', 'utf8'));
    console.log('✅ Wallet file loaded successfully');

    // Check wallet structure
    console.log('📋 Wallet structure:');
    console.log('- Has publicKey:', !!walletData.publicKey);
    console.log('- Has secretKey:', !!walletData.secretKey);
    console.log('- Secret key length:', walletData.secretKey ? walletData.secretKey.length : 'N/A');

    // Try to create keypair
    let keypair;
    try {
      if (walletData.secretKey && Array.isArray(walletData.secretKey)) {
        keypair = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
      } else if (walletData.privateKeyArray && Array.isArray(walletData.privateKeyArray)) {
        keypair = Keypair.fromSecretKey(new Uint8Array(walletData.privateKeyArray));
      } else if (walletData.privateKey && typeof walletData.privateKey === 'string') {
        const privateKeyBytes = Buffer.from(walletData.privateKey, 'base64');
        keypair = Keypair.fromSecretKey(privateKeyBytes);
      } else {
        throw new Error('Invalid secret key format');
      }
    } catch (error) {
      console.log('❌ Error creating keypair:', error.message);
      console.log('💡 Trying alternative format...');
      
      // Try different formats
      if (walletData.privateKey && typeof walletData.privateKey === 'string') {
        try {
          // Try as base64
          const privateKeyBytes = Buffer.from(walletData.privateKey, 'base64');
          keypair = Keypair.fromSecretKey(privateKeyBytes);
        } catch (e) {
          try {
            // Try as hex
            const privateKeyBytes = Buffer.from(walletData.privateKey, 'hex');
            keypair = Keypair.fromSecretKey(privateKeyBytes);
          } catch (e2) {
            throw new Error('Could not parse secret key in any format');
          }
        }
      }
    }

    console.log('✅ Keypair created successfully');
    console.log('📍 Wallet address:', keypair.publicKey.toString());

    // Check balance on mainnet
    console.log('\n💰 Checking wallet balance...');
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / 1e9;
    
    console.log('💰 Balance:', balanceSOL, 'SOL');
    
    if (balanceSOL < 0.1) {
      console.log('⚠️  Warning: Low balance. Need at least 0.1 SOL for deployment.');
      console.log('💡 Consider adding more SOL to the wallet.');
    } else {
      console.log('✅ Sufficient balance for deployment');
    }

    // Check balance on devnet (for testing)
    console.log('\n🧪 Checking devnet balance...');
    const devnetConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const devnetBalance = await devnetConnection.getBalance(keypair.publicKey);
    const devnetBalanceSOL = devnetBalance / 1e9;
    
    console.log('💰 Devnet balance:', devnetBalanceSOL, 'SOL');

    console.log('\n✅ Wallet check completed successfully!');
    console.log('🚀 Ready for BountyBucks deployment');

    return {
      keypair,
      balance: balanceSOL,
      devnetBalance: devnetBalanceSOL,
      ready: balanceSOL >= 0.1
    };

  } catch (error) {
    console.error('❌ Wallet check failed:', error.message);
    
    if (error.message.includes('wallet-info.json not found')) {
      console.log('\n💡 To create a new wallet:');
      console.log('1. Run: node generate-wallet.js');
      console.log('2. Fund the wallet with SOL');
      console.log('3. Run this check again');
    }
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  checkWallet()
    .then(() => {
      console.log('\n🎉 Wallet is ready for deployment!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Wallet check failed');
      process.exit(1);
    });
}

module.exports = { checkWallet }; 