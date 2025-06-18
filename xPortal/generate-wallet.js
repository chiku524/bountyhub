import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Generating Solana Platform Wallet...\n');

// Generate a new keypair
const keypair = Keypair.generate();

console.log('✅ New Solana Keypair Generated!\n');

console.log('📋 Wallet Information:');
console.log('Public Key (Address):', keypair.publicKey.toString());
console.log('Private Key (Base64):', Buffer.from(keypair.secretKey).toString('base64'));
console.log('Private Key (Array):', JSON.stringify(Array.from(keypair.secretKey)));

console.log('\n🔧 Environment Variables to add to your .env file:');
console.log('SOLANA_WALLET_PRIVATE_KEY=' + Buffer.from(keypair.secretKey).toString('base64'));
console.log('SOLANA_WALLET_ADDRESS=' + keypair.publicKey.toString());

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Keep your private key secure and never share it');
console.log('2. The private key above is for development/testing only');
console.log('3. For production, use a hardware wallet or secure key management');
console.log('4. Make sure to fund this wallet with SOL for transaction fees');

console.log('\n💰 Next Steps:');
console.log('1. Copy the environment variables above to your .env file');
console.log('2. Fund the wallet with some SOL for testing (you can use a faucet)');
console.log('3. Test the deposit functionality');

// Optionally save to a file (be careful with this in production)
const walletInfo = {
  publicKey: keypair.publicKey.toString(),
  privateKey: Buffer.from(keypair.secretKey).toString('base64'),
  privateKeyArray: Array.from(keypair.secretKey),
  generatedAt: new Date().toISOString()
};

fs.writeFileSync(
  path.join(__dirname, 'wallet-info.json'),
  JSON.stringify(walletInfo, null, 2)
);

console.log('\n💾 Wallet information saved to wallet-info.json');
console.log('⚠️  Delete this file after copying the information to your .env file!'); 