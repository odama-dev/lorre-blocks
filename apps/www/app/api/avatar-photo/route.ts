import { type NextRequest } from "next/server"

/**
 * Same-origin proxy for randomuser.me portrait photos. randomuser.me serves the
 * images without CORS headers, so a browser can neither `fetch()` them nor
 * rasterize them to PNG without tainting the canvas. Proxying them through our
 * own origin fixes both — the avatar grid fetches `/api/avatar-photo?g=…&i=…`,
 * converts the bytes to a data URI, and everything downstream stays offline and
 * self-contained. Photos are royalty-free per randomuser.me's license.
 */

const GENDERS = new Set(["men", "women"])

export async function GET(req: NextRequest) {
  const g = req.nextUrl.searchParams.get("g") ?? ""
  const idx = Number.parseInt(req.nextUrl.searchParams.get("i") ?? "", 10)

  if (!GENDERS.has(g) || !Number.isInteger(idx) || idx < 0 || idx > 99) {
    return new Response("bad request", { status: 400 })
  }

  const upstream = await fetch(
    `https://randomuser.me/api/portraits/${g}/${idx}.jpg`,
    { cache: "force-cache" }
  )
  if (!upstream.ok) {
    return new Response("upstream error", { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
