import { json, type ActionFunctionArgs } from "@remix-run/node";
import { VirtualWalletService } from "~/utils/virtual-wallet.server";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { z } from "zod";

const claimBountySchema = z.object({
  bountyId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const bountyId = formData.get("bountyId") as string;

    const validatedData = claimBountySchema.parse({ bountyId });

    // Get the bounty
    const bounty = await prisma.bounty.findUnique({
      where: { id: validatedData.bountyId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            authorId: true,
          },
        },
      },
    });

    if (!bounty) {
      return json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.status !== "ACTIVE") {
      return json({ error: "Bounty is not active" }, { status: 400 });
    }

    // Check if bounty has expired
    if (bounty.expiresAt && new Date() > bounty.expiresAt) {
      return json({ error: "Bounty has expired" }, { status: 400 });
    }

    // Check if user is not the bounty creator
    if (bounty.post.authorId === userId) {
      return json({ error: "You cannot claim your own bounty" }, { status: 400 });
    }

    // Update bounty status and set winner
    const updatedBounty = await prisma.bounty.update({
      where: { id: validatedData.bountyId },
      data: {
        status: "CLAIMED",
        winnerId: userId,
      },
    });

    // Add bounty amount to winner's virtual wallet
    await VirtualWalletService.claimBounty(userId, bounty.amount, bounty.id);

    return json({
      success: true,
      bounty: updatedBounty,
      message: `Successfully claimed ${bounty.amount} SOL bounty!`,
    });
  } catch (error) {
    console.error("Claim bounty error:", error);
    
    if (error instanceof z.ZodError) {
      return json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }

    return json({ error: "Failed to claim bounty" }, { status: 500 });
  }
} 