export type MediaType = "ANIME" | "MANGA";
export interface MediaCard {
  id: number; type: MediaType;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; color: string | null };
  averageScore: number | null; episodes: number | null; chapters: number | null; format: string | null;
}
export interface MediaDetail extends MediaCard {
  description: string | null; genres: string[]; bannerImage: string | null;
  status: string | null; seasonYear: number | null; studios: { nodes: { name: string }[] };
  trailer: { id: string; site: string } | null;
  relations: { edges: { relationType: string; node: MediaCard }[] };
  characters: { edges: { role: string; node: { id: number; name: { full: string }; image: { medium: string } } }[] };
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(json.errors?.[0]?.message ?? "AniList request failed");
  return json.data as T;
}

const CARD = `id type title{romaji english} coverImage{large color} averageScore episodes chapters format`;

export const HOME_ROWS = [
  ["trending", "Trending now", "sort:TRENDING_DESC"],
  ["upcoming", "Upcoming anime", "sort:POPULARITY_DESC, status:NOT_YET_RELEASED"],
  ["top", "Top rated", "sort:SCORE_DESC"],
  ["popular", "Most popular", "sort:POPULARITY_DESC"],
  ["favorited", "Most favorited", "sort:FAVOURITES_DESC"],
] as const;
export type HomeKey = (typeof HOME_ROWS)[number][0];
export const fetchHome = () => gql<Record<HomeKey, { media: MediaCard[] }>>(
  `query{ ${HOME_ROWS.map(([k, , a]) => `${k}: Page(perPage:15){ media(type:ANIME, isAdult:false, ${a}){${CARD}} }`).join(" ")} }`, {});

export interface GlobalActivity {
  id: number; status: string; progress: string | null; createdAt: number;
  user: { name: string; avatar: { medium: string } }; media: MediaCard | null;
}
export const fetchGlobalActivity = () => gql<{ Page: { activities: (GlobalActivity | Record<string, never>)[] } }>(
  `query{ Page(perPage:25){ activities(type:MEDIA_LIST, sort:ID_DESC){ ... on ListActivity {
    id status progress createdAt user{name avatar{medium}} media{${CARD}} } } } }`, {})
  .then((d) => d.Page.activities.filter((a): a is GlobalActivity => "id" in a && !!(a as GlobalActivity).media));

export const searchMedia = (search: string, type: MediaType) => gql<{ Page: { media: MediaCard[] } }>(
  `query($s:String,$t:MediaType){ Page(perPage:30){ media(search:$s, type:$t, isAdult:false, sort:SEARCH_MATCH){${CARD}} } }`,
  { s: search, t: type }).then((d) => d.Page.media);

export const fetchMedia = (id: number) => gql<{ Media: MediaDetail }>(
  `query($id:Int){ Media(id:$id){ ${CARD} description(asHtml:false) genres bannerImage status seasonYear
    studios(isMain:true){nodes{name}} trailer{id site}
    relations{ edges{ relationType(version:2) node{${CARD}} } }
    characters(perPage:12, sort:[ROLE,RELEVANCE]){ edges{ role node{ id name{full} image{medium} } } } } }`,
  { id }).then((d) => d.Media);

export const titleOf = (m: MediaCard) => m.title.english ?? m.title.romaji;
export const stripHtml = (s: string) => s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
