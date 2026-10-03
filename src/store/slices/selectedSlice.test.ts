import { describe, it, expect } from "vitest";
import selectedReducer, { setSelected, clearSelected } from "./selectedSlice";

describe("selectedSlice reducer", () => {
  const initialState = { value: [] };

  it("should return the initial state when passed an empty action", () => {
    const result = selectedReducer(undefined, { type: "" });
    expect(result).toEqual({ value: [] });
  });

  it("should handle setSelected", () => {
    const payload = ["item1", "item2"];
    const action = setSelected(payload);
    const state = selectedReducer(initialState, action);

    expect(state.value).toEqual(["item1", "item2"]);
  });

  it("should handle clearSelected", () => {
    const stateWithItems = { value: ["item1", "item2"] };
    const action = clearSelected();
    const state = selectedReducer(stateWithItems, action);

    expect(state.value).toEqual([]);
  });
});
