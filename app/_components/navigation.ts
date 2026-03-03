import { NAVIGATION_CONFIG } from "../../constants/navigationConfig";

export type NavNode = {
  label: string;
  href: string;
  children?: NavNode[];
};

/**
 * Single source of truth for sitemap / navigation.
 * - Header dropdowns
 * - Footer sitemap
 */
export const NAV_TREE: NavNode[] = NAVIGATION_CONFIG.map((category) => ({
  label: category.path === "/" ? "Home" : category.label,
  href: category.path,
  children: category.pages.map((page) => ({
    label: page.title,
    href: page.path,
  })),
}));
