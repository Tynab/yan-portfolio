// Tóm tắt: Test router chính (HashRouter) — redirect "/" và "/education", trang 404, title từng trang.
import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import Main from "./Main";
import { chosenTheme } from "../theme";
import { greeting, seo } from "../portfolio";

// HashRouter đọc route từ window.location.hash nên phải đặt hash trước khi render.
function renderAt(hash) {
  window.location.hash = hash;
  return render(
    <HelmetProvider>
      <Main theme={chosenTheme} />
    </HelmetProvider>
  );
}

beforeEach(() => {
  // jsdom chưa cài window.scrollTo (PageLayout cuộn lên đầu mỗi lần đổi trang).
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = "";
});

test('"#/" chuyển sang /home và hiện tên ở h1', async () => {
  renderAt("#/");
  expect(
    await screen.findByRole("heading", { level: 1, name: greeting.title })
  ).toBeInTheDocument();
  expect(window.location.hash).toBe("#/home");
  await waitFor(() => expect(document.title).toBe(seo.title));
});

test('"#/education" (link cũ) chuyển sang /certifications', async () => {
  renderAt("#/education");
  expect(
    await screen.findByRole("heading", { level: 1, name: "Certifications" })
  ).toBeInTheDocument();
  expect(window.location.hash).toBe("#/certifications");
  await waitFor(() =>
    expect(document.title).toBe(`Certifications | ${seo.title}`)
  );
});

test("path không tồn tại hiện trang 404", async () => {
  renderAt("#/nope");
  expect(
    await screen.findByText("The requested page is unavailable at the moment!")
  ).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  await waitFor(() =>
    expect(document.title).toBe(`Page Not Found | ${seo.title}`)
  );
});
