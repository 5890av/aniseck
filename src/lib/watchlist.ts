import { useEffect, useState } from "react";
import type { MediaCard } from "./anilist";

export const STATUSES = ["Watching", "Completed", "Plan to Watch"] as const;
export type WatchStatus = (typeof STATUSES)[number];
export type Entry = { media: MediaCard; status: WatchStatus | null; score: number | null; addedAt: number };
export type LocalActivity = { id: string; at: number; media: MediaCard; kind: "added" | "status" | "rated" | "removed"; detail: string };
const KEY = "anilist-watchlist";
const LOG = "anilist-activity";

/** Personal scores are 1–10, decimals allowed, rounded to one decimal. Returns null when invalid/empty. */
export function parseScore(input: string | number): number | null {
  const n = typeof input === "number" ? input : parseFloat(String(input).replace(",", "."));
  if (!Number.isFinite(n) || n < 1 || n > 10) return null;
  return Math.round(n * 10) / 10;
}

function load<T>(k: string, d: T): T {
  try { return JSON.parse(localStorage.getItem(k) ?? "") as T; } catch { return d; }
}
const read = () => load<Record<number, Entry>>(KEY, {});
export const readLog = () => load<LocalActivity[]>(LOG, []);

function log(media: MediaCard, kind: LocalActivity["kind"], detail: string) {
  const all = readLog();
  all.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), media, kind, detail });
  localStorage.setItem(LOG, JSON.stringify(all.slice(0, 300)));
}
function save(all: Record<number, Entry>) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("watchlist"));
}

export function setEntry(media: MediaCard, status: WatchStatus | null) {
  const all = read(); const prev = all[media.id];
  if (status) {
    all[media.id] = { media, status, score: prev?.score ?? null, addedAt: prev?.addedAt ?? Date.now() };
    if (!prev?.status) log(media, "added", `Added as ${status}`);
    else if (prev.status !== status) log(media, "status", `${prev.status} → ${status}`);
  } else if (prev) {
    log(media, "removed", "Removed from watchlist");
    if (prev.score != null) all[media.id] = { ...prev, status: null }; else delete all[media.id];
  }
  save(all);
}

export function setScore(media: MediaCard, score: number | null) {
  const all = read(); const prev = all[media.id];
  if ((prev?.score ?? null) === score) return;
  all[media.id] = { media, status: prev?.status ?? null, score, addedAt: prev?.addedAt ?? Date.now() };
  log(media, "rated", score == null ? "Cleared rating" : `Rated ${score}/10`);
  save(all);
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
export function useLocalActivity() {
  const [l, setL] = useState<LocalActivity[]>([]);
  useEffect(() => {
    const sync = () => setL(readLog());
    sync(); window.addEventListener("watchlist", sync);
    return () => window.removeEventListener("watchlist", sync);
  }, []);
  return l;
}
