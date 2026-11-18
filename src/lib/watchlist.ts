import { useEffect, useState } from "react";
import type { MediaCard } from "./anilist";

export const STATUSES = ["Watching", "Completed", "Plan to Watch"] as const;
export type WatchStatus = (typeof STATUSES)[number];
export type Entry = { media: MediaCard; status: WatchStatus; addedAt: number };
const KEY = "anilist-watchlist";

function read(): Record<number, Entry> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
export function setEntry(media: MediaCard, status: WatchStatus | null) {
  const all = read();
  if (status) all[media.id] = { media, status, addedAt: all[media.id]?.addedAt ?? Date.now() };
  else delete all[media.id];
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("watchlist"));
}
export function useWatchlist() {
  const [list, setList] = useState<Record<number, Entry>>({});
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener("watchlist", sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener("watchlist", sync); window.removeEventListener("storage", sync); };
  }, []);
  return list;
}
