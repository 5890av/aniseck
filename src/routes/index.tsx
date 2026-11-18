import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, HOME_ROWS } from "@/lib/anilist";
import { useWatchlist } from "@/lib/watchlist";
import { MediaCardView, Row, RowItem } from "@/components/MediaCardView";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "anideck — Trending & popular anime" },
    { name: "description", content: "Browse trending, upcoming, top rated and most favorited anime from AniList." },
    { property: "og:title", content: "anideck — Trending & popular anime" },
    { property: "og:description", content: "Browse trending, upcoming, top rated and most favorited anime from AniList." },
  ] }),
  component: Index,
});

function Index() {
  const { data, isLoading, error } = useQuery({ queryKey: ["home"], queryFn: fetchHome });
  const list = useWatchlist();
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <section className="rounded-3xl bg-hero p-8 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Powered by AniList</p>
        <h1 className="mt-2 max-w-xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">Find your next favorite show.</h1>
      </section>
      {error && <p className="text-destructive">Couldn't load from AniList. Try again shortly.</p>}
      {HOME_ROWS.map(([key, label]) => (
        <Row key={key} title={label}>
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => <RowItem key={i}><div className="aspect-[2/3] animate-pulse rounded-xl bg-muted" /></RowItem>)
            : data?.[key].media.map((m) => <RowItem key={m.id}><MediaCardView m={m} myScore={list[m.id]?.score} /></RowItem>)}
        </Row>
      ))}
    </main>
  );
}
