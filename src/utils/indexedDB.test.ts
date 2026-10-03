// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import {
  putStoreRelations,
  getStoreRelation,
  getAllStoredRelations,
  clearAllStoredRelations,
  cleanDBCache,
} from "./indexedDB";

describe("indexedDB utility", () => {
  beforeEach(async () => {
    await clearAllStoredRelations();
  });

  it("should store and retrieve relations by ID", async () => {
    const mockRelations = [
      { id: 100, type: "relation", tags: { name: "Region A" } } as any,
      { id: 200, type: "relation", tags: { name: "Region B" } } as any,
    ];

    await putStoreRelations(mockRelations);

    const retrieved = await getStoreRelation([100, 200]);

    expect(retrieved).toHaveLength(2);
    expect(retrieved).toEqual([
      { id: 100, type: "relation", tags: { name: "Region A" } },
      { id: 200, type: "relation", tags: { name: "Region B" } },
    ]);
  });

  it("should return nulls or filter non-existent IDs when calling getStoreRelation", async () => {
    const mockRelations = [
      { id: 300, type: "relation", tags: { name: "City X" } } as any,
    ];

    await putStoreRelations(mockRelations);

    const retrieved = await getStoreRelation([300, 999]);

    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe(300);
  });

  it("should retrieve all stored relations using getAllStoredRelations", async () => {
    const mockRelations = [
      { id: 10, type: "relation", tags: { name: "Alpha" } } as any,
      { id: 20, type: "relation", tags: { name: "Beta" } } as any,
    ];

    await putStoreRelations(mockRelations);

    const all = (await getAllStoredRelations()) as any[];

    expect(all).toHaveLength(2);
    expect(all.map((item) => item.id)).toContain(10);
    expect(all.map((item) => item.id)).toContain(20);
  });

  it("should clear all stored relations", async () => {
    const mockRelations = [
      { id: 50, type: "relation", tags: { name: "Test" } } as any,
    ];

    await putStoreRelations(mockRelations);
    await clearAllStoredRelations();

    const all = (await getAllStoredRelations()) as any[];

    expect(all).toHaveLength(0);
  });

  it("should execute cleanDBCache LRU cleanup when usage exceeds storage cap", async () => {
    // Populate database with mock items
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      type: "relation",
      tags: { name: `Item ${i + 1}` },
    }));
    await putStoreRelations(items as any);

    // Mock navigator.storage.estimate to simulate high usage (> 100 MB), then low usage after deletion
    let calls = 0;
    const mockEstimate = vi.fn().mockImplementation(async () => {
      calls++;
      if (calls === 1) {
        return { usage: 150 * 1_000_000, quota: 1000 * 1_000_000 }; // 150 MB (> 100 MB cap)
      }
      return { usage: 50 * 1_000_000, quota: 1000 * 1_000_000 }; // 50 MB (< 80 MB threshold)
    });

    Object.defineProperty(navigator, "storage", {
      value: { estimate: mockEstimate },
      writable: true,
      configurable: true,
    });

    await cleanDBCache();

    // Check that items were deleted via LRU batch deletion
    const remaining = (await getAllStoredRelations()) as any[];
    expect(remaining.length).toBeLessThan(15);
  });
});
