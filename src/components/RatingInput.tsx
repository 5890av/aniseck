import { useEffect, useState } from "react";
import { parseScore, setScore } from "@/lib/watchlist";
import type { MediaCard } from "@/lib/anilist";

export function RatingInput({ media, score, compact }: { media: MediaCard; score: number | null; compact?: boolean }) {
  const [v, setV] = useState(score?.toString() ?? "");
  const [err, setErr] = useState(false);
  useEffect(() => setV(score?.toString() ?? ""), [score]);
  const commit = () => {
    if (v.trim() === "") { setErr(false); setScore(media, null); return; }
    const n = parseScore(v);
    if (n == null) { setErr(true); return; }
    setErr(false); setV(String(n)); setScore(media, n);
  };
  return (
    <label className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
      {!compact && <span className="font-semibold text-foreground">My score</span>}
      <input type="number" inputMode="decimal" min={1} max={10} step={0.1} value={v} placeholder="–"
        onChange={(e) => setV(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        aria-label="My score out of 10"
        className={`rounded-lg border bg-card px-2 py-1 text-foreground outline-none focus:ring-2 focus:ring-ring ${compact ? "w-14" : "w-20"} ${err ? "border-destructive" : "border-input"}`} />
      <span>/ 10</span>
      {err && <span className="text-destructive">1–10 only</span>}
    </label>
  );
}
