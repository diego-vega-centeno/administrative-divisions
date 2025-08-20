async function getNominatimSearch(query) {

  const endpoint = 'https://nominatim.openstreetmap.org/search';

  // display busy icon
  // document.getElementById("entitySelectorBusyIcon").style.display = "block";
  
  // use the free-form query
  const url = `${endpoint}?q=${query}&format=jsonv2`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    // display error message here
  }

  const entitiesFound = await res.json();
  // filters to get relations only
  const relationsFound = entitiesFound.filter(ele => ele.osm_type == "relation");

  /* hide busy icon */
  // document.getElementById("entitySelectorBusyIcon").style.display = "none";

  return relationsFound;
}

export { getNominatimSearch }