import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function fundWallet() {
  try {
    // Read wallet info from the generated file
    const walletInfoPath = path.join(__dirname, 'wallet-info.json');
    
    if (!fs.existsSync(walletInfoPath)) {
      console.log('❌ wallet-info.json not found. Please run generate-wallet.js first.');
      return;
    }

    const walletInfo = JSON.parse(fs.readFileSync(walletInfoPath, 'utf8'));
    const walletAddress = walletInfo.publicKey;
    
    console.log('💰 Funding Platform Wallet...\n');
    console.log('Wallet Address:', walletAddress);
    
    // Check current balance
    const balance = await connection.getBalance(new PublicKey(walletAddress));
    console.log('Current Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    
    if (balance > 0) {
      console.log('✅ Wallet already has SOL balance!');
      return;
    }
    
    console.log('\n🔄 Requesting SOL from devnet faucet...');
    
    // Request SOL from faucet
    const signature = await connection.requestAirdrop(
      new PublicKey(walletAddress),
      2 * LAMPORTS_PER_SOL // Request 2 SOL
    );
    
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Check new balance
    const newBalance = await connection.getBalance(new PublicKey(walletAddress));
    console.log('\n✅ Funding successful!');
    console.log('New Balance:', newBalance / LAMPORTS_PER_SOL, 'SOL');
    console.log('Transaction Signature:', signature);
    
    console.log('\n🎉 Your platform wallet is now funded and ready for testing!');
    
  } catch (error) {
    console.error('❌ Error funding wallet:', error.message);
    
    if (error.message.includes('429')) {
      console.log('\n💡 Rate limit exceeded. Try again in a few minutes.');
    } else if (error.message.includes('insufficient')) {
      console.log('\n💡 Insufficient funds in faucet. Try again later.');
    }
  }
}

// Alternative manual funding instructions
function showManualInstructions() {
  console.log('\n📋 Manual Funding Instructions:');
  console.log('If the automatic funding fails, you can manually fund your wallet:');
  console.log('\n1. Visit Solana Devnet Faucet:');
  console.log('   https://faucet.solana.com/');
  console.log('\n2. Select "Devnet"');
  console.log('\n3. Enter your wallet address:');
  
  const walletInfoPath = path.join(__dirname, 'wallet-info.json');
  if (fs.existsSync(walletInfoPath)) {
    const walletInfo = JSON.parse(fs.readFileSync(walletInfoPath, 'utf8'));
    console.log('   ' + walletInfo.publicKey);
  }
  
  console.log('\n4. Request 2 SOL');
  console.log('\n5. Wait for confirmation and try the deposit feature again!');
}

// Run the funding
fundWallet().then(() => {
  showManualInstructions();
}).catch(console.error); 