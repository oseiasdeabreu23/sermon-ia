CREATE TABLE `esbocos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`livro` text NOT NULL,
	`capitulo` integer NOT NULL,
	`versiculo` integer NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`publico_alvo` text,
	`conteudo_json` text,
	`status` text DEFAULT 'pending',
	`erro` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firebase_uid` text NOT NULL,
	`email` text NOT NULL,
	`nome` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_firebase_uid_unique` ON `users` (`firebase_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);