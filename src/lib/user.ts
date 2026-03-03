export const normalizeUserRole = (role: string | string[] | undefined): string[] => {
  return [role || 'guest'].flat(1)
}
