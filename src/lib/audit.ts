import type { AuditTool, ToolResult, SmartRec, Verdict, VerdictType } from "@/types"

// ─── Static Data ──────────────────────────────────────────────

export const WASTE_RATES: Record<string, number> = {
  "ChatGPT": 0.34,
  "GitHub Copilot": 0.28,
  "Notion AI": 0.40,
  "Midjourney": 0.30,
  "Grammarly": 0.38,
  "Claude": 0.22,
  "Jasper": 0.45,
  "Runway": 0.42,
  "Perplexity": 0.33,
  "Cursor": 0.25,
  "Linear AI": 0.36,
  "Otter.ai": 0.41,
  "Copy.ai": 0.44,
  "Writesonic": 0.43,
  "Synthesia": 0.42,
  "Descript": 0.38,
  "ElevenLabs": 0.39,
  "Zapier AI": 0.37,
  "Make AI": 0.36,
  "Other": 0.35,
}

// Tools that serve the same use case (overlap detection)
export const OVERLAP_MAP: Record<string, string[]> = {
  "Writing & Content": ["ChatGPT", "Claude", "Jasper", "Copy.ai", "Writesonic"],
  "Code Generation": ["ChatGPT", "GitHub Copilot", "Cursor", "Claude"],
  "Design & Images": ["Midjourney", "Runway", "Synthesia"],
  "Research": ["ChatGPT", "Claude", "Perplexity"],
  "Meetings & Docs": ["Otter.ai", "Notion AI"],
}

// Reinvestment suggestions for uncovered use cases
export const REINVEST_SUGGESTIONS: Record<string, { tool: string; why: string; cost: string }> = {
  "Code Generation": {
    tool: "Cursor",
    why: "purpose-built coding AI — saves 2–4 hrs/dev/week",
    cost: "₹1,650/mo",
  },
  "Meetings & Docs": {
    tool: "Otter.ai",
    why: "auto-transcribes and summarises every meeting",
    cost: "₹830/mo",
  },
  "Data Analysis": {
    tool: "ChatGPT (Code Interpreter)",
    why: "handles spreadsheets, charts and SQL natively",
    cost: "₹1,650/mo",
  },
  "Customer Support": {
    tool: "Intercom Fin AI",
    why: "resolves 40–60% of support tickets automatically",
    cost: "₹4,000/mo",
  },
  "Design & Images": {
    tool: "Midjourney",
    why: "best image quality per rupee for creative teams",
    cost: "₹830/mo",
  },
  "HR & Recruiting": {
    tool: "Notion AI",
    why: "automates JDs, interview notes and offer letters",
    cost: "₹660/mo",
  },
  "Finance & Reporting": {
    tool: "ChatGPT (Code Interpreter)",
    why: "handles most finance reporting with custom prompts",
    cost: "₹1,650/mo",
  },
}

// ─── Helpers ──────────────────────────────────────────────────

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN")
}

// ─── Per-Tool Calculation ─────────────────────────────────────

export function calcToolResult(tool: AuditTool): ToolResult {
  const wasteRate = WASTE_RATES[tool.name] ?? 0.35
  const utilisation = Math.min(tool.teamSize / Math.max(tool.seats, 1), 1)

  const seatWaste =
    tool.seats > tool.teamSize
      ? (tool.seats - tool.teamSize) * (tool.monthlySpend / Math.max(tool.seats, 1))
      : 0

  const usageWaste = tool.monthlySpend * wasteRate * (1 - utilisation * 0.5)
  const monthlyWaste = Math.min(seatWaste + usageWaste, tool.monthlySpend * 0.75)

  return {
    ...tool,
    monthlyWaste: Math.round(monthlyWaste),
    annualSavings: Math.round(monthlyWaste * 12),
    utilizationPct: Math.round(utilisation * 100),
    wastePct: Math.round((monthlyWaste / Math.max(tool.monthlySpend, 1)) * 100),
  }
}

// ─── Smart Recommendations ────────────────────────────────────

export function generateRecs(tools: AuditTool[], results: ToolResult[]): SmartRec[] {
  const recs: SmartRec[] = []
  const coveredUseCases = tools.map((t) => t.useCase)
  const totalWaste = results.reduce((s, t) => s + t.monthlyWaste, 0)

  // 1. Overlap detection
  for (const [category, toolList] of Object.entries(OVERLAP_MAP)) {
    const matches = results.filter(
      (r) => toolList.includes(r.name) && coveredUseCases.includes(category)
    )
    if (matches.length >= 2) {
      const sorted = [...matches].sort(
        (a, b) => (WASTE_RATES[a.name] ?? 0.35) - (WASTE_RATES[b.name] ?? 0.35)
      )
      const keep = sorted[0]
      const drop = sorted.slice(1)
      const dropSaving = drop.reduce((s, t) => s + t.monthlySpend, 0)

      recs.push({
        type: "cut",
        icon: "✂️",
        label: "OVERLAP DETECTED — CUT",
        title: `Drop ${drop.map((t) => t.name).join(" + ")} — you already have ${keep.name}`,
        detail: `Both handle "${category}". ${keep.name} is more efficient (${Math.round((1 - (WASTE_RATES[keep.name] ?? 0.35)) * 100)}% utilisation rate). Dropping ${drop.map((t) => t.name).join(" & ")} removes duplicate spend with zero capability loss.`,
        saving: `→ Saves ${inr(dropSaving * 12)}/yr immediately`,
      })
    }
  }

  // 2. Unused seats
  for (const t of results) {
    if (t.seats > t.teamSize) {
      const unusedCost = (t.seats - t.teamSize) * (t.monthlySpend / Math.max(t.seats, 1))
      recs.push({
        type: "cut",
        icon: "💺",
        label: "UNUSED SEATS — CUT NOW",
        title: `${t.name}: reduce from ${t.seats} → ${t.teamSize} seats`,
        detail: `You are paying for ${t.seats - t.teamSize} seat${t.seats - t.teamSize !== 1 ? "s" : ""} nobody uses on ${t.name}. This is pure cash burn — no one loses access, no productivity impact at all.`,
        saving: `→ Saves ${inr(Math.round(unusedCost * 12))}/yr with one admin change`,
      })
    }
  }

  // 3. High waste tools
  for (const t of results) {
    const wr = WASTE_RATES[t.name] ?? 0.35
    if (wr > 0.38 && t.monthlySpend > 2000) {
      recs.push({
        type: "warning",
        icon: "⚠️",
        label: "HIGH WASTE TOOL — REVIEW",
        title: `${t.name} has a ${Math.round(wr * 100)}% average waste rate`,
        detail: `${t.name} is one of the most underutilised tools on the market. Pull your actual usage logs — if your team isn't using it daily, downgrade the plan or cancel. Don't pay for capability you don't use.`,
        saving: `→ Potential to recover ${inr(t.annualSavings)}/yr`,
      })
    }
  }

  // 4. Reinvestment opportunities
  const reinvestBudget = Math.round(totalWaste * 0.4)
  const uncoveredUseCases = Object.keys(REINVEST_SUGGESTIONS).filter(
    (uc) => !coveredUseCases.some((c) => c.toLowerCase().includes(uc.toLowerCase()))
  )

  if (uncoveredUseCases.length > 0 && reinvestBudget > 3000) {
    const suggest = uncoveredUseCases[0]
    const s = REINVEST_SUGGESTIONS[suggest]
    const suggCost = parseInt(s.cost.replace(/[^0-9]/g, ""))
    recs.push({
      type: "reinvest",
      icon: "📈",
      label: "REINVESTMENT OPPORTUNITY",
      title: `Use savings to cover "${suggest}" — try ${s.tool}`,
      detail: `Your stack has no AI for ${suggest}. With ${inr(reinvestBudget)}/mo freed from cutting waste, you can fund ${s.tool} (${s.cost}/mo). ${s.why}.`,
      saving: `→ Net monthly cost after reallocation: ${inr(Math.max(0, suggCost - reinvestBudget))}/mo`,
    })
  }

  // 5. If everything looks clean
  if (recs.length === 0) {
    recs.push({
      type: "ok",
      icon: "✅",
      label: "STACK LOOKS CLEAN",
      title: "Your AI spend is well-optimised",
      detail: "No major overlaps, seat waste, or high-waste tools detected. Keep monitoring monthly and audit again in 90 days.",
      saving: "→ Run another audit after your next billing cycle",
    })
  }

  return recs
}

// ─── Verdict ──────────────────────────────────────────────────

export function generateVerdict(
  wastePct: number,
  coveredUseCases: string[]
): Verdict {
  const uncovered = Object.keys(REINVEST_SUGGESTIONS).filter(
    (uc) => !coveredUseCases.some((c) => c.toLowerCase().includes(uc.toLowerCase()))
  )

  let type: VerdictType
  let title: string
  let text: string

  if (wastePct > 40) {
    type = "optimise"
    title = "⚡ Verdict: Optimise first, invest later"
    text = `${wastePct}% of your AI spend is waste — that's too high to justify new tools. Cut the fat first, stabilise your stack, then reassess in 60 days. Adding more tools now would just compound the waste problem.`
  } else if (wastePct < 20 && uncovered.length > 0) {
    type = "invest-more"
    title = "🟢 Verdict: Your stack is lean — you can invest more"
    text = `Only ${wastePct}% waste — your team is genuinely using what you pay for. If budget allows, expand into uncovered areas like ${uncovered.slice(0, 2).join(" and ")}. You've earned the right to invest more.`
  } else {
    type = "no-more"
    title = "✅ Verdict: Cut waste, then hold steady"
    text = `Your AI spend is average but improvable. Cut the identified waste, don't add new tools for 90 days, and run another audit after that. Discipline now = better ROI later.`
  }

  return { type, title, text }
}
