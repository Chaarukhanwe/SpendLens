
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { AuditResult } from "@/types"
import { inr } from "@/lib/audit"

import jsPDF from "jspdf"
import html2canvas from "html2canvas"

import {
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs"

interface Props {
  params: { slug: string }
}

async function getReport(slug: string): Promise<AuditResult | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  try {
    const res = await fetch(`${base}/api/report/${slug}`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    return data.audit
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const audit = await getReport(params.slug)
  if (!audit) return { title: "Report not found — SpendLens" }
  return {
    title: `AI Spend Report — ${inr(audit.totalAnnualSavings)}/yr savings found | SpendLens`,
    description: `This company found ${inr(audit.totalAnnualSavings)}/yr in AI tool waste. ${audit.verdict.title}`,
    openGraph: {
      title: `${inr(audit.totalAnnualSavings)}/yr in AI waste found`,
      description: audit.verdict.text,
    },
  }
}

const recBg: Record<string, string> = {
  cut: "bg-green/5 border-green-dim/40",
  reinvest: "bg-blue/5 border-blue-dim/40",
  warning: "bg-yellow/5 border-yellow/30",
  ok: "bg-surface border-border",
}

const recLabelColor: Record<string, string> = {
  cut: "text-green-DEFAULT",
  reinvest: "text-blue",
  warning: "text-yellow-DEFAULT",
  ok: "text-dimmer",
}

const verdictBg: Record<string, string> = {
  optimise: "bg-yellow/10 border-yellow/30",
  "invest-more": "bg-blue/5 border-blue-dim/40",
  "no-more": "bg-green/10 border-green-dim/40",
}

export default async function ReportPage({ params }: Props) {
  const audit = await getReport(params.slug)
  if (!audit) notFound()

  const today = new Date(audit.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  })

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-sm font-bold tracking-wide">
          spend<span className="text-blue">lens</span>
        </a>
        <span className="text-xs text-muted font-mono">spend less through spendlens</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Report Header */}
        <div className="border-b border-border pb-6 flex justify-between items-start">
          <div>
            <p className="text-[9px] text-blue uppercase tracking-[3px] font-mono mb-2">AI SPEND AUDIT REPORT</p>
            <h1 className="text-2xl font-black tracking-tight">Cost Intelligence Report</h1>
            <p className="text-xs text-dimmer font-mono mt-2">// generated {today} · {audit.tools.length} tool{audit.tools.length !== 1 ? "s" : ""} audited</p>
          </div>
          <span className="bg-green-dim text-white text-xs font-bold px-3 py-1.5 rounded">LIVE AUDIT</span>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue/5 border border-blue-dim/40 rounded-lg p-4">
            <div className="text-xl font-black text-blue tracking-tight">{inr(audit.totalAnnualSavings)}</div>
            <div className="text-[10px] text-dimmer mt-1">annual savings potential</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xl font-black text-green tracking-tight">{inr(audit.totalMonthlyWaste)}</div>
            <div className="text-[10px] text-dimmer mt-1">monthly waste detected</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xl font-black text-red-DEFAULT tracking-tight">{audit.wastePct}%</div>
            <div className="text-[10px] text-dimmer mt-1">of spend being wasted</div>
          </div>
        </div>

        {/* Tool Breakdown */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <p className="text-[9px] text-dimmer uppercase tracking-[2px] font-mono px-5 pt-4 pb-3 border-b border-border">Tool Breakdown</p>
          <table className="w-full">
            <thead>
              <tr>
                {["Tool", "Spend/mo", "Waste/mo", "Save/yr"].map((h) => (
                  <th key={h} className="text-[9px] text-dimmer uppercase tracking-widest font-semibold text-left px-4 py-2 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.tools.map((t, i) => (
                <tr key={i} className="hover:bg-blue/5 transition-colors">
                  <td className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[10px] text-muted">{t.useCase} · {t.utilizationPct}% utilised</div>
                  </td>
                  <td className="px-4 py-3 border-b border-border text-sm text-muted">{inr(t.monthlySpend)}</td>
                  <td className="px-4 py-3 border-b border-border text-sm text-red-DEFAULT">{inr(t.monthlyWaste)}</td>
                  <td className="px-4 py-3 border-b border-border text-sm text-green font-semibold">{inr(t.annualSavings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recommendations */}
        <div>
          <p className="text-[9px] text-dimmer uppercase tracking-[2px] font-mono mb-3">Recommendations</p>
          <div className="space-y-3">
            {audit.recs.map((r, i) => (
              <div key={i} className={`rounded-lg p-4 border flex gap-3 ${recBg[r.type]}`}>
                <span className="text-lg flex-shrink-0">{r.icon}</span>
                <div>
                  <div className={`text-[9px] font-bold tracking-widest uppercase mb-1 ${recLabelColor[r.type]}`}>{r.label}</div>
                  <div className="text-sm font-semibold text-primary mb-1">{r.title}</div>
                  <div className="text-xs text-muted leading-relaxed">{r.detail}</div>
                  <div className={`text-xs font-bold mt-2 ${recLabelColor[r.type]}`}>{r.saving}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verdict */}
        <div className={`rounded-lg p-5 border ${verdictBg[audit.verdict.type]}`}>
          <div className="text-sm font-bold text-primary mb-2">{audit.verdict.title}</div>
          <div className="text-xs text-muted leading-relaxed">{audit.verdict.text}</div>
        </div>

        {/* AI Summary */}
        <div className="bg-surface border border-l-4 border-blue-dim rounded-lg p-5">
          <div className="text-[9px] text-blue font-mono uppercase tracking-widest mb-2">// spendlens AI analysis</div>
          <div className="text-sm text-muted leading-relaxed">{audit.aiSummary}</div>
        </div>

        {/* Share Actions */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-sm font-semibold mb-2">
            Share or download your report
          </div>

          <SignedOut>
            <div className="space-y-3">
              <p className="text-xs text-muted">
                Sign in to share reports, download PDFs, and save audit history.
              </p>

              <SignInButton mode="modal">
                <button className="bg-blue-dim hover:bg-blue text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors">
                  Sign In to Continue
                </button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
  <div className="flex gap-3">
    <button
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title: "SpendLens AI Audit Report",
            text: "Check out this AI spend audit report",
            url: window.location.href,
          })
        } else {
          navigator.clipboard.writeText(window.location.href)
          alert("Report link copied!")
        }
      }}
      className="bg-blue-dim hover:bg-blue text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
    >
      Share Report
    </button>

    <button
  onClick={async () => {
    const element = document.body

    const canvas = await html2canvas(element)

    const data = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(data, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(data, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save("spendlens-report.pdf")
  }}
  className="border border-border hover:border-blue-dim text-sm font-semibold px-4 py-2 rounded-md transition-colors"
>
  Download PDF
</button>
  </div>
</SignedIn>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border pt-6 flex items-center justify-between">
          <div className="text-xs text-dimmer font-mono">spend<span className="text-blue">lens</span>.io // ai cost auditor</div>
          <a href="/audit" className="bg-blue-dim hover:bg-blue text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Run your own audit →
          </a>
        </div>
      </div>
    </div>
  )
}