export const normalizeUserRole = (role: string | string[] | undefined): string[] => {
  if (!role || (Array.isArray(role) && role.length === 0)) return []
  return Array.isArray(role) ? role : [role]
}
