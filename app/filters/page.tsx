import { FilterExperience } from "@/components/filters/FilterExperience";

export default async function FiltersPage({
  searchParams,
}: {
  searchParams: Promise<{ songTitle?: string; artist?: string }>;
}) {
  const params = await searchParams;
  const songTitle = typeof params.songTitle === "string" ? params.songTitle.slice(0, 160) : "";
  const artist = typeof params.artist === "string" ? params.artist.slice(0, 120) : "";

  return <FilterExperience songTitle={songTitle} artist={artist} />;
}
