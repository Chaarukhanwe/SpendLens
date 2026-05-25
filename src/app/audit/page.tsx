"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { runAuditSchema, type RunAuditInput } from "@/lib/schemas"
import { TOOL_NAMES, TOOL_PLANS, USE_CASES } from "@/lib/toolData"
import { ComboBox } from "@/components/ComboBox"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RunAuditInput>({
    resolver: zodResolver(runAuditSchema),
    defaultValues: {
      tools: [
        { name: "", plan: "", monthlySpend: 0, seats: 1, teamSize: 1, useCase: "" },
      ],
      email: "",
      honeypot: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "tools" })

  const onSubmit = async (data: RunAuditInput) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Something went wrong")

      // Store in sessionStorage for results page
      sessionStorage.setItem("auditResult", JSON.stringify(json.audit))
      sessionStorage.setItem("shareSlug", json.shareSlug)

      router.push("/results")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-sm font-bold tracking-wide">
          spend<span className="text-blue">lens</span>
        </a>
        <span className="text-xs text-muted border border-border rounded-full px-3 py-1 font-mono">
          01 / audit input
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">AI tools your team is paying for</h1>
        <p className="text-sm text-muted mb-8">
          Be honest. Every tool counts. We&apos;ll tell you what to cut and where to reinvest.
        </p>

        {/* Honeypot - hidden from humans */}
        <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} aria-hidden />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, idx) => {
            const toolName = watch(`tools.${idx}.name`)
            const plans = TOOL_PLANS[toolName] ?? ["Free", "Starter", "Pro", "Enterprise"]

            return (
              <div key={field.id} className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-dimmer font-mono tracking-widest">
                    TOOL_{String(idx + 1).padStart(2, "0")}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-dimmer hover:text-red-DEFAULT transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Tool Name */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
                      Tool Name
                    </label>
                    <ComboBox
                      options={TOOL_NAMES}
                      placeholder="Type to search (e.g. ChatGPT)..."
                      value={toolName}
                      onChange={(val) => {
                        setValue(`tools.${idx}.name`, val)
                        setValue(`tools.${idx}.plan`, "")
                      }}
                    />
                    {errors.tools?.[idx]?.name && (
                      <p className="text-red-DEFAULT text-xs mt-1">{errors.tools[idx]?.name?.message}</p>
                    )}
                  </div>

                  {/* Plan */}
                  <div>
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">Plan</label>
                    <select
                      {...register(`tools.${idx}.plan`)}
                      className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
                    >
                      <option value="">Select plan</option>
                      {plans.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.tools?.[idx]?.plan && (
                      <p className="text-red-DEFAULT text-xs mt-1">{errors.tools[idx]?.plan?.message}</p>
                    )}
                  </div>

                  {/* Monthly Spend */}
                  <div>
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
                      Monthly Spend (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">₹</span>
                      <input
                        type="number"
                        min={0}
                        {...register(`tools.${idx}.monthlySpend`, { valueAsNumber: true })}
                        placeholder="0"
                        className="w-full bg-bg border border-border rounded-md pl-7 pr-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
                      />
                    </div>
                  </div>

                  {/* Seats */}
                  <div>
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
                      Seats / Licenses
                    </label>
                    <input
                      type="number"
                      min={1}
                      {...register(`tools.${idx}.seats`, { valueAsNumber: true })}
                      placeholder="1"
                      className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
                    />
                  </div>

                  {/* Team Size */}
                  <div>
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
                      Team Size Using It
                    </label>
                    <input
                      type="number"
                      min={1}
                      {...register(`tools.${idx}.teamSize`, { valueAsNumber: true })}
                      placeholder="1"
                      className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
                    />
                  </div>

                  {/* Use Case */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
                      Use Case
                    </label>
                    <ComboBox
                      options={USE_CASES}
                      placeholder="Type use case (e.g. Code Generation)..."
                      value={watch(`tools.${idx}.useCase`)}
                      onChange={(val) => setValue(`tools.${idx}.useCase`, val)}
                    />
                    {errors.tools?.[idx]?.useCase && (
                      <p className="text-red-DEFAULT text-xs mt-1">{errors.tools[idx]?.useCase?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add tool */}
          <button
            type="button"
            onClick={() =>
              append({ name: "", plan: "", monthlySpend: 0, seats: 1, teamSize: 1, useCase: "" })
            }
            className="w-full py-3 border border-dashed border-border rounded-lg text-sm text-dimmer hover:border-blue-dim hover:text-blue transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add another tool
          </button>

          {/* Email */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <label className="text-[10px] text-dimmer uppercase tracking-widest mb-1 block">
              Email (optional) — get the PDF report
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="you@company.com"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
            />
            {errors.email && (
              <p className="text-red-DEFAULT text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-DEFAULT/10 border border-red-DEFAULT/30 rounded-lg px-4 py-3 text-sm text-red-DEFAULT">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-dim hover:bg-blue disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-md text-sm transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Analysing...
                </>
              ) : (
                "Run Audit →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
