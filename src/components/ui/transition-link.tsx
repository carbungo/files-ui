"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTransitionType, startTransition } from "react";
import type { ComponentProps, MouseEvent } from "react";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  direction?: "forward" | "back";
};

export function TransitionLink({ direction = "forward", onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    e.preventDefault();
    onClick?.(e);

    startTransition(() => {
      addTransitionType(direction === "back" ? "navigation-back" : "navigation-forward");
      router.push(props.href as string);
    });
  }

  return <Link onClick={handleClick} {...props} />;
}
