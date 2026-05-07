import PixelNav from "@/components/PixelNav";
import ToolCard from "@/components/ToolCard";

const tools = [
  {
    href: "/blog-extractor",
    icon: ">>",
    title: "Blog Extractor",
    description:
      "Input a video/blog URL, extract audio, transcribe via ASR, and generate structured summaries with key takeaways.",
    accentColor: "#74b9ff",
  },
  {
    href: "/meeting-minutes",
    icon: "##",
    title: "Meeting Minutes",
    description:
      "Upload audio/video recordings, auto-transcribe with speaker detection, and format into structured meeting notes.",
    accentColor: "#51cf66",
  },
  {
    href: "/knowledge",
    icon: "{}",
    title: "Knowledge Base",
    description:
      "Organize and manage your personal knowledge entries with categories, tags, and full-text search.",
    accentColor: "#a29bfe",
  },
];

export default function Home() {
  return (
    <>
      <PixelNav />
      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-2 tracking-wide">
              <span className="text-accent-purple">{">"}</span> PIXEL TOOLS
            </h1>
            <p className="text-text-secondary">
              Personal strategic toolkit — extract, organize, and manage
              knowledge.
            </p>
            <hr className="pixel-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div
                key={tool.href}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <ToolCard {...tool} />
              </div>
            ))}
          </div>

          <div className="mt-12 pixel-card p-6">
            <h2 className="text-sm font-bold text-text-secondary mb-3 tracking-wide">
              // SYSTEM STATUS
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent-green">3</div>
                <div className="text-xs text-text-muted">TOOLS ONLINE</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-blue">0</div>
                <div className="text-xs text-text-muted">JOBS RUNNING</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-purple">0</div>
                <div className="text-xs text-text-muted">KB ENTRIES</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
