import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Devnet connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function sendTestnetSol() {
  try {
    // Read wallet info from the generated file
    const walletInfoPath = path.join(__dirname, 'wallet-info.json');
    
    if (!fs.existsSync(walletInfoPath)) {
      console.log('❌ wallet-info.json not found. Please run generate-wallet.js first.');
      return;
    }

    const walletInfo = JSON.parse(fs.readFileSync(walletInfoPath, 'utf8'));
    
    // Create keypair from private key
    const platformKeypair = Keypair.fromSecretKey(
      new Uint8Array(walletInfo.privateKeyArray)
    );
    
    const recipientAddress = 'Hhb1bTpYhqQ8kSTyaXuHTb8zLyioaee9LuocNdLkkGvz';
    const amount = 0.5; // Send 0.5 SOL
    
    console.log('💰 Sending Testnet SOL...\n');
    console.log('From (Platform Wallet):', platformKeypair.publicKey.toString());
    console.log('To:', recipientAddress);
    console.log('Amount:', amount, 'SOL');
    
    // Check platform wallet balance
    const platformBalance = await connection.getBalance(platformKeypair.publicKey);
    console.log('Platform Wallet Balance:', platformBalance / LAMPORTS_PER_SOL, 'SOL');
    
    if (platformBalance < amount * LAMPORTS_PER_SOL) {
      console.log('❌ Insufficient balance in platform wallet');
      console.log('Current balance:', platformBalance / LAMPORTS_PER_SOL, 'SOL');
      console.log('Required:', amount, 'SOL');
      return;
    }
    
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: platformKeypair.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    
    console.log('\n🔄 Sending transaction...');
    
    // Send and confirm transaction
    const signature = await connection.sendTransaction(transaction, [platformKeypair]);
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Check new balances
    const newPlatformBalance = await connection.getBalance(platformKeypair.publicKey);
    const recipientBalance = await connection.getBalance(new PublicKey(recipientAddress));
    
    console.log('\n✅ Transaction successful!');
    console.log('Transaction Signature:', signature);
    console.log('Explorer URL: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    console.log('\nUpdated Balances:');
    console.log('Platform Wallet:', newPlatformBalance / LAMPORTS_PER_SOL, 'SOL');
    console.log('Recipient Wallet:', recipientBalance / LAMPORTS_PER_SOL, 'SOL');
    
  } catch (error) {
    console.error('❌ Error sending SOL:', error);
  }
}

sendTestnetSol(); 