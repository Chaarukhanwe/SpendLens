import { z } from "zod"

export const auditToolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  plan: z.string().min(1, "Plan is required"),
  monthlySpend: z.number().min(0, "Spend must be 0 or more"),
  seats: z.number().min(1, "Must have at least 1 seat"),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  useCase: z.string().min(1, "Use case is required"),
})

export const runAuditSchema = z.object({
  tools: z.array(auditToolSchema).min(1, "Add at least one tool"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  // Honeypot — bots fill this, humans don't
  honeypot: z.string().max(0, "Bot detected").optional(),
})

export type RunAuditInput = z.infer<typeof runAuditSchema>
