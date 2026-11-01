CREATE TABLE "auth_otps" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "bubble_hobbies" (
	"id" text PRIMARY KEY NOT NULL,
	"bubble_id" text NOT NULL,
	"hobby" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bubbles" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"prompt_question" text,
	"bubble_type" text DEFAULT 'thought' NOT NULL,
	"bubble_color" text DEFAULT '#8D7B68' NOT NULL,
	"distance_km" integer DEFAULT 4200 NOT NULL,
	"breath_effort" text DEFAULT 'balanced' NOT NULL,
	"is_user_bubble" boolean DEFAULT false NOT NULL,
	"moderation_status" text DEFAULT 'clean' NOT NULL,
	"flagged_reason" text,
	"flagged_keywords" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "burst_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bubble_id" text NOT NULL,
	"burst_date" text NOT NULL,
	"burst_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"distance_km" integer DEFAULT 5000 NOT NULL,
	"media_handshake" jsonb DEFAULT '{"requestedByMe":false,"requestedByThem":false,"approvedByMe":false,"approvedByThem":false}'::jsonb NOT NULL,
	"last_message_snippet" text DEFAULT '',
	"last_message_time" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"connection_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"bubble_type" text DEFAULT 'thought',
	"breath_effort" text DEFAULT 'balanced',
	"sent_at" bigint NOT NULL,
	"delivery_duration_ms" bigint NOT NULL,
	"arrival_at" bigint NOT NULL,
	"media_attachments" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_warnings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bubble_id" text,
	"bubble_title" text NOT NULL,
	"flagged_words" jsonb NOT NULL,
	"reason" text NOT NULL,
	"warning_number" integer NOT NULL,
	"resulted_in_suspension" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_hobbies" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hobby" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_unlocked_types" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bubble_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"nickname" text DEFAULT 'Penpal' NOT NULL,
	"age" integer DEFAULT 24 NOT NULL,
	"pronouns" text DEFAULT 'they/them' NOT NULL,
	"location" text DEFAULT 'Earth' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"exchange_interest" text DEFAULT 'Literature & Philosophy Discussions' NOT NULL,
	"avatar" jsonb DEFAULT '{"skinColor":"#F5D0C5","hairStyle":"wavy","hairColor":"#3A2E2B","eyeStyle":"calm","mouthStyle":"subtle_smile","glassesStyle":"round","clothingStyle":"sweater","clothingColor":"#7A8B7B","bgTint":"#E8EFE9"}'::jsonb NOT NULL,
	"breath_level" integer DEFAULT 1 NOT NULL,
	"breath_exp" integer DEFAULT 0 NOT NULL,
	"daily_breath_energy" integer DEFAULT 100 NOT NULL,
	"daily_bursts_remaining" integer DEFAULT 3 NOT NULL,
	"daily_bursts_reset_date" text DEFAULT '2026-11-01' NOT NULL,
	"last_bubble_published_at" bigint,
	"moderation_warnings_count" integer DEFAULT 0 NOT NULL,
	"suspended_until" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bubble_hobbies" ADD CONSTRAINT "bubble_hobbies_bubble_id_bubbles_id_fk" FOREIGN KEY ("bubble_id") REFERENCES "public"."bubbles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bubbles" ADD CONSTRAINT "bubbles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burst_logs" ADD CONSTRAINT "burst_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "burst_logs" ADD CONSTRAINT "burst_logs_bubble_id_bubbles_id_fk" FOREIGN KEY ("bubble_id") REFERENCES "public"."bubbles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_warnings" ADD CONSTRAINT "moderation_warnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hobbies" ADD CONSTRAINT "user_hobbies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unlocked_types" ADD CONSTRAINT "user_unlocked_types_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;