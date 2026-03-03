export const validateSlug = (value: unknown) => {
  const slugRegex = /^[a-z0-9_-]+$/
  return (
    (Boolean(slugRegex) && slugRegex.test(value as string)) ||
    'Slug must only contains lowercase alphanumeric, dash (-) or underscore (_)'
  )
}

export function validateUrl(value: unknown = '') {
  if (value === '') return true
  try {
    new URL(value as string)
    return true
  } catch {
    return 'Must be a valid URL'
  }
}

export const hasMatchRole = (arr1: string[], arr2: string[]) => {
  return arr1.some((item) => arr2.includes(item))
}
