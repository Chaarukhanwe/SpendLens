import Anthropic from "@anthropic-ai/sdk"
import type { ToolResult, SmartRec, Verdict } from "@/types"
import { inr } from "./audit"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateAISummary(
  tools: ToolResult[],
  recs: SmartRec[],
  verdict: Verdict,
  totalSpend: number,
  totalWaste: number,
  wastePct: number
): Promise<string> {
  const toolSummary = tools
    .map(
      (t) =>
        `- ${t.name} (${t.useCase}): ${inr(t.monthlySpend)}/mo, ${t.wastePct}% waste, ${t.utilizationPct}% utilised`
    )
    .join("\n")

  const recSummary = recs
    .slice(0, 4)
    .map((r) => `- ${r.type.toUpperCase()}: ${r.title}`)
    .join("\n")

  const prompt = `You are a sharp, no-fluff AI cost analyst. A company has completed an AI spend audit. Write a 3–4 sentence executive summary in a direct, confident Gen-Z professional tone (clear, smart, no corporate jargon). Do NOT use bullet points. Do NOT repeat the numbers verbatim — synthesise them into insight.

AUDIT DATA:
Total monthly AI spend: ${inr(totalSpend)}
Monthly waste detected: ${inr(totalWaste)} (${wastePct}%)
Annual savings potential: ${inr(totalWaste * 12)}
Tools audited:
${toolSummary}

Top recommendations:
${recSummary}

Verdict: ${verdict.title}

Write the executive summary now:`

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    })

    const content = message.content[0]
    if (content.type === "text") return content.text

    return fallbackSummary(totalSpend, totalWaste, wastePct, verdict)
  } catch {
    return fallbackSummary(totalSpend, totalWaste, wastePct, verdict)
  }
}

function fallbackSummary(
  totalSpend: number,
  totalWaste: number,
  wastePct: number,
  verdict: Verdict
): string {
  return `Your organisation is spending ${inr(totalSpend)}/mo on AI tools, but ${wastePct}% of that — ${inr(totalWaste)} — is going to waste every month. The biggest opportunities are cutting unused seats, consolidating overlapping tools, and renegotiating plans. ${verdict.text}`
}
