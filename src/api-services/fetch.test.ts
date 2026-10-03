import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../context/AuthContext", () => ({
  logout: vi.fn(),
}));

import { fetchWithUserUpdate } from "./fetch";
import { logout } from "../context/AuthContext";

describe("fetchWithUserUpdate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a fetch request with credentials include and return response", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "ok" }), {
      status: 200,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    const res = await fetchWithUserUpdate("https://api.example.com/test");

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/test", {
      credentials: "include",
    });
    expect(res.status).toBe(200);
  });

  it("should invoke logout when response status is 401", async () => {
    const mockResponse = new Response(null, { status: 401 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));

    await fetchWithUserUpdate("https://api.example.com/protected");

    expect(logout).toHaveBeenCalled();
  });
});
