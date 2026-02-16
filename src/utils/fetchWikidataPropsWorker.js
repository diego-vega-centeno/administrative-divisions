
// const endpoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
const endpoint = 'https://query.wikidata.org/sparql'

self.onmessage = async (e) => {
  const ids = e.data;
  const index = {}

  const propsIndex = await fetchWikidataIds(e.data);
  const tsIndex = await fetchWikidataTS(e.data);

  for (const id of ids) {
    index[id] = { ...propsIndex[id], ...tsIndex[id] }
  }

  self.postMessage(index);
};


async function fetchWikidataIds(ids, dataIndex) {
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX wikibase: <http://wikiba.se/ontology#>


    SELECT ?item ?timezoneLabel ?officialName ?ethnicGroupLabel 
    ?officialLangLabel ?continentLabel ?capitalLabel WHERE {
        VALUES ?item {${ids.map(id => 'wd:' + id).join(' ')}}
        OPTIONAL {?item wdt:P421 ?timezone .}
        OPTIONAL {?item wdt:P1448 ?officialName .}
        OPTIONAL {?item wdt:P172 ?ethnicGroup .}
        OPTIONAL {?item wdt:P37 ?officialLang .}
        OPTIONAL {?item wdt:P30 ?continent .}
        OPTIONAL {?item wdt:P36 ?capital .}
        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
    ORDER BY ?item
  `

  const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&format=json`, {
    headers: {
      'Accept': 'application/sparql-results+json',
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
        continent: row.continentLabel?.value,
        capital: row.capitalLabel.value,
        officialName: new Set(),
        ethnicGroup: new Set(),
        officialLang: new Set()
      }
    }

    if (row.officialName) {
      grouped[id].officialName.add(row.officialName.value)
    }

    if (row.ethnicGroupLabel) {
      grouped[id].ethnicGroup.add(row.ethnicGroupLabel.value)
    }

    if (row.officialLangLabel) {
      grouped[id].officialLang.add(row.officialLangLabel.value)
    }
  });

  return grouped;
}

async function fetchWikidataTS(ids) {
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX wikibase: <http://wikiba.se/ontology#>


    SELECT ?item ?pop ?date WHERE {
        VALUES ?item {${ids.map(id => 'wd:' + id).join(' ')}}

        ?item p:P1082 ?statementNode .
        ?statementNode ps:P1082 ?pop .
        ?statementNode pq:P585 ?date .

        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
    ORDER BY ?item
  `
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
        populationTS: []
      }
    }

    if (row.pop) {
      grouped[id].populationTS.push({
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