// const endpoint = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql'
const endpoint = "https://query.wikidata.org/sparql";

self.onmessage = async (e) => {
  const ids = e.data;
  const index = {} as Record<string, any>;

  const propsIndex = await fetchWikidataIds(e.data);
  const tsIndex = await fetchWikidataTS(e.data);

  for (const id of ids) {
    index[id] = { ...propsIndex[id], ...tsIndex[id] };
  }

  self.postMessage(index);
};

async function fetchWikidataIds(ids: string[]): Promise<Record<string, any>> {
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX wikibase: <http://wikiba.se/ontology#>


    SELECT ?item ?timezoneLabel ?officialName ?ethnicGroupLabel 
    ?officialLangLabel ?continentLabel ?capitalLabel ?languageLabel ?area
    ?ISO3166_2 ?FIPS WHERE {
        VALUES ?item {${ids.map((id) => "wd:" + id).join(" ")}}
        OPTIONAL {?item wdt:P421 ?timezone .}
        OPTIONAL {?item wdt:P1448 ?officialName .}
        OPTIONAL {?item wdt:P172 ?ethnicGroup .}
        OPTIONAL {?item wdt:P37 ?officialLang .}
        OPTIONAL {?item wdt:P30 ?continent .}
        OPTIONAL {?item wdt:P36 ?capital .}
        OPTIONAL {?item wdt:P2936 ?language .}
        OPTIONAL {?item wdt:P2046 ?area .}
        OPTIONAL {?item wdt:P300 ?ISO3166_2 .}
        OPTIONAL {?item wdt:P901 ?FIPS .}
        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
    ORDER BY ?item
  `;

  const response = await fetch(
    `${endpoint}?query=${encodeURIComponent(query)}&format=json`,
    {
      headers: {
        Accept: "application/sparql-results+json",
      },
    },
  );

  const rows = (await response.json()).results.bindings;
  const grouped = {} as Record<string, any>;

  rows.forEach((row: Record<string, any>) => {
    const id = row.item.value.replace("http://www.wikidata.org/entity/", "");

    // initialize with single value props
    if (!grouped[id]) {
      grouped[id] = {
        timezone: row.timezoneLabel?.value,
        continent: row.continentLabel?.value,
        capital: row.capitalLabel?.value,
        area: row.area?.value,
        ISO3166_2: row.ISO3166_2?.value,
        FIPS: row.FIPS?.value,
        officialName: new Set(),
        ethnicGroup: new Set(),
        officialLang: new Set(),
        language: new Set(),
      };
    }

    if (row.officialName) {
      grouped[id].officialName.add(row.officialName.value);
    }

    if (row.ethnicGroupLabel) {
      grouped[id].ethnicGroup.add(row.ethnicGroupLabel.value);
    }

    if (row.officialLangLabel) {
      grouped[id].officialLang.add(row.officialLangLabel.value);
    }

    if (row.languageLabel) {
      grouped[id].language.add(row.languageLabel.value);
    }
  });

  return grouped;
}

async function fetchWikidataTS(ids: string[]) {
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX bd: <http://www.bigdata.com/rdf#>
    PREFIX wikibase: <http://wikiba.se/ontology#>


    SELECT ?item ?pop ?date WHERE {
        VALUES ?item {${ids.map((id) => "wd:" + id).join(" ")}}

        ?item p:P1082 ?statementNode .
        ?statementNode ps:P1082 ?pop .
        ?statementNode pq:P585 ?date .

        SERVICE wikibase:label {
            bd:serviceParam wikibase:language "en" .
        }
    }
    ORDER BY ?item
  `;
  const response = await fetch(
    `${endpoint}?query=${encodeURIComponent(query)}&format=json`,
    {
      headers: {
        Accept: "application/sparql-results+json",
        // 'User-Agent': 'MyNodeApp/1.0 (https://example.com)'
      },
    },
  );

  const rows = (await response.json()).results.bindings;
  const grouped = {} as Record<string, any>;

  interface PopulationEntry {
    date: any;
    pop: number;
  }

  rows.forEach((row: Record<string, any>) => {
    const id = row.item.value.replace("http://www.wikidata.org/entity/", "");

    // initialize with single value props
    if (!grouped[id]) {
      grouped[id] = {
        populationTS: [],
      };
    }

    if (row.pop) {
      grouped[id].populationTS.push({
        date: new Date(row.date.value),
        pop: parseInt(row.pop.value),
      } as PopulationEntry);
    }
  });

  Object.values(grouped).forEach((entry) => {
    entry.populationTS.sort(
      (a: PopulationEntry, b: PopulationEntry) =>
        a.date - b.date,
    );

    entry.populationTS.forEach((pair: { date: any; pop: number }) => {
      pair.date = pair.date.toLocaleDateString("en-GB");
    });
  });

  return grouped;
}
