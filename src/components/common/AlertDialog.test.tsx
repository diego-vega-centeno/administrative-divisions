// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertDialog from "./AlertDialog";

describe("AlertDialog Component", () => {
  it("renders message when open is true", () => {
    render(
      <AlertDialog
        open={true}
        severity="error"
        message="Test alert message"
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Test alert message")).toBeDefined();
  });

  it("does not render message content when open is false", () => {
    render(
      <AlertDialog
        open={false}
        severity="info"
        message="Hidden alert message"
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText("Hidden alert message")).toBeNull();
  });

  it("calls onClose callback when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <AlertDialog
        open={true}
        severity="warning"
        message="Dismissible alert"
        onClose={handleClose}
      />,
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
