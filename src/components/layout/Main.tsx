import { useEffect, useState } from "react";
import styles from "./Main.module.css";
import Footer from "./Footer.tsx";
import SearchDropdown from "../common/SearchDropdown.tsx";
import SelectAddDropdown from "../common/SelectAddDropdown.tsx";
import "leaflet/dist/leaflet.css";
import AlertDialog from "../common/AlertDialog.tsx";
import { useSearchParams } from "react-router";
import Map from "../map/Map";
import TagsSection from "../features/TagsSection.tsx";
import logger from "../../utils/logger.ts";
import { getRelationsDataWithCache, profileSize } from "../../api-services/overpass.ts";
import DataTable from "../common/DataTable.tsx";
import ChartsSection from "../charts/ChartsSection.tsx";
import WikidataSection from "../features/WikidataSection.tsx";
import ChoroplethMapSection from "../map/ChoroplethMapSection.tsx";
import { CustomError, osmRel } from "../../types/index";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store.ts";
import { setSelected } from "../../store/slices/selectedSlice.ts";

export default function Main() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const [osmRels, setOsmRels] = useState<osmRel[]>([]);
  const [isProgressIconActive, setIsProgressIconActive] = useState(false);
  const [computedDataRels, setComputedDataRels] = useState([]);
  const [isComputingIconActive, setIsComputingIconActive] = useState(false);
  const [isFetchingIconActive, setIsFetchingIconActive] = useState(false);
  const [wikidataIndex, setWikidataIndex] = useState({});

  const selected = useSelector((state: RootState) => state.selected.value);
  const dispatch = useDispatch();

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
    dispatch(setSelected([item.osm_id.toString()]));
  };

  const handleTreeSelect = (ids: string[]) => {
    dispatch(setSelected(ids));
  };

  //* effect for computed props
  useEffect(() => {
    if (!osmRels.length) return;

    setIsComputingIconActive(true);
    const worker = new Worker(
      new URL("../../workers/computePropsWorker.ts", import.meta.url),
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
      new URL("../../workers/fetchWikidataPropsWorker.ts", import.meta.url),
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
