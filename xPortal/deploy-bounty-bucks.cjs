const { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction,
  SystemProgram,
  clusterApiUrl 
} = require('@solana/web3.js');
const { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer,
  getAccount,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Configuration
const TOKEN_CONFIG = {
  name: "BountyBucks",
  symbol: "BBUX",
  decimals: 9,
  totalSupply: 1000000000, // 1 billion tokens
  description: "BountyBucks - The native token for Portal's decentralized bounty platform"
};

// Network configuration
const NETWORK = 'mainnet-beta';
const RPC_URL = clusterApiUrl(NETWORK);

async function deployBountyBucks() {
  console.log('🚀 Starting BountyBucks deployment to Solana mainnet...');
  console.log('Network:', NETWORK);
  console.log('RPC URL:', RPC_URL);

  try {
    // Initialize connection
    const connection = new Connection(RPC_URL, 'confirmed');
    console.log('✅ Connected to Solana mainnet');

    // Load platform wallet
    const platformWalletPath = path.join(__dirname, 'wallet-info.json');
    if (!fs.existsSync(platformWalletPath)) {
      throw new Error('Platform wallet not found. Please ensure wallet-info.json exists.');
    }

    const walletData = JSON.parse(fs.readFileSync(platformWalletPath, 'utf8'));
    
    // Handle different wallet formats
    let platformKeypair;
    if (walletData.secretKey && Array.isArray(walletData.secretKey)) {
      platformKeypair = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
    } else if (walletData.privateKeyArray && Array.isArray(walletData.privateKeyArray)) {
      platformKeypair = Keypair.fromSecretKey(new Uint8Array(walletData.privateKeyArray));
    } else if (walletData.privateKey && typeof walletData.privateKey === 'string') {
      const privateKeyBytes = Buffer.from(walletData.privateKey, 'base64');
      platformKeypair = Keypair.fromSecretKey(privateKeyBytes);
    } else {
      throw new Error('Invalid wallet format. Expected secretKey, privateKeyArray, or privateKey.');
    }
    
    console.log('✅ Platform wallet loaded');
    console.log('Platform wallet address:', platformKeypair.publicKey.toString());

    // Check wallet balance
    const balance = await connection.getBalance(platformKeypair.publicKey);
    const balanceSOL = balance / 1e9;
    console.log('💰 Platform wallet balance:', balanceSOL, 'SOL');

    if (balanceSOL < 0.1) {
      throw new Error('Insufficient SOL balance. Need at least 0.1 SOL for deployment.');
    }

    // Calculate rent for mint account
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);
    console.log('🏠 Mint account rent:', mintRent / 1e9, 'SOL');

    // Create mint account (allocate and fund)
    console.log('🔨 Creating mint account...');
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;

    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: platformKeypair.publicKey,
      newAccountPubkey: mintPublicKey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    });

    const initMintIx = createInitializeMintInstruction(
      mintPublicKey,
      TOKEN_CONFIG.decimals,
      platformKeypair.publicKey,
      platformKeypair.publicKey,
      TOKEN_PROGRAM_ID
    );

    const createMintTransaction = new Transaction().add(
      createMintAccountIx,
      initMintIx
    );

    const createMintSignature = await sendAndConfirmTransaction(
      connection,
      createMintTransaction,
      [platformKeypair, mintKeypair],
      { commitment: 'confirmed' }
    );

    console.log('✅ Mint account created');
    console.log('Mint address:', mintPublicKey.toString());
    console.log('Transaction signature:', createMintSignature);

    // Create platform token account
    console.log('🏦 Creating platform token account...');
    const platformTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      platformKeypair,
      mintPublicKey,
      platformKeypair.publicKey
    );

    console.log('✅ Platform token account created');
    console.log('Platform token account:', platformTokenAccount.address.toString());

    // Mint initial supply to platform
    console.log('🪙 Minting initial supply...');
    const mintToSignature = await mintTo(
      connection,
      platformKeypair,
      mintPublicKey,
      platformTokenAccount.address,
      platformKeypair,
      TOKEN_CONFIG.totalSupply * Math.pow(10, TOKEN_CONFIG.decimals)
    );

    console.log('✅ Initial supply minted');
    console.log('Mint transaction signature:', mintToSignature);

    // Verify token account balance
    const tokenAccountInfo = await getAccount(connection, platformTokenAccount.address);
    const tokenBalance = Number(tokenAccountInfo.amount) / Math.pow(10, TOKEN_CONFIG.decimals);
    console.log('💰 Platform token balance:', tokenBalance.toLocaleString(), 'BBUX');

    // Create token metadata
    const tokenMetadata = {
      name: TOKEN_CONFIG.name,
      symbol: TOKEN_CONFIG.symbol,
      description: TOKEN_CONFIG.description,
      image: "https://portal.ask/logo.png", // Update with your logo URL
      attributes: [
        {
          trait_type: "Total Supply",
          value: TOKEN_CONFIG.totalSupply.toLocaleString()
        },
        {
          trait_type: "Decimals",
          value: TOKEN_CONFIG.decimals
        },
        {
          trait_type: "Network",
          value: NETWORK
        }
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://portal.ask/logo.png"
          }
        ],
        category: "image"
      }
    };

    // Save deployment info
    const deploymentInfo = {
      network: NETWORK,
      deploymentDate: new Date().toISOString(),
      mint: {
        address: mintPublicKey.toString(),
        decimals: TOKEN_CONFIG.decimals,
        supply: TOKEN_CONFIG.totalSupply,
        mintAuthority: platformKeypair.publicKey.toString(),
        freezeAuthority: platformKeypair.publicKey.toString()
      },
      platformTokenAccount: platformTokenAccount.address.toString(),
      platformWallet: platformKeypair.publicKey.toString(),
      transactions: {
        createMint: createMintSignature,
        mintTo: mintToSignature
      },
      metadata: tokenMetadata
    };

    // Save to file
    const deploymentPath = path.join(__dirname, 'bounty-bucks-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('📄 Deployment info saved to:', deploymentPath);

    // Update portal-token-info.ts
    updateTokenInfo(deploymentInfo);

    console.log('\n🎉 BountyBucks deployment successful!');
    console.log('=====================================');
    console.log('Token Name:', TOKEN_CONFIG.name);
    console.log('Token Symbol:', TOKEN_CONFIG.symbol);
    console.log('Mint Address:', mintPublicKey.toString());
    console.log('Total Supply:', TOKEN_CONFIG.totalSupply.toLocaleString(), 'BBUX');
    console.log('Platform Token Account:', platformTokenAccount.address.toString());
    console.log('Network:', NETWORK);
    console.log('=====================================');

    console.log('\n📋 Next Steps:');
    console.log('1. Add liquidity to Raydium/Orca');
    console.log('2. List on Jupiter aggregator');
    console.log('3. Update your app with the new mint address');
    console.log('4. Create token metadata on Solana');
    console.log('5. Announce launch to community');

    return deploymentInfo;

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

function updateTokenInfo(deploymentInfo) {
  const tokenInfoPath = path.join(__dirname, 'portal-token-info.ts');
  const tokenInfoContent = `const portalTokenInfo = {
  mint: "${deploymentInfo.mint.address}",
  mintAuthority: "${deploymentInfo.mint.mintAuthority}",
  platformTokenAccount: "${deploymentInfo.platformTokenAccount}",
  payer: "${deploymentInfo.platformWallet}",
  config: {
    name: "${TOKEN_CONFIG.name}",
    symbol: "${TOKEN_CONFIG.symbol}",
    decimals: ${TOKEN_CONFIG.decimals},
    initialSupply: ${TOKEN_CONFIG.totalSupply},
    exchangeRate: 1000,
    description: "${TOKEN_CONFIG.description}"
  },
  tokenSale: {
    totalTokensForSale: 200000000, // 20% of supply (200M tokens)
    pricePerToken: 0.001, // SOL per BBUX
    minInvestment: 0.1, // SOL
    maxInvestment: 10, // SOL
    vestingPeriod: 12, // months
    cliffPeriod: 3, // months
    softCap: 100, // SOL
    hardCap: 500, // SOL
  },
  allocation: {
    publicSale: 20, // 20% - 200M tokens
    team: 15, // 15% - 150M tokens (2-year vesting)
    advisors: 5, // 5% - 50M tokens (1-year vesting)
    marketing: 10, // 10% - 100M tokens
    development: 20, // 20% - 200M tokens
    liquidity: 15, // 15% - 150M tokens
    community: 10, // 10% - 100M tokens
    reserve: 5, // 5% - 50M tokens
  },
  network: "mainnet-beta"
};

export default portalTokenInfo;`;

  fs.writeFileSync(tokenInfoPath, tokenInfoContent);
  console.log('✅ Updated portal-token-info.ts with mainnet addresses');
}

// Run deployment if called directly
if (require.main === module) {
  deployBountyBucks()
    .then(() => {
      console.log('✅ Deployment completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployBountyBucks }; 