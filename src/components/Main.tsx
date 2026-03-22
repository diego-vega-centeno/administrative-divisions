import { useEffect, useState, useContext } from "react";
import styles from "../styles/Main.module.css";
import Footer from "./Footer";
import SearchDropdown from "./SearchDropdown";
import SelectAddDropdown from "./SelectAddDropdown";
import "leaflet/dist/leaflet.css";
import AlertDialog from "./AlertDialog";
import { useSearchParams } from "react-router";
import Map from "./Map";
import { MapActionsContext, MapActionsContextType } from "./MapActionsContext";
import TagsSection from "./TagsSection";
import logger from "../utils/logger.js";
import { getRelationsDataWithCache } from "../utils/overpass";
import { profileSize } from "../utils/overpass";
import DataTable from "./DataTable";
import ChartsSection from "./ChartsSection";
import WikidataSection from "./WikidataSection";
import ChoroplethMapSection from "./ChoroplethMapSection";
import { CustomError, osmRel } from "../types/index.js";

export default function Main() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const { selected, setSelected } = useContext(
    MapActionsContext,
  ) as MapActionsContextType;
  const [osmRels, setOsmRels] = useState<osmRel[]>([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [computedDataRels, setComputedDataRels] = useState([]);
  const [isComputingIconActive, setIsComputingIconActive] = useState(false);
  const [isFetchingIconActive, setIsFetchingIconActive] = useState(false);
  const [wikidataIndex, setWikidataIndex] = useState({});

  useEffect(() => {
    if (error)
      setErrorMessage(
        `An error ocurred: ${error} \nmessage: ${message || "Something went wrong!"}`,
      );
  }, [error]);

  useEffect(() => {
    if (!selected.length) return;
    handleADDPlot(selected);
  }, [selected]);

  // for add selection from tree
  async function handleADDPlot(ids: string[]) {
    try {
      setIsProgressIconActive(true);
      const queryOSMRels: osmRel[] = await getRelationsDataWithCache(ids);
      // aproximate size in KB
      // if (process.env.NODE_ENV === 'development') profileSize(queryOSMRels);
      setOsmRels(queryOSMRels);
      // setIsProgressIconActive(false)
    } catch (error) {
      const err = error as CustomError;
      setIsProgressIconActive(false);
      handleError(err.message);
      logger.error("An error ocurred: ", error);
    }
  }

  const handleError = (errorMessage: string) => {
    setErrorMessage(errorMessage);
  };

  const handleSearchSelect = (item: Record<string, string>) => {
    setSelected([item.osm_id.toString()]);
  };

  const handleTreeSelect = (ids: string[]) => {
    setSelected(ids);
  };

  //* effect for computed props
  useEffect(() => {
    if (!osmRels.length) return;

    setIsComputingIconActive(true);
    const worker = new Worker(
      new URL("../utils/computePropsWorker.js", import.meta.url),
      { type: "module" },
    );
    // send data
    worker.postMessage(osmRels);
    // receive
    worker.onmessage = (e) => {
      setComputedDataRels(e.data);
      setIsComputingIconActive(false);
      // clean up
      worker.terminate();
    };

    // unmount
    return () => worker.terminate();
  }, [osmRels]);

  //* fetch wikidata props
  useEffect(() => {
    if (!osmRels.length) return;

    const wikidataIds = osmRels.map((rel) => rel.tags.wikidata);

    setIsFetchingIconActive(true);
    const worker = new Worker(
      new URL("../utils/fetchWikidataPropsWorker.js", import.meta.url),
      { type: "module" },
    );
    worker.postMessage(wikidataIds);
    worker.onmessage = (e) => {
      const index = {} as Record<string, any>;
      osmRels.forEach((rel) => {
        index[
          rel.tags["name:en"] ?? rel.tags["alt_name:en"] ?? rel.tags["name"]
        ] = e.data[rel.tags.wikidata];
      });
      setWikidataIndex(index);
      setIsFetchingIconActive(false);
      worker.terminate();
    };

    return () => worker.terminate();
  }, [osmRels]);

  return (
    <main className={styles.main}>
      <aside className={styles.aside}>
        <SearchDropdown
          text="Search OpenStreetMap"
          onSelect={handleSearchSelect}
          onError={handleError}
        />
        <SelectAddDropdown
          text="Select administrative division"
          onPlotRequest={handleTreeSelect}
          onError={handleError}
        />
      </aside>
      <section className={styles["main-body"]}>
        <div className={styles["main-content"]}>
          <Map
            osmRels={osmRels}
            computedDataRels={[]}
            onError={handleError}
            isProgressIconActive={isProgressIconActive}
            setIsProgressIconActive={setIsProgressIconActive}
            type={"base"}
          />
          {Boolean(osmRels.length != 0) && <TagsSection osmRels={osmRels} />}
          <DataTable
            computedDataRels={computedDataRels}
            isComputingIconActive={isComputingIconActive}
          />
          <ChoroplethMapSection
            osmRels={osmRels}
            computedDataRels={computedDataRels}
            isComputingIconActive={isComputingIconActive}
            onError={handleError}
          />
          <ChartsSection
            computedDataRels={computedDataRels}
            isComputingIconActive={isComputingIconActive}
          />
          <WikidataSection
            wikidataIndex={wikidataIndex}
            isFetchingIconActive={isFetchingIconActive}
          />
        </div>
        <Footer />
      </section>
      <AlertDialog
        open={Boolean(errorMessage)}
        severity={"warning"}
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />
    </main>
  );
}
