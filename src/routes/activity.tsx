import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchGlobalActivity, titleOf, type MediaCard } from "@/lib/anilist";
import { useLocalActivity } from "@/lib/watchlist";

export const Route = createFileRoute("/activity")({
  head: () => ({ meta: [
    { title: "Activity — anideck" },
    { name: "description", content: "Live AniList list updates and your own watchlist history." },
    { property: "og:title", content: "Activity — anideck" },
    { property: "og:description", content: "Live AniList list updates and your own watchlist history." },
  ] }),
  component: Activity,
});

const ago = (ms: number) => {
  const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return new Date(ms).toLocaleDateString();
};

function Item({ media, avatar, children, at }: { media: MediaCard; avatar?: string; children: React.ReactNode; at: number }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-card p-2 shadow-card">
      <Link to="/media/$id" params={{ id: String(media.id) }} className="shrink-0">
        <img src={media.coverImage.large} alt={titleOf(media)} className="h-16 w-11 rounded-md object-cover" loading="lazy" />
      </Link>
      <div className="min-w-0 flex-1 text-sm text-muted-foreground">{children}</div>
      {avatar && <img src={avatar} alt="" className="h-8 w-8 rounded-full" loading="lazy" />}
      <time className="shrink-0 text-xs text-muted-foreground" title={new Date(at).toLocaleString()}>{ago(at)}</time>
    </li>
  );
}

function Activity() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({ queryKey: ["global-activity"], queryFn: fetchGlobalActivity, refetchInterval: 60_000 });
  const local = useLocalActivity();
  const title = (m: MediaCard) => <Link to="/media/$id" params={{ id: String(m.id) }} className="font-semibold text-foreground hover:text-primary">{titleOf(m)}</Link>;
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-2">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">Global AniList activity</h1>
          <button onClick={() => refetch()} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">{isFetching ? "Loading…" : "Refresh"}</button>
        </div>
        {error && <p className="text-destructive">Couldn't load AniList activity.</p>}
        {isLoading ? <div className="h-64 animate-pulse rounded-xl bg-muted" /> : (
          <ul className="space-y-2">{data?.map((a) => (
            <Item key={a.id} media={a.media!} avatar={a.user.avatar.medium} at={a.createdAt * 1000}>
              <span className="font-semibold text-foreground">{a.user.name}</span> {a.status}{a.progress ? ` ${a.progress} of` : ""} {title(a.media!)}
            </Item>))}</ul>
        )}
      </section>
      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-foreground">My local activity</h2>
        {local.length ? (
          <ul className="space-y-2">{local.map((a) => (
            <Item key={a.id} media={a.media} at={a.at}>{title(a.media)}<br />{a.detail}</Item>))}</ul>
        ) : <p className="text-muted-foreground">Add a show, change its status or rate it — it'll show up here.</p>}
      </section>
    </main>
  );
}
