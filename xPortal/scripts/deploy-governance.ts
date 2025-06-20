import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount } from "@solana/spl-token";
import fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Governance as Program<any>;
  
  console.log("Deploying governance program...");
  console.log("Program ID:", program.programId.toString());

  // Create a test mint for governance tokens
  console.log("Creating governance token mint...");
  const mint = await createMint(
    provider.connection,
    provider.wallet as any,
    provider.wallet.publicKey,
    null,
    9
  );
  console.log("Governance token mint:", mint.toString());

  // Initialize governance pool
  console.log("Initializing governance pool...");
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

  const feeRate = 500; // 5% in basis points

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

  console.log("Governance pool initialized!");
  console.log("Governance pool address:", governancePoolPda.toString());
  console.log("Governance pool token account:", governancePoolTokenPda.toString());
  console.log("Fee rate:", feeRate, "basis points (5%)");

  // Save deployment info
  const deploymentInfo = {
    programId: program.programId.toString(),
    governancePool: governancePoolPda.toString(),
    governancePoolTokenAccount: governancePoolTokenPda.toString(),
    governanceTokenMint: mint.toString(),
    feeRate: feeRate,
    network: provider.connection.rpcEndpoint,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "governance-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to governance-deployment.json");
  console.log("Governance program deployment completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
}); 