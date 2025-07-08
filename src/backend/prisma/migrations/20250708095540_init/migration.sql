-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "email_verified" BOOLEAN DEFAULT false,
    "last_login" DATETIME,
    "created_at" DATETIME,
    "updated_at" DATETIME,
    "tenant_id" INTEGER,
    "name" TEXT,
    "description" TEXT,
    "is_default" BOOLEAN DEFAULT false,
    "code" TEXT,
    "user_id" JSONB,
    "role_id" JSONB,
    "permission_id" JSONB,
    "token" TEXT,
    "expires_at" DATETIME,
    "used" BOOLEAN DEFAULT false,
    "device_info" JSONB,
    "last_activity" DATETIME,
    "action" TEXT,
    "target_entity" TEXT,
    "target_id" INTEGER,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" DATETIME,
    "entity_type" TEXT,
    "field_name" TEXT,
    "field_type" TEXT,
    "label" TEXT,
    "required" BOOLEAN DEFAULT false,
    "options" JSONB,
    "field_definition_id" JSONB,
    "entity_id" INTEGER,
    "value" TEXT,
    "slug" TEXT,
    "config" JSONB,
    "key" TEXT,
    "language_code" TEXT,
    "title" TEXT,
    "message" TEXT,
    "type" TEXT DEFAULT 'INFO',
    "read" BOOLEAN DEFAULT false,
    "action_link" TEXT
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "description" TEXT,
    "is_default" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "UserRole" (
    "user_id" JSONB NOT NULL,
    "role_id" JSONB NOT NULL,

    PRIMARY KEY ("user_id", "role_id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "role_id" JSONB NOT NULL,
    "permission_id" JSONB NOT NULL,

    PRIMARY KEY ("role_id", "permission_id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" JSONB,
    "token" TEXT,
    "expires_at" DATETIME,
    "used" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" JSONB,
    "token" TEXT,
    "device_info" JSONB,
    "created_at" DATETIME,
    "expires_at" DATETIME,
    "last_activity" DATETIME
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" JSONB,
    "action" TEXT,
    "target_entity" TEXT,
    "target_id" INTEGER,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" DATETIME
);

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entity_type" TEXT,
    "field_name" TEXT,
    "field_type" TEXT,
    "label" TEXT,
    "required" BOOLEAN DEFAULT false,
    "options" JSONB
);

-- CreateTable
CREATE TABLE "CustomFieldValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "field_definition_id" JSONB,
    "entity_id" INTEGER,
    "value" TEXT
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "slug" TEXT,
    "config" JSONB
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT,
    "language_code" TEXT,
    "value" TEXT
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" JSONB,
    "title" TEXT,
    "message" TEXT,
    "type" TEXT DEFAULT 'INFO',
    "read" BOOLEAN DEFAULT false,
    "created_at" DATETIME,
    "action_link" TEXT
);
