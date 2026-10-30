type ClassNameValue = string | false | null | undefined;

export function cxModule(
  styles: Readonly<Record<string, string>>,
  ...classNames: ClassNameValue[]
): string {
  return classNames
    .filter(
      (className): className is string => typeof className === "string" && className.length > 0,
    )
    .flatMap((className) => className.split(/\s+/))
    .map((className) => styles[className] ?? className)
    .join(" ");
}
