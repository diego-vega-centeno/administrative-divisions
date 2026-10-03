// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import LoginMenu from "./LoginMenu";

describe("LoginMenu Component", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("renders login options when modal is open", () => {
    render(<LoginMenu open={true} onClose={() => {}} />);

    expect(screen.getByText("Login")).toBeDefined();
    expect(screen.getByText("Choose your login method:")).toBeDefined();
    expect(screen.getAllByText("Continue with Google").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Continue with OpenStreeMap").length).toBeGreaterThan(0);
  });

  it("does not render modal content when open is false", () => {
    render(<LoginMenu open={false} onClose={() => {}} />);

    expect(screen.queryByText("Choose your login method:")).toBeNull();
  });

  it("redirects to VITE_GOOGLE_AUTH_URL on Google login click", () => {
    vi.stubEnv("VITE_GOOGLE_AUTH_URL", "https://auth.example.com/google");

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: "" } as any;

    render(<LoginMenu open={true} onClose={() => {}} />);

    const googleBtn = screen.getAllByText("Continue with Google")[0];
    fireEvent.click(googleBtn);

    expect(window.location.href).toBe("https://auth.example.com/google");
  });
});
