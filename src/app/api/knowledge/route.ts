import { NextRequest, NextResponse } from "next/server";
import { listEntries, createEntry, getAllCategories } from "@/lib/db";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = parseInt(params.get("page") || "1");
  const pageSize = parseInt(params.get("pageSize") || "20");
  const category = params.get("category") || undefined;
  const search = params.get("search") || undefined;

  const result = listEntries({ page, pageSize, category, search });
  const categories = getAllCategories();

  return NextResponse.json({ ...result, categories });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, content, category, tags, source, sourceType } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const entry = createEntry({
    title,
    content,
    category: category || "uncategorized",
    tags: tags || [],
    source,
    sourceType,
  });

  return NextResponse.json(entry);
}
