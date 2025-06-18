const { 
  Connection, 
  Keypair, 
  PublicKey, 
  sendAndConfirmTransaction, 
  Transaction 
} = require('@solana/web3.js');
const { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  TOKEN_PROGRAM_ID 
} = require('@solana/spl-token');

// Configuration
const TOKEN_CONFIG = {
  name: "Portal Token",
  symbol: "PORTAL",
  decimals: 9,
  initialSupply: 1000000000, // 1 billion tokens
  exchangeRate: 1000, // 1 SOL = 1000 PORTAL
  description: "Portal platform's native token for bounty rewards and platform activities"
};

async function createPortalToken() {
  try {
    // Connect to Solana devnet (for testing)
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    console.log('🔗 Connected to Solana devnet');
    
    // Generate a new keypair for the mint authority (platform wallet)
    const mintAuthority = Keypair.generate();
    const payer = Keypair.generate(); // This would be your actual wallet in production
    
    console.log('🔑 Generated mint authority:', mintAuthority.publicKey.toString());
    console.log('💰 Payer wallet:', payer.publicKey.toString());
    
    // Request airdrop for the payer (devnet only)
    console.log('🪂 Requesting airdrop for payer...');
    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * 1e9); // 2 SOL
    await connection.confirmTransaction(airdropSignature);
    console.log('✅ Airdrop received');
    
    // Create the token mint
    console.log('🏭 Creating token mint...');
    const mint = await createMint(
      connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      TOKEN_CONFIG.decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );
    
    console.log('✅ Token mint created:', mint.toString());
    
    // Create associated token account for the platform
    console.log('🏦 Creating platform token account...');
    const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      mintAuthority.publicKey
    );
    
    console.log('✅ Platform token account created:', platformTokenAccount.address.toString());
    
    // Mint initial supply to platform
    console.log(`💰 Minting ${TOKEN_CONFIG.initialSupply} tokens to platform...`);
    const mintSignature = await mintTo(
      connection,
      payer,
      mint,
      platformTokenAccount.address,
      mintAuthority,
      TOKEN_CONFIG.initialSupply * Math.pow(10, TOKEN_CONFIG.decimals)
    );
    
    console.log('✅ Initial supply minted');
    
    // Get token balance
    const balance = await connection.getTokenAccountBalance(platformTokenAccount.address);
    console.log('📊 Platform token balance:', balance.value.uiAmount);
    
    // Save token information
    const tokenInfo = {
      mint: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      platformTokenAccount: platformTokenAccount.address.toString(),
      payer: payer.publicKey.toString(),
      config: TOKEN_CONFIG,
      network: 'devnet'
    };
    
    console.log('\n🎉 Portal Token Created Successfully!');
    console.log('=====================================');
    console.log('Token Mint:', tokenInfo.mint);
    console.log('Mint Authority:', tokenInfo.mintAuthority);
    console.log('Platform Token Account:', tokenInfo.platformTokenAccount);
    console.log('Exchange Rate: 1 SOL =', TOKEN_CONFIG.exchangeRate, 'PORTAL');
    console.log('Initial Supply:', TOKEN_CONFIG.initialSupply.toLocaleString(), 'PORTAL');
    console.log('Network: Devnet');
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('portal-token-info.json', JSON.stringify(tokenInfo, null, 2));
    console.log('\n💾 Token information saved to portal-token-info.json');
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('- This is on devnet for testing');
    console.log('- Save the mint authority private key securely');
    console.log('- For mainnet, you\'ll need real SOL in the payer wallet');
    console.log('- The mint authority controls token supply');
    
    return tokenInfo;
    
  } catch (error) {
    console.error('❌ Error creating token:', error);
    throw error;
  }
}

// Run the token creation
createPortalToken()
  .then(() => {
    console.log('\n🚀 Token creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Token creation failed:', error);
    process.exit(1);
  }); 