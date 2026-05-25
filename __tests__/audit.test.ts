import { describe, it, expect } from "vitest"
import {
  calcToolResult,
  generateRecs,
  generateVerdict,
  inr,
} from "../src/lib/audit"
import type { AuditTool } from "../src/types"

// ─── Test Data ────────────────────────────────────────────────

const chatgptTool: AuditTool = {
  name: "ChatGPT",
  plan: "Team",
  monthlySpend: 10000,
  seats: 10,
  teamSize: 10,
  useCase: "Writing & Content",
}

const jasperTool: AuditTool = {
  name: "Jasper",
  plan: "Pro",
  monthlySpend: 5000,
  seats: 5,
  teamSize: 5,
  useCase: "Writing & Content",
}

const unusedSeatsTool: AuditTool = {
  name: "Grammarly",
  plan: "Business",
  monthlySpend: 6000,
  seats: 10,
  teamSize: 4,
  useCase: "Writing & Content",
}

const codeTool: AuditTool = {
  name: "GitHub Copilot",
  plan: "Business",
  monthlySpend: 8000,
  seats: 8,
  teamSize: 8,
  useCase: "Code Generation",
}

// ─── Tests ────────────────────────────────────────────────────

describe("calcToolResult", () => {
  it("calculates monthly waste correctly for fully utilised tool", () => {
    const result = calcToolResult(chatgptTool)
    expect(result.monthlyWaste).toBeGreaterThan(0)
    expect(result.monthlyWaste).toBeLessThanOrEqual(chatgptTool.monthlySpend * 0.75)
  })

  it("flags unused seats as waste", () => {
    const result = calcToolResult(unusedSeatsTool)
    // 6 unused seats out of 10 should produce significant waste
    expect(result.monthlyWaste).toBeGreaterThan(2000)
  })

  it("annual savings = monthly waste × 12", () => {
    const result = calcToolResult(chatgptTool)
    expect(result.annualSavings).toBe(result.monthlyWaste * 12)
  })

  it("utilisation is capped at 100%", () => {
    const overUsed: AuditTool = { ...chatgptTool, teamSize: 20, seats: 5 }
    const result = calcToolResult(overUsed)
    expect(result.utilizationPct).toBe(100)
  })

  it("waste does not exceed 75% of spend", () => {
    const result = calcToolResult(unusedSeatsTool)
    expect(result.monthlyWaste).toBeLessThanOrEqual(unusedSeatsTool.monthlySpend * 0.75)
  })
})

describe("generateRecs", () => {
  it("detects overlap when two tools cover same use case", () => {
    const tools = [chatgptTool, jasperTool]
    const results = tools.map(calcToolResult)
    const recs = generateRecs(tools, results)
    const overlapRec = recs.find((r) => r.type === "cut" && r.label.includes("OVERLAP"))
    expect(overlapRec).toBeDefined()
  })

  it("detects unused seats and recommends cut", () => {
    const tools = [unusedSeatsTool]
    const results = tools.map(calcToolResult)
    const recs = generateRecs(tools, results)
    const seatRec = recs.find((r) => r.label.includes("UNUSED SEATS"))
    expect(seatRec).toBeDefined()
  })

  it("suggests reinvestment when budget freed up and use case uncovered", () => {
    // High spend tools with lots of waste but no meetings/docs coverage
    const tools = [
      { ...unusedSeatsTool, monthlySpend: 20000 },
      { ...jasperTool, monthlySpend: 15000 },
    ]
    const results = tools.map(calcToolResult)
    const recs = generateRecs(tools, results)
    const reinvestRec = recs.find((r) => r.type === "reinvest")
    expect(reinvestRec).toBeDefined()
  })
})

describe("generateVerdict", () => {
  it("returns optimise verdict for >40% waste", () => {
    const verdict = generateVerdict(55, ["Writing & Content"])
    expect(verdict.type).toBe("optimise")
  })

  it("returns invest-more verdict for <20% waste with uncovered use cases", () => {
    const verdict = generateVerdict(10, ["Code Generation"])
    expect(verdict.type).toBe("invest-more")
  })

  it("returns no-more verdict for middle ground", () => {
    const verdict = generateVerdict(30, ["Writing & Content"])
    expect(verdict.type).toBe("no-more")
  })
})

describe("inr helper", () => {
  it("formats numbers in Indian rupee format", () => {
    expect(inr(100000)).toBe("₹1,00,000")
    expect(inr(1650)).toBe("₹1,650")
  })
})
