import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border-0 text-sm font-medium shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-none hover:bg-[var(--brand-secondary)]",
        destructive:
          "border-0 bg-[var(--danger-500)] text-white shadow-none hover:bg-[var(--danger-600)]",
        outline:
          "border border-[var(--border-default)] bg-[var(--surface-card)] shadow-none hover:bg-[var(--neutral-100)] hover:text-[var(--text-heading)]",
        secondary:
          "border-0 bg-[var(--neutral-100)] text-[var(--text-heading)] shadow-none hover:bg-[var(--neutral-200)]",
        ghost:
          "border-0 shadow-none hover:bg-[var(--neutral-100)] hover:text-[var(--text-heading)]",
        link: "border-0 text-[var(--text-link)] shadow-none underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
