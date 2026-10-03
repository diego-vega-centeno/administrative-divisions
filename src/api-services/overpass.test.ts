import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock indexedDB helpers
vi.mock("../utils/indexedDB", () => ({
  getStoreRelation: vi.fn(),
  putStoreRelations: vi.fn(),
}));

import {
  getRelationsOSMData,
  formatData,
  getRelationsDataWithCache,
} from "./overpass";
import { getStoreRelation, putStoreRelations } from "../utils/indexedDB";
import { JstreeNode, SelectedNodesType } from "../types";

describe("overpass service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getRelationsOSMData", () => {
    it("should return OSM data from the first successful endpoint", async () => {
      const mockData = { elements: [{ id: 123, type: "relation" }] };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }))
      );

      const result = await getRelationsOSMData(["123"]);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should retry with the next endpoint if the first fails", async () => {
      const mockData = { elements: [{ id: 456, type: "relation" }] };
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce(new Response("Server Error", { status: 500 }))
          .mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }))
      );

      const result = await getRelationsOSMData(["456"]);

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should throw error if all endpoints fail", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("Server Error", { status: 500 }))
      );

      await expect(getRelationsOSMData(["999"])).rejects.toThrow();
    });
  });

  describe("formatData", () => {
    const sampleSelectedNodes: Partial<JstreeNode>[] = [
      { id: "100", text: "Country", parent: "#", parents: ["#"], children: ["200"] },
      { id: "200", text: "Region", parent: "100", parents: ["#", "100"], children: [] },
    ];

    it("should strip tags if params.tags is false", () => {
      const elements = [
        { id: 100, tags: { name: "Country" } },
        { id: 200, tags: { name: "Region" } },
      ];

      const result = formatData(elements, { tags: false }, sampleSelectedNodes as SelectedNodesType) as any[];

      expect(result[0].tags).toBeUndefined();
      expect(result[1].tags).toBeUndefined();
    });

    it("should format as tree hierarchy when params.structure === 'tree'", () => {
      const elements = [
        { id: 100, tags: { name: "Country" } },
        { id: 200, tags: { name: "Region" } },
      ];

      const result = formatData(elements, { structure: "tree" }, sampleSelectedNodes as SelectedNodesType) as any[];

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Root node (parent 0 == id : 100)
      expect(result[0].id).toBe(100);
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe(200);
    });
  });

  describe("getRelationsDataWithCache", () => {
    it("should return cached items and only fetch non-cached IDs", async () => {
      const cached = [{ id: 100, tags: { name: "Cached Country" } }];
      const remoteResponse = { elements: [{ id: 200, tags: { name: "Fetched Region" } }] };

      vi.mocked(getStoreRelation).mockResolvedValue(cached as any);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response(JSON.stringify(remoteResponse), { status: 200 }))
      );

      const result = await getRelationsDataWithCache(["100", "200"]);

      expect(getStoreRelation).toHaveBeenCalledWith([100, 200]);
      expect(putStoreRelations).toHaveBeenCalledWith(remoteResponse.elements);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(cached[0]);
      expect(result).toContainEqual(remoteResponse.elements[0]);
    });
  });
});
