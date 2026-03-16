import { logout } from "../components/AuthContext";

async function fetchWithUserUpdate(url: string, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If fetch return a lack of valid credentials
  // Then token is wrong; we need to log out
  if (res.status === 401) {
    logout?.();
  }

  return res;
}

export { fetchWithUserUpdate };
