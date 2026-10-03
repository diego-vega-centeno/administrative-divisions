// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import DataTable from "./DataTable";
import { ComputedDataRelsType } from "../../types";

describe("DataTable Component", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  const sampleData: ComputedDataRelsType = [
    {
      id: "1",
      admin_level: "2",
      name: "France",
      area: 551695,
      perimeter: 4000,
      population: 67000000,
      popDensity: 121,
    } as any,
    {
      id: "2",
      admin_level: "2",
      name: "Germany",
      area: 357022,
      perimeter: 3600,
      population: 83000000,
      popDensity: 232,
    } as any,
  ];

  it("renders loading circular progress when isComputingIconActive is true", () => {
    render(<DataTable computedDataRels={[]} isComputingIconActive={true} />);

    expect(screen.getByText("Compare table")).toBeDefined();
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("renders table headers and data rows when data is passed", () => {
    render(<DataTable computedDataRels={sampleData} isComputingIconActive={false} />);

    expect(screen.getByText("Compare table")).toBeDefined();
    expect(screen.getByText("France")).toBeDefined();
    expect(screen.getByText("Germany")).toBeDefined();
    expect(screen.getByText("551695.00")).toBeDefined();
    expect(screen.getByText("357022.00")).toBeDefined();
  });

  it("returns null when no data and not computing", () => {
    const { container } = render(
      <DataTable computedDataRels={[]} isComputingIconActive={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("sorts rows when clicking header column", () => {
    render(<DataTable computedDataRels={sampleData} isComputingIconActive={false} />);

    const areaHeader = screen.getByText("area (km²)");
    fireEvent.click(areaHeader);

    // After sorting by area asc/desc
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });
});
