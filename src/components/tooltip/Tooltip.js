// Tóm tắt: Tooltip accessible thay OverlayTrigger/Tooltip của react-bootstrap — bong bóng tối có mũi tên,
// hiện khi hover hoặc focus bàn phím, đóng bằng Escape; portal ra <body> + position: fixed nên không bị cắt.
import React, {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

// Khoảng cách tối thiểu giữa bong bóng và mép viewport (px).
const VIEWPORT_MARGIN = 8;
// Mũi tên luôn cách mép bong bóng ít nhất chừng này (px) để không lòi ra khỏi góc bo.
const ARROW_EDGE = 12;
// Trễ khi rời chuột: đủ để rê từ trigger sang bong bóng mà bong bóng không biến mất (WCAG 1.4.13 "hoverable").
const HIDE_DELAY = 100;

function isKeyboardFocus(element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    // Trình duyệt cũ / jsdom không hiểu :focus-visible: coi như focus bàn phím để vẫn hiện tooltip.
    return true;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Tính vị trí fixed cho bong bóng: ưu tiên phía trên, không đủ chỗ thì lật xuống dưới, luôn kẹp trong viewport.
function computePosition(trigger, bubble) {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const width = bubble.offsetWidth;
  const height = bubble.offsetHeight;

  const spaceAbove = rect.top - VIEWPORT_MARGIN;
  const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_MARGIN;
  const placement =
    height <= spaceAbove || spaceAbove >= spaceBelow ? "top" : "bottom";
  const top = placement === "top" ? rect.top - height : rect.bottom;

  const center = rect.left + rect.width / 2;
  const maxLeft = Math.max(
    VIEWPORT_MARGIN,
    viewportWidth - VIEWPORT_MARGIN - width
  );
  const left = clamp(center - width / 2, VIEWPORT_MARGIN, maxLeft);
  const arrowX = clamp(center - left, ARROW_EDGE, width - ARROW_EDGE);

  return {
    top: Math.round(top),
    left: Math.round(left),
    arrowX: Math.round(arrowX),
    placement,
  };
}

function samePosition(a, b) {
  return (
    a &&
    b &&
    a.top === b.top &&
    a.left === b.left &&
    a.arrowX === b.arrowX &&
    a.placement === b.placement
  );
}

// Bọc đúng MỘT phần tử trigger (phải là phần tử DOM ổn định, không bị script ngoài như Iconify thay thế;
// ref riêng của phần tử con sẽ bị thay bằng ref của Tooltip).
// id: id DOM duy nhất của bong bóng (tạo bằng toDomId), trigger nhận aria-describedby trỏ tới nó.
export default function Tooltip({ id, content, children }) {
  const child = Children.only(children);
  const childProps = child.props;
  const bubbleRef = useRef(null);
  const [triggerNode, setTriggerNode] = useState(null);
  // Chuột: "in" (trên trigger/bong bóng) -> "leaving" (vừa rời, chờ HIDE_DELAY) -> "out".
  const [pointer, setPointer] = useState("out");
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState(null);
  const open = (pointer !== "out" || focused) && !dismissed;

  // Rời chuột thì chờ một nhịp mới ẩn; vào lại trigger/bong bóng trước khi hết giờ thì effect bị huỷ, tooltip giữ nguyên.
  useEffect(() => {
    if (pointer !== "leaving") return undefined;
    const timer = setTimeout(() => setPointer("out"), HIDE_DELAY);
    return () => clearTimeout(timer);
  }, [pointer]);

  const updatePosition = useCallback(() => {
    if (!triggerNode || !bubbleRef.current) return;
    const next = computePosition(triggerNode, bubbleRef.current);
    setPosition((prev) => (samePosition(prev, next) ? prev : next));
  }, [triggerNode]);

  // Đo và đặt vị trí trước khi trình duyệt paint; theo dõi scroll (mọi container, nên dùng capture) và resize khi đang mở.
  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const options = { capture: true, passive: true };
    window.addEventListener("scroll", updatePosition, options);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, options);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // WCAG 1.4.13 "dismissible": Escape ẩn tooltip mà không di chuyển focus/chuột.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" || event.key === "Esc") setDismissed(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const describedBy = [childProps["aria-describedby"], id]
    .filter(Boolean)
    .join(" ");

  // Handler sẵn có của phần tử con được gọi trước, không bị nuốt.
  const trigger = cloneElement(child, {
    ref: setTriggerNode,
    "aria-describedby": describedBy,
    onMouseEnter: (event) => {
      if (typeof childProps.onMouseEnter === "function") {
        childProps.onMouseEnter(event);
      }
      // Rê chuột vào lại sau khi đã Escape thì hiện lại.
      setDismissed(false);
      setPointer("in");
    },
    onMouseLeave: (event) => {
      if (typeof childProps.onMouseLeave === "function") {
        childProps.onMouseLeave(event);
      }
      setPointer("leaving");
    },
    onFocus: (event) => {
      if (typeof childProps.onFocus === "function") childProps.onFocus(event);
      // Chỉ focus bằng bàn phím (:focus-visible); click chuột đã có hover, tránh tooltip "dính" sau khi click.
      if (!isKeyboardFocus(event.target)) return;
      setDismissed(false);
      setFocused(true);
    },
    onBlur: (event) => {
      if (typeof childProps.onBlur === "function") childProps.onBlur(event);
      // Focus còn nằm trong trigger (phần tử con) thì vẫn giữ tooltip.
      if (event.currentTarget.contains(event.relatedTarget)) return;
      setFocused(false);
    },
  });

  if (typeof document === "undefined") return trigger;

  const bubbleStyle = position
    ? {
        top: `${position.top}px`,
        left: `${position.left}px`,
        "--tooltip-arrow-x": `${position.arrowX}px`,
      }
    : undefined;

  // Bong bóng luôn có trong DOM (ẩn bằng hidden) để aria-describedby luôn trỏ tới nội dung có thật.
  const bubble = createPortal(
    <div
      ref={bubbleRef}
      id={id}
      role="tooltip"
      className="tooltip-bubble"
      data-placement={position ? position.placement : "top"}
      hidden={!open}
      style={bubbleStyle}
      onMouseEnter={() => setPointer("in")}
      onMouseLeave={() => setPointer("leaving")}
    >
      <div className="tooltip-bubble-inner">{content}</div>
    </div>,
    document.body
  );

  return (
    <>
      {trigger}
      {bubble}
    </>
  );
}
