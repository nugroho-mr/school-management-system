import z from 'zod'

const ONLY_TAGS_OR_WHITESPACE_REGEX = /^\\s*(<[^>]+>\\s*)*$/

export const dailyReportSchema = z.object({
  student: z.string().min(1, 'Pilih murid terlebih dahulu'),
  reportType: z.enum(['daily', 'montessori'], {
    message: 'Pilih jenis laporan harian',
  }),
  date: z
    .string()
    .min(1, 'Tanggal harus diisi')
    .refine((val) => !isNaN(Date.parse(val)), 'Tanggal tidak valid')
    .refine((val) => {
      const selectedDate = new Date(val)
      const today = new Date()
      return selectedDate <= today
    }, 'Tanggal tidak boleh di masa depan'),
  note: z
    .string()
    .min(1, 'Catatan harian harus diisi')
    .refine(
      (value) => {
        // 1. Remove all HTML tags (including nested and self-closing tags)
        // This regex matches anything between < and >
        const textOnly = value.replace(/<[^>]*>?/gm, '')

        // 2. Trim whitespace and check if the remaining string has length
        // Returns false if the result is "" or only spaces
        return textOnly.trim().length > 0
      },
      { message: 'Catatan harian harus diisi' },
    ),
  photo: z.any().optional(),
})
