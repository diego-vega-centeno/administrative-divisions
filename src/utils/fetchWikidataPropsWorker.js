
self.onmessage = async (e) => {
  const ids = e.data;

  const rows = await fetchWikidataIds(e.data);

  self.postMessage(rows);
};


async function fetchWikidataIds(ids) {
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX wikibase: <http://wikiba.se/ontology#>


    SELECT ?item ?timezoneLabel ?pop ?date WHERE {
        VALUES ?item {${ids.map(id => 'wd:' + id).join(' ')}}

        OPTIONAL {?item wdt:P421 ?timezone .}
        OPTIONAL { 
          ?item p:P1082 ?statementNode .
          ?statementNode ps:P1082 ?pop .
          ?statementNode pq:P585 ?date .
        } 

        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
    ORDER BY ?item
  `

  // const endpoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
  const endpoint = 'https://query.wikidata.org/sparql'
  const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&format=json`, {
    headers: {
      'Accept': 'application/sparql-results+json',
      // 'User-Agent': 'MyNodeApp/1.0 (https://example.com)'
    }
  });

  const rows = (await response.json()).results.bindings;
  const grouped = {};

  rows.forEach(row => {

    const id = row.item.value.replace('http://www.wikidata.org/entity/', '');

    // initialize with single value props
    if (!grouped[id]) {
      grouped[id] = {
        timezone: row.timezoneLabel.value,
        populationTS: []
      }
    }

    // make population time series
    if (row.pop) {
      grouped[id].populationTS.push({
        // date: (new Date(row.date.value)).toLocaleDateString('en-GB'),
        date: new Date(row.date.value),
        pop: parseInt(row.pop.value)
      })
    }
  });

  Object.values(grouped).forEach(entry => {
    entry.populationTS.sort((a, b) => (a.date - b.date));

    entry.populationTS.forEach(pair => {
      pair.date = pair.date.toLocaleDateString('en-GB')
    })
  });

  return grouped;
}