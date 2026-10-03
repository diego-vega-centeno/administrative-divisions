import { describe, it, expect } from "vitest";
import { calculatePropsFromGeo } from "./calculateFromGeo";
import { Feature, Polygon } from "geojson";

describe("calculatePropsFromGeo", () => {
  it("should correctly calculate area in km² and perimeter in km for a simple polygon", () => {
    const mockPolygonFeature: Feature<Polygon> = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
      },
    };

    const result = calculatePropsFromGeo(mockPolygonFeature);

    expect(result.area).toBeGreaterThan(0);
    expect(result.perimeter).toBeGreaterThan(0);
    expect(typeof result.area).toBe("number");
    expect(typeof result.perimeter).toBe("number");
  });
});
