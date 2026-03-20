async function getNominatimSearch(query: string) {
  const endpoint = "https://nominatim.openstreetmap.org/search";

  // use the free-form query
  const url = `${endpoint}?q=${query}&format=jsonv2`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Nonatim fetch response was not ok");
  }

  const entitiesFound = await res.json();
  // filters to get relations only
  const relationsFound = entitiesFound.filter(
    (ele: Record<string, any>) => ele.osm_type == "relation",
  );

  return relationsFound;
}

export { getNominatimSearch };
