async function getRelation(relationID, out = "geom") {
  const endPoint = "https://overpass-api.de/api/interpreter";

  // to accept an array
  const idsArray = ((typeof relationID) == "number") ? [relationID] : relationID;

  const query = `
    [out:json][timeout:90];
    rel(id:${idsArray.join(",")});
    out ${out};
    `;

  const response = await fetch(endPoint, { method: "POST", body: ("data=" + encodeURIComponent(query)) });

  if (!response.ok) {
    // A 'not ok' response doesn't throw an error, so throw one and add the response object
    throw new Error("Fetch response was not ok", { cause: response });
  }

  const osmRes = await response.json();

  if (osmRes.elements.length === 0) {
    throw new Error("Fetch response has empty elements");
  }

  return osmRes;
}

export { getRelation }