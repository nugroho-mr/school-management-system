import z from 'zod'

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
        const textOnly = value.replace(/<[^>]*>?/gm, '')
        return textOnly.trim().length > 0
      },
      { message: 'Catatan harian harus diisi' },
    ),
  photo: z.any().optional().nullable(),
  photoId: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  removePhoto: z.boolean().catch(false),
})
