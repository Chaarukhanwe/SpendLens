import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { runAuditSchema } from "@/lib/schemas"
import { calcToolResult, generateRecs, generateVerdict } from "@/lib/audit"
import { generateAISummary } from "@/lib/claude"
import type { AuditResult } from "@/types"
import { auth } from "@clerk/nextjs/server" 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

     

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ error: "Bot detected" }, { status: 400 })
    }

    // Validate input
    const parsed = runAuditSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 422 }
      )
    }

    const { tools, email } = parsed.data

    // Calculate per-tool results
    const toolResults = tools.map(calcToolResult)

    // Aggregate
    const totalMonthlySpend = toolResults.reduce((s, t) => s + t.monthlySpend, 0)
    const totalMonthlyWaste = toolResults.reduce((s, t) => s + t.monthlyWaste, 0)
    const totalAnnualSavings = toolResults.reduce((s, t) => s + t.annualSavings, 0)
    const wastePct =
      totalMonthlySpend > 0
        ? Math.round((totalMonthlyWaste / totalMonthlySpend) * 100)
        : 0

    // Smart recommendations
    const recs = generateRecs(tools, toolResults)

    // Verdict
    const coveredUseCases = tools.map((t) => t.useCase)
    const verdict = generateVerdict(wastePct, coveredUseCases)

    // AI summary (Groq or fallback — never crashes)
    const aiSummary = await generateAISummary(
      toolResults,
      recs,
      verdict,
      totalMonthlySpend,
      totalMonthlyWaste,
      wastePct
    )

    // Build full result
    const auditId = uuidv4()
    const shareSlug = uuidv4().split("-")[0]

    const audit: AuditResult = {
      id: auditId,
      tools: toolResults,
      totalMonthlySpend,
      totalMonthlyWaste,
      totalAnnualSavings,
      wastePct,
      recs,
      verdict,
      aiSummary,
      createdAt: new Date().toISOString(),
    }

    // Persist to Supabase — wrapped so it NEVER crashes the route
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && serviceKey) {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })
        await supabase.from("audits").insert({
  id: auditId,
  result: audit,
  email: email || null,
  share_slug: shareSlug,
  user_id: userId || null,
})
      } else {
        console.warn("Supabase env vars missing — skipping DB save")
      }
    } catch (dbErr) {
      console.error("Supabase error (non-fatal):", dbErr)
    }

    // Send email — wrapped so it NEVER crashes the route
    if (email) {
      try {
        const resendKey = process.env.RESEND_API_KEY
        const fromEmail = process.env.RESEND_FROM_EMAIL ?? "audit@spendlens.io"
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
        if (resendKey) {
          const { Resend } = await import("resend")
          const resend = new Resend(resendKey)
          await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: `Your SpendLens Report`,
            html: `<p>Your report is ready: <a href="${appUrl}/report/${shareSlug}">${appUrl}/report/${shareSlug}</a></p>`,
          })
        } else {
          console.warn("RESEND_API_KEY missing — skipping email")
        }
      } catch (emailErr) {
        console.error("Email error (non-fatal):", emailErr)
      }
    }

    return NextResponse.json({ audit, shareSlug }, { status: 200 })
  } catch (err) {
    console.error("Audit API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
