import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { KnowledgeEntry } from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "knowledge.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'uncategorized',
        tags TEXT NOT NULL DEFAULT '[]',
        source TEXT,
        source_type TEXT DEFAULT 'manual',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }
  return _db;
}

function rowToEntry(row: Record<string, unknown>): KnowledgeEntry {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    category: row.category as string,
    tags: JSON.parse(row.tags as string),
    source: row.source as string | undefined,
    sourceType: row.source_type as KnowledgeEntry["sourceType"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function listEntries(opts: {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
}): { entries: KnowledgeEntry[]; total: number } {
  const db = getDb();
  const { page = 1, pageSize = 20, category, search } = opts;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }
  if (search) {
    conditions.push("(title LIKE ? OR content LIKE ? OR tags LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = db
    .prepare(`SELECT COUNT(*) as count FROM knowledge_entries ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(
      `SELECT * FROM knowledge_entries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, pageSize, (page - 1) * pageSize) as Record<string, unknown>[];

  return {
    entries: rows.map(rowToEntry),
    total: countRow.count,
  };
}

export function getEntry(id: string): KnowledgeEntry | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM knowledge_entries WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToEntry(row) : null;
}

export function createEntry(
  entry: Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">
): KnowledgeEntry {
  const db = getDb();
  const now = new Date().toISOString();
  const id = `kb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(
    `INSERT INTO knowledge_entries (id, title, content, category, tags, source, source_type, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    entry.title,
    entry.content,
    entry.category,
    JSON.stringify(entry.tags),
    entry.source || null,
    entry.sourceType || "manual",
    now,
    now
  );
  return getEntry(id)!;
}

export function updateEntry(
  id: string,
  updates: Partial<Omit<KnowledgeEntry, "id" | "createdAt" | "updatedAt">>
): KnowledgeEntry | null {
  const db = getDb();
  const existing = getEntry(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged = {
    title: updates.title ?? existing.title,
    content: updates.content ?? existing.content,
    category: updates.category ?? existing.category,
    tags: updates.tags ?? existing.tags,
    source: updates.source ?? existing.source,
    sourceType: updates.sourceType ?? existing.sourceType,
  };

  db.prepare(
    `UPDATE knowledge_entries SET title=?, content=?, category=?, tags=?, source=?, source_type=?, updated_at=? WHERE id=?`
  ).run(
    merged.title,
    merged.content,
    merged.category,
    JSON.stringify(merged.tags),
    merged.source || null,
    merged.sourceType || "manual",
    now,
    id
  );
  return getEntry(id);
}

export function deleteEntry(id: string): boolean {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM knowledge_entries WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function getAllCategories(): { name: string; count: number }[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT category as name, COUNT(*) as count FROM knowledge_entries GROUP BY category ORDER BY count DESC"
    )
    .all() as { name: string; count: number }[];
}
