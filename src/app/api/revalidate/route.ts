import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { tag, path } = await req.json()

    if (tag) revalidateTag(tag)
    if (path) revalidatePath(path)

    return Response.json({ revalidated: true }, { status: 200 })
  } catch {
    return Response.json({ revalidated: false }, { status: 400 })
  }
}
