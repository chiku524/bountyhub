// Temporarily commented out due to missing test dependencies
// This file will be re-enabled once the governance program is properly set up

/*
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
// import { Governance } from "../target/types/governance";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";

describe("governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Governance as Program<any>;
  
  let governancePool: Keypair;
  let governancePoolTokenAccount: PublicKey;
  let mint: PublicKey;
  let userTokenAccount: PublicKey;
  let proposal: Keypair;
  let voteRecord: PublicKey;

  const feeRate = 500; // 5% in basis points

  before(async () => {
    // Create a test mint
    mint = await createMint(
      provider.connection,
      provider.wallet as any,
      provider.wallet.publicKey,
      null,
      9
    );

    // Create governance pool
    governancePool = Keypair.generate();
    
    // Create governance pool token account
    governancePoolTokenAccount = await createAccount(
      provider.connection,
      provider.wallet as any,
      mint,
      governancePool.publicKey
    );

    // Create user token account
    userTokenAccount = await createAccount(
      provider.connection,
      provider.wallet as any,
      mint,
      provider.wallet.publicKey
    );

    // Mint some tokens to user
    await mintTo(
      provider.connection,
      provider.wallet as any,
      mint,
      userTokenAccount,
      provider.wallet,
      1000000000 // 1 token with 9 decimals
    );
  });

  it("Initializes governance pool", async () => {
    const [governancePoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("governance_pool")],
      program.programId
    );

    const [governancePoolTokenPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("governance_pool_token"),
        governancePoolPda.toBuffer(),
      ],
      program.programId
    );

    await (program as any).methods
      .initializeGovernancePool(new anchor.BN(feeRate))
      .accounts({
        governancePool: governancePoolPda,
        governancePoolTokenAccount: governancePoolTokenPda,
        authority: provider.wallet.publicKey,
        mint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const governancePoolAccount = await (program as any).account['governancePool'].fetch(governancePoolPda);
    console.log("Governance pool authority:", governancePoolAccount.authority.toString());
    console.log("Governance pool fee rate:", governancePoolAccount.governanceFeeRate.toNumber());
  });

  it("Collects governance fee", async () => {
    const [governancePoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("governance_pool")],
      program.programId
    );

    const [governancePoolTokenPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("governance_pool_token"),
        governancePoolPda.toBuffer(),
      ],
      program.programId
    );

    const bountyAmount = 100000000; // 0.1 tokens
    const expectedFee = (bountyAmount * feeRate) / 10000; // 5000 (0.005 tokens)

    await (program as any).methods
      .collectGovernanceFee(new anchor.BN(bountyAmount))
      .accounts({
        governancePool: governancePoolPda,
        governancePoolTokenAccount: governancePoolTokenPda,
        bountyCreator: provider.wallet.publicKey,
        bountyCreatorTokenAccount: userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const governancePoolAccount = await (program as any).account['governancePool'].fetch(governancePoolPda);
    console.log("Total fees collected:", governancePoolAccount.totalFeesCollected.toNumber());
  });

  it("Creates a proposal", async () => {
    const [governancePoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("governance_pool")],
      program.programId
    );

    proposal = Keypair.generate();
    const proposalCounter = new anchor.BN(1);

    const [proposalPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        governancePoolPda.toBuffer(),
        proposalCounter.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await (program as any).methods
      .createProposal(
        "Test Proposal",
        "This is a test proposal for governance",
        { rewardDistribution: {} },
        new anchor.BN(100000000), // 0.1 tokens
        provider.wallet.publicKey
      )
      .accounts({
        proposal: proposalPda,
        governancePool: governancePoolPda,
        authority: provider.wallet.publicKey,
        proposalCounter: proposal.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([proposal])
      .rpc();

    const proposalAccount = await (program as any).account['proposal'].fetch(proposalPda);
    console.log("Proposal title:", proposalAccount.title);
    console.log("Proposal description:", proposalAccount.description);
  });

  it("Votes on a proposal", async () => {
    const [governancePoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("governance_pool")],
      program.programId
    );

    const proposalCounter = new anchor.BN(1);
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        governancePoolPda.toBuffer(),
        proposalCounter.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote"),
        proposalPda.toBuffer(),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    await (program as any).methods
      .voteOnProposal(true)
      .accounts({
        proposal: proposalPda,
        voteRecord: voteRecordPda,
        voter: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const voteRecordAccount = await (program as any).account['voteRecord'].fetch(voteRecordPda);
    console.log("Vote record proposal:", voteRecordAccount.proposal.toString());
    console.log("Vote record voter:", voteRecordAccount.voter.toString());
    console.log("Vote:", voteRecordAccount.vote);

    const proposalAccount = await (program as any).account['proposal'].fetch(proposalPda);
    console.log("Yes votes:", proposalAccount.yesVotes.toNumber());
    console.log("No votes:", proposalAccount.noVotes.toNumber());
    console.log("Total votes:", proposalAccount.totalVotes.toNumber());
  });
});
*/ 