import React from "react";

import { Icon } from "../core/Icon.jsx";

export function Input({
  size = "md",
  iconLeft,
  suffix,
  prefix,
  invalid,
  disabled,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const h =
    size === "sm"
      ? "var(--control-height-sm)"
      : size === "lg"
        ? "var(--control-height-lg)"
        : "var(--control-height-md)";
  const border = invalid
    ? "var(--border-danger)"
    : focus
      ? "var(--border-focus)"
      : hover
        ? "var(--border-strong)"
        : "var(--border-default)";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
        height: h,
        padding: "0 14px",
        background: disabled ? "var(--neutral-100)" : "var(--surface-card)",
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-md)",
        boxShadow: "none",
        transition: "var(--transition-control)",
        ...style,
      }}
    >
      {iconLeft && (
        <Icon name={iconLeft} size={16} style={{ color: "var(--text-muted)" }} />
      )}
      {prefix && (
        <span style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)" }}>
          {prefix}
        </span>
      )}
      <input
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          fontFamily: "var(--font-sans)",
          fontSize: size === "sm" ? "var(--fs-body-sm)" : "var(--fs-body)",
          color: "var(--text-heading)",
          cursor: disabled ? "not-allowed" : "text",
        }}
        {...rest}
      />
      {suffix && (
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--fs-caption)",
            fontWeight: "var(--fw-medium)",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
