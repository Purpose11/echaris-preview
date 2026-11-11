declare module "@/design-system/components/navigation/SiteHeader.jsx" {
  import type { ComponentType, CSSProperties } from "react";

  export const SiteHeader: ComponentType<{
    links?: Array<{ href: string; label: string }>;
    activeHref?: string;
    onNavigate?: (href: string) => void;
    onLogin?: () => void;
    onRegister?: () => void;
    logoSrc?: string;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/navigation/SiteFooter.jsx" {
  import type { ComponentType, CSSProperties } from "react";

  export const SiteFooter: ComponentType<{
    columns?: Array<{
      title: string;
      links: Array<{ label: string; href?: string }>;
    }>;
    tagline?: string;
    legal?: string;
    logoSrc?: string;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/core/Button.jsx" {
  import type {
    ButtonHTMLAttributes,
    ComponentType,
    CSSProperties,
    ReactNode,
  } from "react";

  export const Button: ComponentType<
    ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: string;
      size?: string;
      iconLeft?: string;
      iconRight?: string;
      fullWidth?: boolean;
      loading?: boolean;
      as?: string;
      children?: ReactNode;
      style?: CSSProperties;
    }
  >;
}

declare module "@/design-system/components/core/Card.jsx" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export const Card: ComponentType<{
    padding?: number | string;
    className?: string;
    children?: ReactNode;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/core/Logo.jsx" {
  import type { ComponentType, CSSProperties } from "react";

  export const Logo: ComponentType<{
    variant?: string;
    height?: number;
    src?: string;
    className?: string;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/core/Icon.jsx" {
  import type { ComponentType, CSSProperties } from "react";

  export const Icon: ComponentType<{
    name: string;
    size?: number;
    className?: string;
    title?: string;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/core/Badge.jsx" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export const Badge: ComponentType<{
    tone?: string;
    icon?: string;
    dot?: boolean;
    size?: string;
    children?: ReactNode;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/feedback/Alert.jsx" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export const Alert: ComponentType<{
    tone?: string;
    title?: string;
    children?: ReactNode;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/forms/FormField.jsx" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export const FormField: ComponentType<{
    label?: string;
    htmlFor?: string;
    hint?: string;
    error?: string;
    success?: string;
    required?: boolean;
    optional?: boolean;
    children?: ReactNode;
    style?: CSSProperties;
  }>;
}

declare module "@/design-system/components/forms/Input.jsx" {
  import type {
    ComponentType,
    CSSProperties,
    InputHTMLAttributes,
    ReactNode,
  } from "react";

  export const Input: ComponentType<
    InputHTMLAttributes<HTMLInputElement> & {
      size?: string;
      iconLeft?: string;
      suffix?: ReactNode;
      prefix?: ReactNode;
      invalid?: boolean;
      style?: CSSProperties;
    }
  >;
}

declare module "@/design-system/components/forms/Select.jsx" {
  import type { ComponentType, CSSProperties, SelectHTMLAttributes } from "react";

  export const Select: ComponentType<
    SelectHTMLAttributes<HTMLSelectElement> & {
      options?: Array<string | { value: string; label: string }>;
      size?: string;
      placeholder?: string;
      invalid?: boolean;
      style?: CSSProperties;
    }
  >;
}

declare module "@/design-system/components/forms/Checkbox.jsx" {
  import type { ComponentType, CSSProperties, InputHTMLAttributes } from "react";

  export const Checkbox: ComponentType<
    Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
      label?: string;
      description?: string;
      style?: CSSProperties;
    }
  >;
}
