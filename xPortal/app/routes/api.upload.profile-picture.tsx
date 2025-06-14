import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { uploadImage } from "~/utils/upload.server";

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
        return json({ error: "No file provided" }, { status: 400 });
    }

    try {
        // Upload image to cloud storage
        const imageUrl = await uploadImage(file, `profile-pictures/${userId}`);

        // First, check if a profile exists
        const existingProfile = await prisma.profile.findUnique({
            where: { userId }
        });

        if (!existingProfile) {
            // Create a new profile if it doesn't exist
            await prisma.profile.create({
                data: {
                    userId,
                    profilePicture: imageUrl
                }
            });
        } else {
            // Update existing profile
            await prisma.profile.update({
                where: { userId },
                data: { profilePicture: imageUrl }
            });
        }

        return json({ success: true, imageUrl });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        return json({ error: "Failed to upload image" }, { status: 500 });
    }
} 