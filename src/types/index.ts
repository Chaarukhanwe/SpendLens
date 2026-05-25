// ─── Tool Input ───────────────────────────────────────────────
export interface AuditTool {
  name: string
  plan: string
  monthlySpend: number   // in INR
  seats: number
  teamSize: number
  useCase: string
}

// ─── Audit Result per Tool ────────────────────────────────────
export interface ToolResult extends AuditTool {
  monthlyWaste: number
  annualSavings: number
  utilizationPct: number
  wastePct: number
}

// ─── Smart Recommendation ─────────────────────────────────────
export type RecType = "cut" | "reinvest" | "warning" | "ok"

export interface SmartRec {
  type: RecType
  icon: string
  label: string
  title: string
  detail: string
  saving: string
}

// ─── Verdict ──────────────────────────────────────────────────
export type VerdictType = "optimise" | "invest-more" | "no-more"

export interface Verdict {
  type: VerdictType
  title: string
  text: string
}

// ─── Full Audit Result ────────────────────────────────────────
export interface AuditResult {
  id: string
  tools: ToolResult[]
  totalMonthlySpend: number
  totalMonthlyWaste: number
  totalAnnualSavings: number
  wastePct: number
  recs: SmartRec[]
  verdict: Verdict
  aiSummary: string
  createdAt: string
}

// ─── Supabase DB Row ──────────────────────────────────────────
export interface AuditRow {
  id: string
  result: AuditResult
  email: string | null
  share_slug: string
  created_at: string
}

// ─── API Payloads ─────────────────────────────────────────────
export interface RunAuditPayload {
  tools: AuditTool[]
  email?: string
}

export interface RunAuditResponse {
  audit: AuditResult
  shareSlug: string
}
