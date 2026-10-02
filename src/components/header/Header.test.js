// Tóm tắt: Test Header — Escape đóng menu và trả focus, chỉ một link aria-current, có mục Contact, đổi route thì đóng menu, logo có tên truy cập rõ ràng.
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Header from "./Header";
import { greeting } from "../../portfolio.js";

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

test("logo có aria-label rõ ràng và ẩn dấu ngoặc trang trí khỏi screen reader", () => {
  const { container } = renderHeader();
  const logo = screen.getByRole("link", {
    name: `${greeting.logo_name} – Home`,
  });
  expect(logo).toHaveAttribute("href", "/home");
  expect(logo).toBe(container.querySelector(".logo"));
  const hidden = logo.querySelectorAll('span[aria-hidden="true"]');
  expect(hidden).toHaveLength(2);
  expect(hidden[0]).toHaveTextContent("<");
  expect(hidden[1]).toHaveTextContent("/>");
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
