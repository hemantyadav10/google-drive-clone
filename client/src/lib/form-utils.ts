export function makeFieldGuard<T extends string>(fields: readonly T[]) {
  return (path: string): path is T =>
    (fields as readonly string[]).includes(path);
}
