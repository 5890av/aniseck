import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHome, type MediaCard } from "@/lib/anilist";
import { CardGrid, GridSkeleton, MediaCardView } from "@/components/MediaCardView";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "anideck — Trending & popular anime" },
    { name: "description", content: "Browse trending and popular anime from AniList, search titles and keep your own watchlist." },
    { property: "og:title", content: "anideck — Trending & popular anime" },
    { property: "og:description", content: "Browse trending and popular anime from AniList and keep your own watchlist." },
  ] }),
  component: Index,
});

function Index() {
  const { data, isLoading, error } = useQuery({ queryKey: ["home"], queryFn: fetchHome });
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-8">
      <section className="rounded-3xl bg-hero p-8 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Powered by AniList</p>
        <h1 className="mt-2 max-w-xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">Find your next favorite show.</h1>
      </section>
      {error && <p className="text-destructive">Couldn't load from AniList. Try again shortly.</p>}
      {([["Trending now", data?.trending.media], ["All-time popular", data?.popular.media]] as [string, MediaCard[] | undefined][]).map(([label, list]) => (
        <section key={label}>
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">{label}</h2>
          {isLoading ? <GridSkeleton /> : <CardGrid>{list?.map((m) => <MediaCardView key={m.id} m={m} />)}</CardGrid>}
        </section>
      ))}
    </main>
  );
}
