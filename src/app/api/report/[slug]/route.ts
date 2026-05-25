import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from("audits")
    .select("result, share_slug, created_at")
    .eq("share_slug", slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  // Strip email from public response
  return NextResponse.json(
    { audit: data.result, shareSlug: data.share_slug, createdAt: data.created_at },
    { status: 200 }
  )
}
