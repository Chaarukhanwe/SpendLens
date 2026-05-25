import { Resend } from "resend"
import type { AuditResult } from "@/types"
import { inr } from "./audit"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? "audit@spendlens.io"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://spendlens.io"

export async function sendAuditReport(
  email: string,
  audit: AuditResult,
  shareSlug: string
): Promise<void> {
  const reportUrl = `${APP_URL}/report/${shareSlug}`

  const topRecs = audit.recs
    .slice(0, 3)
    .map((r) => `<li style="margin-bottom:8px"><strong>${r.title}</strong><br/><span style="color:#8b949e">${r.saving}</span></li>`)
    .join("")

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your SpendLens Report — ${inr(audit.totalAnnualSavings)}/yr in savings found`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="background:#0d1117;color:#e6edf3;font-family:sans-serif;padding:32px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="margin-bottom:24px">
      <span style="font-size:18px;font-weight:700">spend<span style="color:#388bfd">lens</span></span>
      <span style="color:#484f58;font-size:12px;margin-left:8px">// AI Cost Auditor</span>
    </div>

    <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;margin-bottom:16px">
      <p style="color:#8b949e;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Annual Savings Potential</p>
      <p style="font-size:40px;font-weight:800;color:#3fb950;letter-spacing:-2px;margin:0">${inr(audit.totalAnnualSavings)}</p>
      <p style="color:#8b949e;font-size:12px;margin:6px 0 0">${inr(audit.totalMonthlyWaste)}/mo waste · ${audit.wastePct}% of spend · ${audit.tools.length} tools audited</p>
    </div>

    <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:20px;margin-bottom:16px">
      <p style="font-size:11px;color:#484f58;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px">Top Recommendations</p>
      <ul style="margin:0;padding-left:16px;color:#e6edf3;font-size:13px">${topRecs}</ul>
    </div>

    <div style="background:#0d1220;border:1px solid #1f6feb;border-radius:8px;padding:20px;margin-bottom:24px">
      <p style="font-size:11px;color:#388bfd;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Verdict</p>
      <p style="font-size:14px;font-weight:700;color:#e6edf3;margin:0 0 6px">${audit.verdict.title}</p>
      <p style="font-size:12px;color:#8b949e;line-height:1.6;margin:0">${audit.verdict.text}</p>
    </div>

    <a href="${reportUrl}" style="display:inline-block;background:#1f6feb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600">View Full Report →</a>

    <p style="color:#484f58;font-size:11px;margin-top:24px">spendlens.io · spend less through spendlens<br/>You're receiving this because you ran an audit. No spam, ever.</p>
  </div>
</body>
</html>`,
  })
}
