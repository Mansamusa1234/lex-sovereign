import { NextRequest, NextResponse } from 'next/server'

// Free UK postcode lookup — no API key required
export async function GET(req: NextRequest) {
  const postcode = new URL(req.url).searchParams.get('postcode')?.replace(/\s/g, '')
  if (!postcode || postcode.length < 5) {
    return NextResponse.json({ error: 'Invalid postcode' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`)
    if (!res.ok) return NextResponse.json({ error: 'Postcode not found' }, { status: 404 })
    const data = await res.json()
    const r = data.result
    return NextResponse.json({
      postcode: r.postcode,
      city: r.admin_district,
      county: r.admin_county,
      country: 'United Kingdom',
      region: r.region,
      latitude: r.latitude,
      longitude: r.longitude,
    })
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
