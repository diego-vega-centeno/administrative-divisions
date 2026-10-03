// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock react-chartjs-2 Bar component
vi.mock("react-chartjs-2", () => ({
  Bar: (props: any) => (
    <div data-testid="mock-bar-chart" data-data={JSON.stringify(props.data)} />
  ),
}));

import BarChart from "./BarChart";

describe("BarChart Component", () => {
  it("renders mock chart element with provided labels and datasets", () => {
    const mockChartData = { France: 500, Germany: 300 };
    const mockLabels = ["France", "Germany"];
    const mockConfig = {
      color: "rgba(75,192,192,1)",
      title: "Area Comparison",
      type: "compare",
    };

    render(
      <BarChart
        chartData={mockChartData}
        labels={mockLabels}
        config={mockConfig}
      />
    );

    const chartElem = screen.getByTestId("mock-bar-chart");
    expect(chartElem).toBeDefined();

    const passedData = JSON.parse(chartElem.getAttribute("data-data") || "{}");
    expect(passedData.labels).toEqual(["France", "Germany"]);
    expect(passedData.datasets[0].label).toBe("Area Comparison");
  });
});
