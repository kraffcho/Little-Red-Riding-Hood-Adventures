// builds className strings conditionally, filtering out falsy values
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getDirectionClass(prefix: string, direction?: string): string {
  if (!direction) return "";
  return `${prefix}-${direction}`;
}

