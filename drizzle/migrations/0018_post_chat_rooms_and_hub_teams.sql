-- Post chat rooms: link chat_rooms to a post (one room per post, history always saved)
ALTER TABLE "chat_rooms" ADD COLUMN "post_id" text REFERENCES "posts"("id") ON DELETE CASCADE;

-- Hub: teams (groups users can create and join)
CREATE TABLE IF NOT EXISTS "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"is_public" integer NOT NULL DEFAULT 1,
	"created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	"updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Hub: team members (membership and role)
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
	"user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"role" text NOT NULL DEFAULT 'MEMBER',
	"joined_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	UNIQUE("team_id", "user_id")
);

-- Hub: team chat room (one group room per team)
ALTER TABLE "chat_rooms" ADD COLUMN "team_id" text REFERENCES "teams"("id") ON DELETE CASCADE;

-- Hub: task list items per team
CREATE TABLE IF NOT EXISTS "team_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
	"title" text NOT NULL,
	"description" text,
	"status" text NOT NULL DEFAULT 'TODO',
	"created_by" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"assigned_to" text REFERENCES "users"("id") ON DELETE SET NULL,
	"due_at" integer,
	"position" integer NOT NULL DEFAULT 0,
	"created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	"updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS "chat_rooms_post_id_idx" ON "chat_rooms" ("post_id");
CREATE INDEX IF NOT EXISTS "chat_rooms_team_id_idx" ON "chat_rooms" ("team_id");
CREATE INDEX IF NOT EXISTS "team_members_team_id_idx" ON "team_members" ("team_id");
CREATE INDEX IF NOT EXISTS "team_members_user_id_idx" ON "team_members" ("user_id");
CREATE INDEX IF NOT EXISTS "team_tasks_team_id_idx" ON "team_tasks" ("team_id");
