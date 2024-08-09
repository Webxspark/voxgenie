CREATE TABLE "users" (
	"id"	INTEGER,
	"username"	TEXT DEFAULT 'User',
	"email"	TEXT NOT NULL UNIQUE,
	"password"	TEXT,
	"tag"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "voices" (
	"id"	INTEGER,
	"tag"	TEXT NOT NULL,
	"files"	TEXT NOT NULL,
	"label"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "history" (
	"id"	INTEGER,
	"tag"	TEXT,
	"prompt"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "fileManager" (
	"id"	INTEGER,
	"tag"	TEXT NOT NULL,
	"dir"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "ping" (
	"id"	INTEGER,
	"status"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO ping(status) VALUES ("pong");