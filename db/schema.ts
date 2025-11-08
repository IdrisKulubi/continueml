import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Better Auth Tables
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ============================================================================
// Application Tables
// ============================================================================

// Enums
export const entityTypeEnum = pgEnum("entity_type", [
  "character",
  "location",
  "object",
  "style",
  "custom",
]);

export const generationToolEnum = pgEnum("generation_tool", [
  "runway",
  "midjourney",
  "stable_diffusion",
  "other",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);

// Note: Better Auth will create user and session tables automatically
// We only reference the user table via foreign keys

// Worlds table
export const worlds = pgTable(
  "worlds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    tags: text("tags").array().default([]),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("worlds_user_id_idx").on(table.userId),
    createdAtIdx: index("worlds_created_at_idx").on(table.createdAt),
  })
);

// Branches table
export const branches = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    worldId: uuid("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    // Self-referencing foreign key for parent branch
    parentBranchId: uuid("parent_branch_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    worldIdIdx: index("branches_world_id_idx").on(table.worldId),
    createdAtIdx: index("branches_created_at_idx").on(table.createdAt),
    // Self-referencing foreign key constraint will be added in migration
    parentBranchIdFk: index("branches_parent_branch_id_idx").on(table.parentBranchId),
  })
);

// Entities table
export const entities = pgTable(
  "entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    worldId: uuid("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "cascade",
    }),
    type: entityTypeEnum("type").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    tags: text("tags").array().default([]),
    metadata: jsonb("metadata").default({}).notNull(),
    usageCount: integer("usage_count").default(0).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    worldIdIdx: index("entities_world_id_idx").on(table.worldId),
    branchIdIdx: index("entities_branch_id_idx").on(table.branchId),
    typeIdx: index("entities_type_idx").on(table.type),
    createdAtIdx: index("entities_created_at_idx").on(table.createdAt),
  })
);

// Entity images table
export const entityImages = pgTable(
  "entity_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (table) => ({
    entityIdIdx: index("entity_images_entity_id_idx").on(table.entityId),
    uploadedAtIdx: index("entity_images_uploaded_at_idx").on(table.uploadedAt),
  })
);

// Generations table
export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    worldId: uuid("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    originalPrompt: text("original_prompt").notNull(),
    enhancedPrompt: text("enhanced_prompt").notNull(),
    entityIds: text("entity_ids").array().default([]),
    tool: generationToolEnum("tool").notNull(),
    status: generationStatusEnum("status").default("queued").notNull(),
    resultUrl: text("result_url"),
    consistencyScore: integer("consistency_score"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    worldIdIdx: index("generations_world_id_idx").on(table.worldId),
    userIdIdx: index("generations_user_id_idx").on(table.userId),
    statusIdx: index("generations_status_idx").on(table.status),
    createdAtIdx: index("generations_created_at_idx").on(table.createdAt),
  })
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  worlds: many(worlds),
  generations: many(generations),
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const worldsRelations = relations(worlds, ({ one, many }) => ({
  user: one(user, {
    fields: [worlds.userId],
    references: [user.id],
  }),
  entities: many(entities),
  branches: many(branches),
  generations: many(generations),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  world: one(worlds, {
    fields: [branches.worldId],
    references: [worlds.id],
  }),
  parentBranch: one(branches, {
    fields: [branches.parentBranchId],
    references: [branches.id],
  }),
  entities: many(entities),
  generations: many(generations),
}));

export const entitiesRelations = relations(entities, ({ one, many }) => ({
  world: one(worlds, {
    fields: [entities.worldId],
    references: [worlds.id],
  }),
  branch: one(branches, {
    fields: [entities.branchId],
    references: [branches.id],
  }),
  images: many(entityImages),
}));

export const entityImagesRelations = relations(entityImages, ({ one }) => ({
  entity: one(entities, {
    fields: [entityImages.entityId],
    references: [entities.id],
  }),
}));

export const generationsRelations = relations(generations, ({ one }) => ({
  world: one(worlds, {
    fields: [generations.worldId],
    references: [worlds.id],
  }),
  branch: one(branches, {
    fields: [generations.branchId],
    references: [branches.id],
  }),
  user: one(user, {
    fields: [generations.userId],
    references: [user.id],
  }),
}));

// TypeScript types derived from schema

// Better Auth types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// Application types
export type World = typeof worlds.$inferSelect;
export type NewWorld = typeof worlds.$inferInsert;

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

export type Entity = typeof entities.$inferSelect;
export type NewEntity = typeof entities.$inferInsert;

export type EntityImage = typeof entityImages.$inferSelect;
export type NewEntityImage = typeof entityImages.$inferInsert;

export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;

// Enum types
export type EntityType = (typeof entityTypeEnum.enumValues)[number];
export type GenerationTool = (typeof generationToolEnum.enumValues)[number];
export type GenerationStatus = (typeof generationStatusEnum.enumValues)[number];
