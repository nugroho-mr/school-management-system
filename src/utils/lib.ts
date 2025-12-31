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
