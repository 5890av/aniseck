import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const link = "rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";
  const active = { className: "bg-secondary text-foreground" };
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-foreground">ani<span className="text-primary">deck</span></Link>
        <nav className="flex gap-1">
          <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/watchlist" className={link} activeProps={active}>My Watchlist</Link>
          <Link to="/activity" className={link} activeProps={active}>Activity</Link>
        </nav>
        <form className="order-last w-full sm:order-none sm:ml-auto sm:w-72" onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate({ to: "/search", search: { q: q.trim(), type: "ANIME" } }); }}>
          <label className="flex items-center gap-2 rounded-full border border-input bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anime or manga…" className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" aria-label="Search" />
          </label>
        </form>
      </div>
    </header>
  );
}
