export interface ExtractionJob {
  id: string;
  url: string;
  status: "downloading" | "transcribing" | "summarizing" | "done" | "error";
  progress: number;
  audioPath?: string;
  transcript?: string;
  summary?: BlogSummary;
  error?: string;
  createdAt: string;
}

export interface BlogSummary {
  title: string;
  tldr: string;
  keyPoints: string[];
  outline: OutlineSection[];
  tags: string[];
  sourceUrl: string;
  duration?: string;
}

export interface OutlineSection {
  heading: string;
  content: string;
  timestamp?: string;
}

export interface TranscriptionJob {
  id: string;
  filename: string;
  status:
    | "uploading"
    | "extracting"
    | "transcribing"
    | "formatting"
    | "done"
    | "error";
  progress: number;
  transcript?: string;
  minutes?: MeetingMinutes;
  error?: string;
  createdAt: string;
}

export interface MeetingMinutes {
  title: string;
  date: string;
  duration: string;
  attendees: string[];
  agenda: AgendaItem[];
  decisions: string[];
  actionItems: ActionItem[];
  rawTranscript: string;
}

export interface AgendaItem {
  topic: string;
  discussion: string;
  speaker?: string;
}

export interface ActionItem {
  task: string;
  assignee?: string;
  deadline?: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
  sourceType?: "manual" | "blog-extract" | "meeting-minutes";
  createdAt: string;
  updatedAt: string;
}
