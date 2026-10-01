// Tóm tắt: Test Tooltip — gắn aria đúng (id từ toDomId), hiện khi focus/hover, ẩn bằng Escape mà không mất focus, rê chuột sang bong bóng vẫn giữ.
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import Tooltip from "./Tooltip";
import { toDomId } from "../../utils/domId";

function renderTooltip() {
  render(
    <Tooltip id="tooltip-test-skill" content="Docker">
      <button type="button">trigger</button>
    </Tooltip>
  );
  return {
    trigger: screen.getByRole("button", { name: "trigger" }),
    bubble: document.getElementById("tooltip-test-skill"),
  };
}

// Mô phỏng người dùng bấm Tab tới trigger (để :focus-visible khớp như khi điều hướng bằng bàn phím thật).
function tabTo(element) {
  fireEvent.keyDown(document.activeElement || document.body, { key: "Tab" });
  act(() => element.focus());
}

afterEach(() => {
  vi.useRealTimers();
});

test("wires role=tooltip and aria-describedby to the trigger", () => {
  const { trigger, bubble } = renderTooltip();

  expect(bubble).toHaveAttribute("role", "tooltip");
  expect(bubble).toHaveTextContent("Docker");
  expect(trigger).toHaveAttribute("aria-describedby", "tooltip-test-skill");
  expect(trigger).toHaveAccessibleDescription("Docker");
  // Bong bóng được portal ra <body>, không nằm trong cây DOM của trigger (tránh bị overflow cắt).
  expect(bubble.parentElement).toBe(document.body);
  expect(bubble).not.toBeVisible();
});

test("toDomId keeps C, C++ and C# distinct and readable", () => {
  expect(toDomId("software-skill", "C")).toBe("software-skill-c");
  expect(toDomId("software-skill", "C++")).toBe("software-skill-c-plus-plus");
  expect(toDomId("software-skill", "C#")).toBe("software-skill-c-sharp");
  expect(toDomId("language-tooltip", ":r3:", "Jupyter Notebook")).toBe(
    "language-tooltip-r3-jupyter-notebook"
  );
});

test("keeps an existing aria-describedby of the trigger", () => {
  render(
    <Tooltip id="tooltip-test-merge" content="Docker">
      <button type="button" aria-describedby="hint">
        trigger
      </button>
    </Tooltip>
  );
  expect(screen.getByRole("button")).toHaveAttribute(
    "aria-describedby",
    "hint tooltip-test-merge"
  );
});

test("shows on keyboard focus and hides on Escape without moving focus", () => {
  const { trigger, bubble } = renderTooltip();

  tabTo(trigger);
  expect(trigger).toHaveFocus();
  expect(bubble).toBeVisible();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(bubble).not.toBeVisible();
  expect(trigger).toHaveFocus();

  // Focus lại sau khi rời đi thì hiện lại.
  act(() => trigger.blur());
  tabTo(trigger);
  expect(bubble).toBeVisible();

  act(() => trigger.blur());
  expect(bubble).not.toBeVisible();
});

test("stays open while the pointer moves from the trigger onto the bubble", () => {
  vi.useFakeTimers();
  const { trigger, bubble } = renderTooltip();

  fireEvent.mouseEnter(trigger);
  expect(bubble).toBeVisible();

  fireEvent.mouseLeave(trigger);
  fireEvent.mouseEnter(bubble);
  act(() => vi.advanceTimersByTime(500));
  expect(bubble).toBeVisible();

  fireEvent.mouseLeave(bubble);
  act(() => vi.advanceTimersByTime(500));
  expect(bubble).not.toBeVisible();
});

test("Escape also dismisses a tooltip opened by hover", () => {
  const { trigger, bubble } = renderTooltip();

  fireEvent.mouseEnter(trigger);
  expect(bubble).toBeVisible();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(bubble).not.toBeVisible();

  // Rê chuột vào lại thì hiện lại.
  fireEvent.mouseLeave(trigger);
  fireEvent.mouseEnter(trigger);
  expect(bubble).toBeVisible();
});
