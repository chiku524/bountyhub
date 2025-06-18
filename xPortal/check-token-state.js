const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint, getAccount, getAssociatedTokenAddress } = require('@solana/spl-token');
require('dotenv').config();

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TOKEN_MINT = 'HbLcoUfkeBPNrWs4w7PmkeS3FHbxB8DMPSe2G1cReCwH';
const PLATFORM_WALLET_ADDRESS = 'e6EdfgpEdo48zUKFC18cADxTqgbt68JE8uDjAgdCzkp';

async function checkTokenState() {
  const connection = new Connection(SOLANA_RPC_URL);
  
  try {
    console.log('Checking token state...');
    console.log('Token mint:', TOKEN_MINT);
    console.log('Platform wallet:', PLATFORM_WALLET_ADDRESS);
    
    // Check mint info
    const mintPubkey = new PublicKey(TOKEN_MINT);
    const mintInfo = await getMint(connection, mintPubkey);
    
    console.log('\nMint Info:');
    console.log('Mint authority:', mintInfo.mintAuthority?.toString());
    console.log('Freeze authority:', mintInfo.freezeAuthority?.toString());
    console.log('Decimals:', mintInfo.decimals);
    console.log('Supply:', mintInfo.supply.toString());
    
    // Check if platform wallet is mint authority
    const isMintAuthority = mintInfo.mintAuthority?.toString() === PLATFORM_WALLET_ADDRESS;
    console.log('\nIs platform wallet mint authority?', isMintAuthority);
    
    // Check platform wallet balance
    const platformBalance = await connection.getBalance(new PublicKey(PLATFORM_WALLET_ADDRESS));
    console.log('\nPlatform wallet SOL balance:', platformBalance / 1e9, 'SOL');
    
    // Check if platform has a token account
    try {
      const platformTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        new PublicKey(PLATFORM_WALLET_ADDRESS)
      );
      
      const tokenAccountInfo = await getAccount(connection, platformTokenAccount);
      console.log('\nPlatform token account:', platformTokenAccount.toString());
      console.log('Platform token balance:', tokenAccountInfo.amount.toString());
    } catch (error) {
      console.log('\nPlatform token account not found or error:', error.message);
    }
    
  } catch (error) {
    console.error('Error checking token state:', error);
  }
}

checkTokenState(); 