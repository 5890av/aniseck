import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { searchMedia, type MediaType } from "@/lib/anilist";
import { CardGrid, GridSkeleton, MediaCardView } from "@/components/MediaCardView";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q: string; type: MediaType } => ({
    q: typeof s["q"] === "string" ? s["q"] : "", type: s["type"] === "MANGA" ? "MANGA" : "ANIME",
  }),
  head: () => ({ meta: [
    { title: "Search anime & manga — anideck" },
    { name: "description", content: "Search any anime or manga on AniList." },
    { property: "og:title", content: "Search anime & manga — anideck" },
    { property: "og:description", content: "Search any anime or manga on AniList." },
  ] }),
  component: SearchPage,
});

function SearchPage() {
  const { q, type } = Route.useSearch();
  const { data, isLoading } = useQuery({ queryKey: ["search", q, type], queryFn: () => searchMedia(q, type), enabled: !!q });
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground">Results for "{q}"</h1>
        <div className="flex rounded-full bg-secondary p-1">
          {(["ANIME", "MANGA"] as const).map((t) => (
            <Link key={t} to="/search" search={{ q, type: t }} className={`rounded-full px-4 py-1.5 text-sm font-medium ${t === type ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {t === "ANIME" ? "Anime" : "Manga"}
            </Link>
          ))}
        </div>
      </div>
      {!q ? <p className="text-muted-foreground">Type something in the search bar.</p>
        : isLoading ? <GridSkeleton />
        : data?.length ? <CardGrid>{data.map((m) => <MediaCardView key={m.id} m={m} />)}</CardGrid>
        : <p className="text-muted-foreground">Nothing found.</p>}
    </main>
  );
}
