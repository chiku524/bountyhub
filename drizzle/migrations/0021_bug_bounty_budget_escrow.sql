-- Bug bounty campaign budgets are now held from the owner's BBUX wallet.
-- Existing campaigns were never funded, so they start as not escrowed.
ALTER TABLE bug_bounty_campaigns ADD COLUMN budget_escrowed integer DEFAULT 0 NOT NULL;
