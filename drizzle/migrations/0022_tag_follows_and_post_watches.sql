-- Follow tags and watch questions: powers the personal "Following" feed and activity notifications.
CREATE TABLE IF NOT EXISTS "tag_follows" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "tag_id" text NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "created_at" integer NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "tag_follows_user_tag_idx" ON "tag_follows" ("user_id", "tag_id");
CREATE INDEX IF NOT EXISTS "tag_follows_tag_idx" ON "tag_follows" ("tag_id");

CREATE TABLE IF NOT EXISTS "post_watches" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "post_id" text NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
  "created_at" integer NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "post_watches_user_post_idx" ON "post_watches" ("user_id", "post_id");
CREATE INDEX IF NOT EXISTS "post_watches_post_idx" ON "post_watches" ("post_id");
