export function callUntilResolved<T, U>(
    p: () => Promise<T>,
): Promise<T> {
    return p().catch(err => callUntilResolved(p));
}
