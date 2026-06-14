// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ToastHost from "./ToastHost";

describe("ToastHost", () => {
  it("turns legacy alerts into non-blocking notifications", () => {
    render(<><ToastHost /><button onClick={() => window.alert("Saved")}>Notify</button></>);
    fireEvent.click(screen.getByText("Notify"));
    expect(screen.getByRole("status").textContent).toBe("Saved");
  });
});
