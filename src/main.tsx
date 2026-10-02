import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { cleanDBCache } from "./utils/indexedDB";

//  Clean cache, databse is initialized inside
cleanDBCache();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <App />
  </StrictMode>,
);
