import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { getUser } from "~/utils/auth.server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { bounties } from "../../drizzle/schema";
import { createDb } from "~/utils/db.server";

const claimBountySchema = z.object({
  bountyId: z.string().min(1, "Bounty ID is required"),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await getUser(request);
    const formData = await request.formData();
    
    const validation = claimBountySchema.safeParse({
      bountyId: formData.get("bountyId"),
    });

    if (!validation.success) {
      return json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { bountyId } = validation.data;
    const db = createDb();

    // Check if bounty exists and is active
    const bounty = await db.query.bounties.findFirst({
      where: eq(bounties.id, bountyId)
    });

    if (!bounty) {
      return json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.status !== 'ACTIVE') {
      return json({ error: "Bounty is not active" }, { status: 400 });
    }

    // Check if user is the post author (they can't claim their own bounty)
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, bounty.postId)
    });

    if (post && post.authorId === userId) {
      return json({ error: "You cannot claim your own bounty" }, { status: 400 });
    }

    // Claim the bounty
    await claimBounty(db, userId, bounty.amount, bounty.id);

    // Update bounty status
    await db.update(bounties)
      .set({ 
        status: 'CLAIMED',
        winnerId: userId
      })
      .where(eq(bounties.id, bountyId))
      .run();

    return json({
      success: true,
      message: `Successfully claimed bounty of ${bounty.amount} tokens`
    });
  } catch (error) {
    console.error("Claim bounty error:", error);
    return json({ error: "Failed to claim bounty" }, { status: 500 });
  }
}

