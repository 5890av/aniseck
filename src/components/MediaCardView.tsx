import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { titleOf, type MediaCard } from "@/lib/anilist";

export function MediaCardView({ m, badge }: { m: MediaCard; badge?: string }) {
  const count = m.type === "ANIME" ? (m.episodes ? `${m.episodes} eps` : "Ongoing") : m.chapters ? `${m.chapters} ch` : "Manga";
  return (
    <Link to="/media/$id" params={{ id: String(m.id) }} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-card">
        <img src={m.coverImage.large} alt={titleOf(m)} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {m.averageScore != null && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur">
            <Star className="h-3 w-3 fill-primary text-primary" />{m.averageScore}%
          </span>
        )}
        {badge && <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{badge}</span>}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">{titleOf(m)}</h3>
      <p className="text-xs text-muted-foreground">{[m.format?.replace("_", " "), count].filter(Boolean).join(" · ")}</p>
    </Link>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{children}</div>;
}
export function GridSkeleton({ n = 12 }: { n?: number }) {
  return <CardGrid>{Array.from({ length: n }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-muted" />)}</CardGrid>;
}
