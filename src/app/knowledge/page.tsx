"use client";

import { useState, useEffect, useCallback } from "react";
import PixelNav from "@/components/PixelNav";
import PixelCard from "@/components/PixelCard";
import PixelButton from "@/components/PixelButton";
import PixelInput from "@/components/PixelInput";
import PixelBadge from "@/components/PixelBadge";
import PixelModal from "@/components/PixelModal";
import PixelLoading from "@/components/PixelLoading";
import type { KnowledgeEntry } from "@/lib/types";

interface EditorState {
  title: string;
  content: string;
  category: string;
  tags: string;
  source: string;
}

const emptyEditor: EditorState = {
  title: "",
  content: "",
  category: "uncategorized",
  tags: "",
  source: "",
};

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);

  const [viewEntry, setViewEntry] = useState<KnowledgeEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", "20");
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("search", search);

    const res = await fetch(`/api/knowledge?${params}`);
    const data = await res.json();
    setEntries(data.entries);
    setTotal(data.total);
    setCategories(data.categories);
    setLoading(false);
  }, [page, activeCategory, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSave = async () => {
    const body = {
      title: editor.title,
      content: editor.content,
      category: editor.category || "uncategorized",
      tags: editor.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      source: editor.source || undefined,
    };

    if (editingId) {
      await fetch(`/api/knowledge/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setModalOpen(false);
    setEditingId(null);
    setEditor(emptyEditor);
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    setViewEntry(null);
    fetchEntries();
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditingId(entry.id);
    setEditor({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      tags: entry.tags.join(", "),
      source: entry.source || "",
    });
    setViewEntry(null);
    setModalOpen(true);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <PixelNav />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                <span className="text-accent-purple">{"{}"}</span> KNOWLEDGE
                BASE
              </h1>
              <p className="text-text-secondary text-sm mt-1">
                {total} entries total
              </p>
            </div>
            <PixelButton
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setEditor(emptyEditor);
                setModalOpen(true);
              }}
            >
              + NEW ENTRY
            </PixelButton>
          </div>

          {/* Search + Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <PixelInput
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search entries..."
              />
            </div>
            <div className="flex gap-1 flex-wrap items-center">
              <PixelBadge
                label="ALL"
                color={activeCategory === "" ? "purple" : "blue"}
                onClick={() => {
                  setActiveCategory("");
                  setPage(1);
                }}
              />
              {categories.map((cat) => (
                <PixelBadge
                  key={cat.name}
                  label={`${cat.name} (${cat.count})`}
                  color={activeCategory === cat.name ? "purple" : "blue"}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Entries List */}
          {loading ? (
            <PixelLoading text="Loading entries..." />
          ) : entries.length === 0 ? (
            <PixelCard>
              <p className="text-text-muted text-center py-8">
                {search || activeCategory
                  ? "No matching entries found."
                  : "No entries yet. Create your first one!"}
              </p>
            </PixelCard>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <PixelCard
                  key={entry.id}
                  hoverable
                  onClick={() => setViewEntry(entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-primary mb-1 truncate">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {entry.content.slice(0, 200)}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <PixelBadge label={entry.category} color="green" />
                        {entry.tags.map((tag) => (
                          <PixelBadge key={tag} label={tag} color="blue" />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted ml-4 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <PixelButton
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {"<"} PREV
              </PixelButton>
              <span className="px-3 py-2 text-sm text-text-secondary">
                {page} / {totalPages}
              </span>
              <PixelButton
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                NEXT {">"}
              </PixelButton>
            </div>
          )}
        </div>
      </main>

      {/* Create / Edit Modal */}
      <PixelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "EDIT ENTRY" : "NEW ENTRY"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">TITLE</label>
            <PixelInput
              value={editor.title}
              onChange={(v) => setEditor({ ...editor, title: v })}
              placeholder="Entry title"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">
              CONTENT
            </label>
            <textarea
              value={editor.content}
              onChange={(e) =>
                setEditor({ ...editor, content: e.target.value })
              }
              placeholder="Write your content here (supports markdown)..."
              className="pixel-input w-full px-3 py-2 text-sm h-40 resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted block mb-1">
                CATEGORY
              </label>
              <PixelInput
                value={editor.category}
                onChange={(v) => setEditor({ ...editor, category: v })}
                placeholder="e.g. notes, research"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">
                TAGS (comma separated)
              </label>
              <PixelInput
                value={editor.tags}
                onChange={(v) => setEditor({ ...editor, tags: v })}
                placeholder="tag1, tag2"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">
              SOURCE (optional)
            </label>
            <PixelInput
              value={editor.source}
              onChange={(v) => setEditor({ ...editor, source: v })}
              placeholder="URL or reference"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <PixelButton onClick={() => setModalOpen(false)}>
              CANCEL
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={handleSave}
              disabled={!editor.title || !editor.content}
            >
              {editingId ? "UPDATE" : "CREATE"}
            </PixelButton>
          </div>
        </div>
      </PixelModal>

      {/* View Entry Modal */}
      <PixelModal
        open={!!viewEntry}
        onClose={() => setViewEntry(null)}
        title={viewEntry?.title || ""}
      >
        {viewEntry && (
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <PixelBadge label={viewEntry.category} color="green" />
              {viewEntry.tags.map((tag) => (
                <PixelBadge key={tag} label={tag} color="blue" />
              ))}
            </div>
            {viewEntry.source && (
              <p className="text-xs text-text-muted mb-3">
                Source: {viewEntry.source}
              </p>
            )}
            <div className="pixel-input p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {viewEntry.content}
            </div>
            <div className="flex gap-3 justify-end pt-4">
              {deleteConfirm === viewEntry.id ? (
                <>
                  <span className="text-accent-red text-sm py-2">
                    Confirm delete?
                  </span>
                  <PixelButton onClick={() => setDeleteConfirm(null)}>
                    NO
                  </PixelButton>
                  <PixelButton
                    variant="danger"
                    onClick={() => handleDelete(viewEntry.id)}
                  >
                    YES, DELETE
                  </PixelButton>
                </>
              ) : (
                <>
                  <PixelButton
                    variant="danger"
                    onClick={() => setDeleteConfirm(viewEntry.id)}
                  >
                    DELETE
                  </PixelButton>
                  <PixelButton onClick={() => openEdit(viewEntry)}>
                    EDIT
                  </PixelButton>
                </>
              )}
            </div>
          </div>
        )}
      </PixelModal>
    </>
  );
}
