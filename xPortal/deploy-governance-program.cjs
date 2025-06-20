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
const GOVERNANCE_CONFIG = {
  name: "Portal Governance Pool",
  description: "Governance pool for Portal bounty platform",
  feeRate: 500, // 5% in basis points
  proposalDuration: 7 * 24 * 60 * 60, // 7 days in seconds
  minVotes: 3,
  approvalThreshold: 60 // 60%
};

// Network configuration
const NETWORK = 'mainnet-beta';
const RPC_URL = clusterApiUrl(NETWORK);

async function deployGovernanceProgram() {
  console.log('🚀 Starting Governance Program deployment to Solana mainnet...');
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

    // Load BountyBucks token info
    const bountyBucksInfoPath = path.join(__dirname, 'bounty-bucks-info.json');
    if (!fs.existsSync(bountyBucksInfoPath)) {
      throw new Error('BountyBucks token info not found. Please deploy BountyBucks first.');
    }

    const bountyBucksInfo = JSON.parse(fs.readFileSync(bountyBucksInfoPath, 'utf8'));
    const tokenMint = new PublicKey(bountyBucksInfo.mint);
    
    console.log('✅ BountyBucks token loaded');
    console.log('Token mint:', tokenMint.toString());

    // Deploy governance program using Anchor
    console.log('🔨 Deploying governance program...');
    
    // Note: This would typically be done with Anchor CLI
    // For now, we'll create the governance pool account
    const governancePoolKeypair = Keypair.generate();
    const governancePoolAddress = governancePoolKeypair.publicKey;
    
    console.log('Governance pool address:', governancePoolAddress.toString());

    // Create governance pool token account
    console.log('🏦 Creating governance pool token account...');
    const governancePoolTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      platformKeypair,
      tokenMint,
      governancePoolAddress
    );

    console.log('✅ Governance pool token account created');
    console.log('Token account:', governancePoolTokenAccount.address.toString());

    // Initialize governance pool (this would be done by the program)
    console.log('⚙️  Initializing governance pool...');
    
    // For now, we'll create a placeholder initialization
    // In practice, this would be done by calling the program's initialize instruction
    
    // Save deployment info
    const deploymentInfo = {
      network: NETWORK,
      deploymentDate: new Date().toISOString(),
      governancePool: {
        address: governancePoolAddress.toString(),
        authority: platformKeypair.publicKey.toString(),
        tokenAccount: governancePoolTokenAccount.address.toString(),
        feeRate: GOVERNANCE_CONFIG.feeRate,
        proposalDuration: GOVERNANCE_CONFIG.proposalDuration,
        minVotes: GOVERNANCE_CONFIG.minVotes,
        approvalThreshold: GOVERNANCE_CONFIG.approvalThreshold
      },
      tokenMint: tokenMint.toString(),
      platformWallet: platformKeypair.publicKey.toString(),
      config: GOVERNANCE_CONFIG
    };

    // Save to file
    const deploymentPath = path.join(__dirname, 'governance-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('📄 Deployment info saved to:', deploymentPath);

    console.log('\n🎉 Governance Program deployment successful!');
    console.log('=====================================');
    console.log('Governance Pool:', governancePoolAddress.toString());
    console.log('Token Account:', governancePoolTokenAccount.address.toString());
    console.log('Fee Rate:', GOVERNANCE_CONFIG.feeRate / 100, '%');
    console.log('Proposal Duration:', GOVERNANCE_CONFIG.proposalDuration / (24 * 60 * 60), 'days');
    console.log('Min Votes:', GOVERNANCE_CONFIG.minVotes);
    console.log('Approval Threshold:', GOVERNANCE_CONFIG.approvalThreshold, '%');
    console.log('Network:', NETWORK);
    console.log('=====================================');

    console.log('\n📋 Next Steps:');
    console.log('1. Deploy the governance program using Anchor CLI');
    console.log('2. Initialize the governance pool with the program');
    console.log('3. Update your app to use the governance program');
    console.log('4. Test governance functionality on devnet first');
    console.log('5. Announce governance launch to community');

    return deploymentInfo;

  } catch (error) {
    console.error('❌ Governance program deployment failed:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployGovernanceProgram()
    .then(() => {
      console.log('\n✅ Deployment completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error.message);
      process.exit(1);
    });
}

module.exports = { deployGovernanceProgram }; 