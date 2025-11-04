-- Add chat tables
CREATE TABLE IF NOT EXISTS "chat_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL DEFAULT 'GLOBAL',
	"created_by" text,
	"is_active" integer NOT NULL DEFAULT 1,
	"created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	"updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"message_type" text NOT NULL DEFAULT 'TEXT',
	"media_url" text,
	"file_name" text,
	"file_size" integer,
	"reply_to_id" text,
	"is_edited" integer NOT NULL DEFAULT 0,
	"edited_at" integer,
	"created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	"updated_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
	FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "chat_room_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL DEFAULT 'MEMBER',
	"joined_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	"last_read_at" integer,
	"is_active" integer NOT NULL DEFAULT 1,
	FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "chat_message_reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reaction" text NOT NULL,
	"created_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "chat_message_reads" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" integer NOT NULL DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Insert default global chat room
INSERT OR IGNORE INTO "chat_rooms" ("id", "name", "description", "type", "created_by", "is_active") 
VALUES ('global-chat', 'Global Chat', 'Main community chat room for all users', 'GLOBAL', NULL, 1); 