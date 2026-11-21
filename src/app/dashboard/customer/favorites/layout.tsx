
import type { ReactNode } from "react";

export const instant = false;

export default function FavoritesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
