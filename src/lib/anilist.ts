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

export const fetchHome = () => gql<{ trending: { media: MediaCard[] }; popular: { media: MediaCard[] } }>(
  `query{ trending: Page(perPage:12){ media(type:ANIME, sort:TRENDING_DESC, isAdult:false){${CARD}} }
          popular: Page(perPage:12){ media(type:ANIME, sort:POPULARITY_DESC, isAdult:false){${CARD}} } }`, {});

export const searchMedia = (search: string, type: MediaType) => gql<{ Page: { media: MediaCard[] } }>(
  `query($s:String,$t:MediaType){ Page(perPage:30){ media(search:$s, type:$t, isAdult:false, sort:SEARCH_MATCH){${CARD}} } }`,
  { s: search, t: type }).then((d) => d.Page.media);

export const fetchMedia = (id: number) => gql<{ Media: MediaDetail }>(
  `query($id:Int){ Media(id:$id){ ${CARD} description(asHtml:false) genres bannerImage status seasonYear
    studios(isMain:true){nodes{name}} trailer{id site}
    characters(perPage:12, sort:[ROLE,RELEVANCE]){ edges{ role node{ id name{full} image{medium} } } } } }`,
  { id }).then((d) => d.Media);

export const titleOf = (m: MediaCard) => m.title.english ?? m.title.romaji;
export const stripHtml = (s: string) => s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
