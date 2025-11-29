/**
 * utility function to build className strings conditionally
 * filters out falsy values and joins with spaces
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * build direction-specific class name for entities
 */
export function getDirectionClass(prefix: string, direction?: string): string {
  if (!direction) return "";
  return `${prefix}-${direction}`;
}

