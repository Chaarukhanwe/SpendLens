"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuditResult } from "@/types"
import { inr } from "@/lib/audit"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Copy, Share2 } from "lucide-react"

export default function ResultsPage() {
  const router = useRouter()
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [shareSlug, setShareSlug] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem("auditResult")
    const slug = sessionStorage.getItem("shareSlug")
    if (!raw) { router.push("/audit"); return }
    setAudit(JSON.parse(raw))
    setShareSlug(slug ?? "")
  }, [router])

  if (!audit) return null

  const chartData = audit.tools.map((t) => ({
    name: t.name.split(" ")[0],
    spend: t.monthlySpend,
    waste: t.monthlyWaste,
    saved: t.annualSavings,
  }))

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/report/${shareSlug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTwitter = () => {
    const txt = `Just ran an AI spend audit with @SpendLens 👀\n\nFound ${inr(audit.totalAnnualSavings)}/yr in waste (${audit.wastePct}% of our AI spend).\n\n${audit.verdict.title}\n\nFree audit → spendlens.io`
    window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(txt))
  }

  const verdictBg: Record<string, string> = {
    optimise: "bg-yellow/10 border-yellow/30",
    "invest-more": "bg-blue-glow border-blue-dim/40",
    "no-more": "bg-green/10 border-green-dim/40",
  }

  const recBg: Record<string, string> = {
    cut: "bg-green/5 border-green-dim/40",
    reinvest: "bg-blue-glow border-blue-dim/40",
    warning: "bg-yellow/5 border-yellow/30",
    ok: "bg-surface border-border",
  }

  const recLabelColor: Record<string, string> = {
    cut: "text-green",
    reinvest: "text-blue",
    warning: "text-yellow",
    ok: "text-dimmer",
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-sm font-bold tracking-wide">spend<span className="text-blue">lens</span></a>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/audit")} className="text-xs text-muted border border-border rounded-md px-3 py-1.5 hover:border-blue-dim hover:text-blue transition-colors">
            ← back
          </button>
          <span className="text-xs text-muted border border-border rounded-full px-3 py-1 font-mono">02 / results</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Hero */}
        <div className="bg-surface border border-border rounded-lg p-6 flex gap-6 items-center">
          <div className="flex-1">
            <p className="text-[10px] text-blue uppercase tracking-[2px] font-mono mb-2">Annual Savings Potential</p>
            <p className="text-5xl font-black tracking-tighter text-green">{inr(audit.totalAnnualSavings)}</p>
            <p className="text-sm text-muted mt-2">{inr(audit.totalMonthlyWaste)}/mo waste · {audit.tools.length} tool{audit.tools.length !== 1 ? "s" : ""} audited</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-surface2 border border-border rounded-md px-4 py-3 text-center">
              <div className="text-xl font-bold text-red-DEFAULT">{audit.wastePct}%</div>
              <div className="text-[9px] text-dimmer mt-1">of spend wasted</div>
            </div>
            <div className="bg-surface2 border border-border rounded-md px-4 py-3 text-center">
              <div className="text-lg font-bold">{inr(audit.totalMonthlySpend)}</div>
              <div className="text-[9px] text-dimmer mt-1">total/mo spend</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-[10px] text-dimmer uppercase tracking-[2px] font-mono mb-4">Spend vs Waste by Tool</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#484f58", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
                formatter={(val: number, name: string) => [inr(val), name === "spend" ? "Spend" : "Waste"]}
              />
              <Bar dataKey="spend" fill="#1f6feb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="waste" radius={[3, 3, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="#f85149" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tool Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <p className="text-[10px] text-dimmer uppercase tracking-[2px] font-mono px-5 pt-4 pb-3 border-b border-border">Tool Breakdown</p>
          <table className="w-full">
            <thead>
              <tr>
                {["Tool", "Spend/mo", "Waste/mo", "Save/yr", "Waste %"].map((h) => (
                  <th key={h} className="text-[9px] text-dimmer uppercase tracking-widest font-semibold text-left px-4 py-2 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.tools.map((t, i) => (
                <tr key={i} className="hover:bg-blue-glow transition-colors">
                  <td className="px-4 py-3 border-b border-border">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[10px] text-muted">{t.plan} · {t.seats} seats · {t.useCase} · {t.utilizationPct}% utilised</div>
                  </td>
                  <td className="px-4 py-3 border-b border-border text-sm">{inr(t.monthlySpend)}</td>
                  <td className="px-4 py-3 border-b border-border text-sm text-red-DEFAULT">{inr(t.monthlyWaste)}</td>
                  <td className="px-4 py-3 border-b border-border text-sm text-green font-semibold">{inr(t.annualSavings)}</td>
                  <td className="px-4 py-3 border-b border-border">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green/10 text-green border border-green-dim">{t.wastePct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Smart Recommendations */}
        <div>
          <p className="text-[10px] text-dimmer uppercase tracking-[2px] font-mono mb-3">Smart Recommendations</p>
          <div className="space-y-3">
            {audit.recs.map((r, i) => (
              <div key={i} className={`rounded-lg p-4 border flex gap-3 ${recBg[r.type]}`}>
                <span className="text-xl mt-0.5 flex-shrink-0">{r.icon}</span>
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

        {/* Share */}
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="text-sm font-semibold mb-1">Share your report</div>
          <div className="text-xs text-muted mb-4">Public link — no personal info included.</div>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-xs text-muted font-mono outline-none"
            />
            <button onClick={handleCopy} className="flex items-center gap-1.5 border border-border rounded-md px-3 py-2 text-xs text-muted hover:border-blue-dim hover:text-blue transition-colors">
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleTwitter} className="flex items-center gap-1.5 bg-blue-dim hover:bg-blue text-white rounded-md px-3 py-2 text-xs font-semibold transition-colors">
              <Share2 size={12} /> Share on X
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
