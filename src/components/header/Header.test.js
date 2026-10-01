// Tóm tắt: Test Header — Escape đóng menu và trả focus, chỉ một link aria-current, có mục Contact, đổi route thì đóng menu.
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Header from "./Header";

// Nút phụ ngoài Header để đổi route bằng code (giống Back/Forward), không qua onClick của NavLink.
function GoTo({ path }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(path)}>
      go {path}
    </button>
  );
}

function renderHeader(path = "/home") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Header />
        <GoTo path="/projects" />
      </MemoryRouter>
    </HelmetProvider>
  );
}

const getToggle = () => screen.getByRole("button", { name: /menu/i });

test("Escape đóng menu đang mở và trả focus về nút menu", () => {
  renderHeader();
  const toggle = getToggle();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");

  // Focus đang ở trong menu khi bấm Escape.
  act(() => screen.getByRole("link", { name: "Projects" }).focus());
  fireEvent.keyDown(document.activeElement, { key: "Escape" });

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
});

test("chỉ một link có aria-current trên /home (logo không tính)", () => {
  const { container } = renderHeader("/home");
  const current = container.querySelectorAll('[aria-current="page"]');
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveTextContent("Home");
  // Logo luôn trỏ về /home chứ không phải /splash.
  expect(container.querySelector(".logo")).toHaveAttribute("href", "/home");
});

test("menu có mục Contact trỏ tới /contact", () => {
  renderHeader();
  expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
    "href",
    "/contact"
  );
  expect(
    screen.getAllByRole("link").filter((link) => link.closest("nav"))
  ).toHaveLength(5);
});

test("đổi route thì menu tự đóng", () => {
  renderHeader();
  const toggle = getToggle();
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(screen.getByRole("button", { name: "go /projects" }));

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});
