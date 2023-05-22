export const randString = (n: number) => {
    return Math.random().toString(36).substring(2, n + 2).toUpperCase()
}