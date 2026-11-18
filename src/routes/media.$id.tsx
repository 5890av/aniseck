import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { fetchMedia, stripHtml, titleOf } from "@/lib/anilist";
import { setEntry, STATUSES, useWatchlist } from "@/lib/watchlist";
import { RatingInput } from "@/components/RatingInput";
import { MediaCardView, Row, RowItem } from "@/components/MediaCardView";

const REL: Record<string, string> = { PREQUEL: "Prequel", SEQUEL: "Sequel", SIDE_STORY: "Side story", ADAPTATION: "Adaptation", SOURCE: "Source", ALTERNATIVE: "Alternative", PARENT: "Parent", SPIN_OFF: "Spin-off" };
const ORDER = ["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "SPIN_OFF", "ADAPTATION", "SOURCE", "ALTERNATIVE"];

export const Route = createFileRoute("/media/$id")({
  head: () => ({ meta: [
    { title: "Title details — anideck" },
    { name: "description", content: "Synopsis, genres, trailer and characters from AniList." },
    { property: "og:title", content: "Title details — anideck" },
    { property: "og:description", content: "Synopsis, genres, trailer and characters from AniList." },
  ] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data: m, isLoading, error } = useQuery({ queryKey: ["media", id], queryFn: () => fetchMedia(Number(id)) });
  const list = useWatchlist();
  if (isLoading) return <main className="mx-auto max-w-6xl px-4 py-8"><div className="h-80 animate-pulse rounded-3xl bg-muted" /></main>;
  if (error || !m) return <main className="mx-auto max-w-6xl px-4 py-8 text-destructive">Couldn't load this title.</main>;
  const current = list[m.id]?.status;
  const card = { id: m.id, type: m.type, title: m.title, coverImage: m.coverImage, averageScore: m.averageScore, episodes: m.episodes, chapters: m.chapters, format: m.format };
  return (
    <main>
      <div className="h-40 bg-hero sm:h-64" style={m.bannerImage ? { backgroundImage: `url(${m.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} />
      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-20 flex flex-col gap-6 sm:flex-row">
          <img src={m.coverImage.large} alt={titleOf(m)} className="w-36 rounded-xl border-4 border-background shadow-card sm:w-48" />
          <div className="sm:pt-24">
            <h1 className="font-display text-3xl font-bold text-foreground">{titleOf(m)}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
              {m.averageScore != null && <span className="inline-flex items-center gap-1 font-semibold text-foreground"><Star className="h-4 w-4 fill-primary text-primary" />{m.averageScore}%</span>}
              {m.format && <span>{m.format.replace("_", " ")}</span>}
              {m.episodes && <span>{m.episodes} episodes</span>}
              {m.chapters && <span>{m.chapters} chapters</span>}
              {m.seasonYear && <span>{m.seasonYear}</span>}
              {m.studios.nodes[0] && <span>{m.studios.nodes[0].name}</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">{m.genres.map((g) => <span key={g} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{g}</span>)}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setEntry(card, current === s ? null : s)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${current === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary"}`}>
                  {current === s ? "✓ " : "+ "}{s}
                </button>
              ))}
            </div>
            <div className="mt-4"><RatingInput media={card} score={list[m.id]?.score ?? null} /></div>
          </div>
        </div>
        <section className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="mb-3 font-display text-xl font-bold text-foreground">Synopsis</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{m.description ? stripHtml(m.description) : "No synopsis available."}</p>
          </div>
          {m.trailer?.site === "youtube" && (
            <div>
              <h2 className="mb-3 font-display text-xl font-bold text-foreground">Trailer</h2>
              <iframe className="aspect-video w-full rounded-xl" src={`https://www.youtube.com/embed/${m.trailer.id}`} title="Trailer" allowFullScreen />
            </div>
          )}
        </section>
        {(() => {
          const rels = m.relations.edges.filter((e) => ORDER.includes(e.relationType)).sort((a, b) => ORDER.indexOf(a.relationType) - ORDER.indexOf(b.relationType));
          return rels.length ? <div className="mt-10"><Row title="Related">{rels.map((e) => <RowItem key={e.node.id}><MediaCardView m={e.node} badge={REL[e.relationType]} myScore={list[e.node.id]?.score} /></RowItem>)}</Row></div> : null;
        })()}
        <section className="my-10">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Characters</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {m.characters.edges.map((c) => (
              <div key={c.node.id} className="flex items-center gap-3 rounded-xl bg-card p-2 shadow-card">
                <img src={c.node.image.medium} alt={c.node.name.full} className="h-16 w-12 rounded-lg object-cover" loading="lazy" />
                <div><p className="text-sm font-semibold text-foreground">{c.node.name.full}</p><p className="text-xs capitalize text-muted-foreground">{c.role.toLowerCase()}</p></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
