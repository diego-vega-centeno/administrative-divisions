import { fetchWithUserUpdate } from "./fetch";
import { CustomError } from "../types/index.ts";

interface formattedRelsType {
  relId: string;
  relName: string;
  adminLevel: string;
  parentsNames: string[];
}

async function saveLayerToDB(title: string, formattedRels: formattedRelsType) {
  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + "/layer",
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        title,
        relations: formattedRels,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed") as CustomError;
    error.code = data.code;
    throw error;
  }

  return data;
}

async function getUserLayersRelations({ signal }: { signal: AbortSignal }) {
  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + "/layer",
    { credentials: "include", signal },
  );
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed") as CustomError;
    error.code = data.code;
    throw error;
  }

  return data;
}

async function deleteLayer(layerId: string) {
  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + `/layer/${layerId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = new Error("Request failed");
    throw error;
  }

  return;
}

async function dbDeleteLayerRels(layerId: string, ids: Set<string>) {
  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + `/layer/${layerId}/rels`,
    {
      method: "DELETE",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        relsIds: [...ids],
      }),
    },
  );

  if (!response.ok) {
    const error = new Error("Request failed");
    throw error;
  }

  return;
}

async function dbUpdateLayerTitle(layerId: string, newTitle: string) {
  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + `/layer/${layerId}/update/title`,
    {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        newTitle: newTitle,
      }),
    },
  );

  const responseBody = await response.json();

  if (!response.ok) {
    const error = new Error(
      responseBody.message || "Request failed",
    ) as CustomError;
    error.code = responseBody.code;
    throw error;
  }

  return;
}

export {
  saveLayerToDB,
  getUserLayersRelations,
  deleteLayer,
  dbDeleteLayerRels,
  dbUpdateLayerTitle,
};
