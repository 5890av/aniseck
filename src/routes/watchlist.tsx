import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { STATUSES, useWatchlist, type WatchStatus } from "@/lib/watchlist";
import { RatingInput } from "@/components/RatingInput";
import { CardGrid, MediaCardView } from "@/components/MediaCardView";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [
    { title: "My Watchlist — anideck" },
    { name: "description", content: "Your saved shows: watching, completed and plan to watch." },
    { property: "og:title", content: "My Watchlist — anideck" },
    { property: "og:description", content: "Your saved shows: watching, completed and plan to watch." },
  ] }),
  component: Watchlist,
});

function Watchlist() {
  const list = useWatchlist();
  const [tab, setTab] = useState<WatchStatus>("Watching");
  const all = Object.values(list);
  const items = all.filter((e) => e.status === tab).sort((a, b) => b.addedAt - a.addedAt);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-foreground">My Watchlist</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {s} <span className="opacity-70">{all.filter((e) => e.status === s).length}</span>
          </button>
        ))}
      </div>
      {items.length ? <CardGrid>{items.map((e) => <div key={e.media.id} className="space-y-2"><MediaCardView m={e.media} myScore={e.score} /><RatingInput media={e.media} score={e.score} compact /></div>)}</CardGrid>
        : <p className="text-muted-foreground">Nothing here yet. <Link to="/" className="font-semibold text-primary">Browse shows</Link> and add some.</p>}
    </main>
  );
}
