-- Allow chat rooms to be public (discoverable/joinable) or private (invite/link only)
ALTER TABLE "chat_rooms" ADD COLUMN "is_public" integer NOT NULL DEFAULT 1;
