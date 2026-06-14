// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

function renderRoutes() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Private dashboard</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => localStorage.clear());

  it("redirects guests to login", () => {
    renderRoutes();
    expect(screen.getByText("Login page")).toBeTruthy();
  });

  it("renders private content when a token exists", () => {
    localStorage.setItem("stacklink_token", "test-token");
    renderRoutes();
    expect(screen.getByText("Private dashboard")).toBeTruthy();
  });
});
