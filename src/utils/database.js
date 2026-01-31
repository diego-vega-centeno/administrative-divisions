import { fetchWithUserUpdate } from "../utils/fetch.js";

async function saveLayerToDB(title, selectedNodes) {

  const formattedRelations = selectedNodes.map(ele => ({ relId: ele.id, relName: ele.text }))
  const response = await fetchWithUserUpdate(import.meta.env.VITE_BACKEND_URL + '/layer', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      title,
      relations: formattedRelations
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.code = data.code;
    throw error;
  }

  return data;
}

async function getUserLayersRelations({ signal }) {

  const response = await fetchWithUserUpdate(
    import.meta.env.VITE_BACKEND_URL + '/layer',
    { credentials: 'include', signal }
  );
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.code = data.code;
    throw error;
  }

  return data;
}

export { saveLayerToDB, getUserLayersRelations }