"use client";

import Link from "next/link";
import { addTransitionType } from "react";
import type { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  direction?: "forward" | "back";
};

export function TransitionLink({ direction = "forward", onClick, ...props }: TransitionLinkProps) {
  return (
    <Link
      onClick={(e) => {
        addTransitionType(direction === "back" ? "navigation-back" : "navigation-forward");
        onClick?.(e);
      }}
      {...props}
    />
  );
}
