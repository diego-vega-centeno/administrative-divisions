import styles from '../styles/About.module.css'

export default function About() {

  return (
    <main className={styles['main']}>
      <h2>Administrative divisions from OpenStreetMap</h2>
      <div className={styles['section']}>
        <h3>What is this?</h3>
        <p>This is an interactive tool to explore, compare, and export administrative divisions from OpenStreetMap. Browse 178,000+ divisions across 70 countries via hierarchical tree or search, visualize on maps, compare stats, and download structured data.</p>
      </div>
      <div className={styles['section']}>
        <h3>Basic usage</h3>
        <ul className={styles['ul']}>
          <li>Select divisions → Plot on map → View comparison tables, choropleth maps, and Wikidata links</li>
          <li>Download data as structured JSON or GeoJSON layers (both with hierarchy)</li>
          <li>Save and edit favorite selections in your session</li>
          <li>Use the rest API to directly get the hierarchy of each country</li>
        </ul>
      </div>
      <div className={styles['section']}>
        <h3>Why did I build it?</h3>
        <p>OpenStreetMap offers a query to get administrative boundaries but there’s no direct way of getting and displaying the hierarchy and compare them. I’ve scraped, tested and collected other information of the structure in an easy to select, display and get compare table, charts and map from this divisions.</p>
        <br />
        <p>Others solutions like GADM are slow to update, Wikipedia lacks geometry and QGIS has steep learning curve.<br />This app gives researchers and journalists a fast way to explore current OSM data, compare divisions visually, and export analysis-ready files.</p>
      </div>
      <div className={styles['section']}>
        <h3>How did I build it?</h3>
        <ul className={styles['ul']}>
          <li>Scraped 178k divisions from OSM using recursive Overpass API queries (via area element)</li>
          <li>Cleaned and validated through spatial checks and tag verification</li>
          <li>Using jstree, leaflet, turf and SPARQL Wikidata queries, I consolidated data and information into sections easy to use and navigate.</li>
          <li>Due to the type of data (178,000 nodes with geometries) several optimizations being done like caching, lazy loading and web workers to guarantee an easy to use experience</li>
        </ul>
      </div>
      <div className={styles['section']}>
        <h3>Performance optimizations:</h3>
        <ul className={styles['ul']}>
          <li>Queries are done in the frontend to OSM. Taking advantage of OSM infrastructure avoids expensive storage/maintenance of duplicate geometry data and reduces load on the backend</li>
          <li>Divisions data (tags and geometry) are cached using indexedDB (100MB limit) to reduce queries and improve user experience</li>
          <li>Built a resumable Github workflows (scrape, clean and 3 spatial test) with persistent storage in backblaze b2</li>
          <li>Lazy loading on jstree by country to reduce total blocking time of page.</li>
          <li>Backend search being done in the backend.</li>
          <li>Web Workers for heavy calculations and map generations to not block the main thread.</li>
        </ul>
      </div>
      <div className={styles['section']}>
        <h3>Features:</h3>
        <ul className={styles['ul']}>
          <li>Select or search from 178,000+ administrative divisions within 70 countries</li>
          <li>Plot OSM polygons in a map with included tags</li>
          <li>Compare geospatial properties (area, perimeter, pop density) in sort-able tables</li>
          <li>Choropleth map for visual comparison</li>
          <li>Time series charts for computed properties.</li>
          <li>Save favorites and edit for quick access.</li>
          <li>Download tags and polygon data from OSM as json or geojson feature collection (both with hierarchy)</li>
          <li>REST API to get admin divisions structure for each country</li>
          <li>Wikidata integration for basic properties and population time series</li>
        </ul>
      </div>
      <div className={styles['section']}>
        <h3>REST API</h3>
        <i>Example: Returns admin divisions at levels 4 and 6 for country ID 80500 (Australia) with hierarchy and metadata.</i>
        <br />
        <br />
        <p>GET https://administrative-divisions-server.onrender.com/api/v1/countries/80500?levels=4,6</p>
      </div>
    </main>
  )
}