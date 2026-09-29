"use client"

import React, { useMemo, useState } from "react"
import {
  AlertCircle,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  FileText,
  GitBranch,
  History,
  Lightbulb,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from "lucide-react"

type EvidenceItem = any

type AnalysisResult = {
  problem: string
  current_context: string
  recommendation: string
  historical_evidence: EvidenceItem[]
}

const stages = [
  "Understand the problem",
  "Recall relevant experience",
  "Compare with current context",
  "Recommend next action",
]

const navItems = [
  {
    label: "Investigations",
    icon: Search,
  },
  {
    label: "Incidents",
    icon: AlertCircle,
  },
  {
    label: "Knowledge",
    icon: Brain,
  },
  {
    label: "Runbooks",
    icon: FileText,
  },
  {
    label: "Context check",
    icon: GitBranch,
  },
]

function getEvidenceText(item: any): string {
  if (!item) return ""

  if (typeof item === "string") {
    return item
  }

  return (
    item.content ||
    item.text ||
    item.memory ||
    item.description ||
    item.fact ||
    item.summary ||
    JSON.stringify(item)
  )
}

function getSummary(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^Engineering memory\s*/i, "")
    .replace(/^Architecture decision\s*/i, "")
    .trim()
}

function getMostRelevantEvidence(
  evidence: EvidenceItem[]
): EvidenceItem[] {
  if (!Array.isArray(evidence)) {
    return []
  }

  const seen = new Set<string>()

  return evidence.filter((item) => {
    const text = getEvidenceText(item)
      .replace(/\s+/g, " ")
      .trim()

    if (!text) return false

    const key = text.toLowerCase()

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function Sidebar({
  onNew,
}: {
  onNew: () => void
}) {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[240px] flex-col border-r border-[#252a32] bg-[#0b0d12]">
      <div className="px-6 pb-7 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-[#b18b48]">
            <Brain className="h-4 w-4 text-[#c29a50]" />
          </div>

          <div>
            <div className="text-[15px] font-semibold tracking-[0.08em] text-[#e6e7e9]">
              RECALL
            </div>

            <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#626873]">
              Engineering memory
            </div>
          </div>
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 border border-[#3a3429] bg-[#15130f] px-4 py-3 text-[12px] font-medium text-[#c29a50] transition hover:border-[#665331]"
        >
          <Plus className="h-4 w-4" />
          New investigation
        </button>
      </div>

      <nav className="mt-8 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const active = index === 0

          return (
            <button
              key={item.label}
              className={`mb-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-[12px] transition ${
                active
                  ? "bg-[#171a20] text-[#dedfe2]"
                  : "text-[#666c76] hover:bg-[#11141a] hover:text-[#a9adb4]"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  active ? "text-[#c29a50]" : "text-[#555b65]"
                }`}
              />

              <span>{item.label}</span>

              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-[#555b65]" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-[#252a32] px-5 py-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#555b65]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6e8a63]" />
          Hindsight connected
        </div>

        <div className="mt-2 text-[11px] leading-5 text-[#50555f]">
          Persistent organizational memory
        </div>
      </div>
    </aside>
  )
}

function EvidenceCard({
  item,
  index,
}: {
  item: EvidenceItem
  index: number
}) {
  const text = getEvidenceText(item)
  const summary = getSummary(text)

  return (
    <div className="border-b border-[#252a32] py-5 last:border-b-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center border border-[#353a43] text-[9px] text-[#6f7580]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="text-[9px] uppercase tracking-[0.13em] text-[#656b75]">
          Engineering memory
        </span>
      </div>

      <p className="text-sm leading-6 text-[#969ca7]">
        {summary}
      </p>
    </div>
  )
}

function HistoricalEvidence({
  evidence,
}: {
  evidence: EvidenceItem[]
}) {
  const relevantEvidence = getMostRelevantEvidence(evidence)

  if (!relevantEvidence.length) {
    return (
      <div className="border-l border-[#252a32] pl-6">
        <div className="flex items-center gap-2 text-sm text-[#646a75]">
          <Brain className="h-4 w-4" />
          No historical evidence found.
        </div>
      </div>
    )
  }

  const memories = relevantEvidence.map((item) =>
    getEvidenceText(item)
  )

  const lowerMemories = memories.map((text) =>
    text.toLowerCase()
  )

  const isAnalyticsCase =
    lowerMemories.some((text) =>
      text.includes("analytics service")
    ) ||
    lowerMemories.some((text) =>
      text.includes("analytical workloads")
    )

  /*
   * ANALYTICS / CONTEXT OVERRIDE
   *
   * We deliberately construct a narrative from memories that
   * Hindsight actually returned. No new historical facts are
   * invented here.
   */
  if (isAnalyticsCase) {
    const previousDecision = memories.find((text) => {
      const value = text.toLowerCase()

      return (
        value.includes("strong transactional consistency") ||
        value.includes("postgresql")
      )
    })

    const relatedReview = memories.find((text) => {
      const value = text.toLowerCase()

      return (
        value.includes("whether analytics service") ||
        value.includes("analytics service should adopt")
      )
    })

    const analyticsExperience = memories.find((text) => {
      const value = text.toLowerCase()

      return (
        value.includes("object storage") ||
        value.includes("large analytics exports")
      )
    })

    return (
      <div className="border-l border-[#252a32] pl-6">
        {previousDecision && (
          <div className="border-b border-[#252a32] py-5">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c29a50]">
              Previous decision
            </div>

            <p className="text-sm leading-6 text-[#969ca7]">
              {getSummary(previousDecision)}
            </p>
          </div>
        )}

        {relatedReview && (
          <div className="border-b border-[#252a32] py-5">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777d87]">
              Related historical review
            </div>

            <p className="text-sm leading-6 text-[#969ca7]">
              {getSummary(relatedReview)}
            </p>
          </div>
        )}

        {analyticsExperience && (
          <div className="border-b border-[#252a32] py-5">
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777d87]">
              Relevant analytics experience
            </div>

            <p className="text-sm leading-6 text-[#969ca7]">
              {getSummary(analyticsExperience)}
            </p>
          </div>
        )}

        <div className="py-5">
          <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c29a50]">
            Context changed
          </div>

          <div className="border border-[#343a44] bg-[#11151c] px-4 py-4">
            <p className="text-sm leading-6 text-[#b0b5bd]">
              The current Analytics Service has different
              requirements and does not require transactional
              consistency.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /*
   * GENERIC / PAYMENT INCIDENT CASE
   */

  const failedApproach = memories.find((text) => {
    const value = text.toLowerCase()

    return (
      value.includes("failed") ||
      value.includes("did not improve") ||
      value.includes("didn't improve") ||
      value.includes("replicas")
    )
  })

  const rootCause = memories.find((text) =>
    text.toLowerCase().includes("root cause")
  )

  const resolution = memories.find((text) => {
    const value = text.toLowerCase()

    return (
      value.includes("100") &&
      value.includes("250")
    )
  })

  const lesson = memories.find((text) => {
    const value = text.toLowerCase()

    return (
      value.includes("lesson") ||
      value.includes("check database connection pool")
    )
  })

  const usedNarrativeMemory = new Set(
    [
      failedApproach,
      rootCause,
      resolution,
      lesson,
    ].filter(Boolean)
  )

  const remainingEvidence = relevantEvidence.filter(
    (item) =>
      !usedNarrativeMemory.has(getEvidenceText(item))
  )

  return (
    <div className="border-l border-[#252a32] pl-6">
      {failedApproach && (
        <div className="border-b border-[#252a32] py-5">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c29a50]">
            Previous approach
          </div>

          <p className="text-sm leading-6 text-[#969ca7]">
            {getSummary(failedApproach)}
          </p>
        </div>
      )}

      {rootCause && (
        <div className="border-b border-[#252a32] py-5">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777d87]">
            Root cause
          </div>

          <p className="text-sm leading-6 text-[#969ca7]">
            {getSummary(rootCause)}
          </p>
        </div>
      )}

      {resolution && (
        <div className="border-b border-[#252a32] py-5">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#777d87]">
            What fixed it
          </div>

          <p className="text-sm leading-6 text-[#969ca7]">
            {getSummary(resolution)}
          </p>
        </div>
      )}

      {lesson && (
        <div className="border-b border-[#252a32] py-5">
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c29a50]">
            Lesson
          </div>

          <p className="text-sm leading-6 text-[#969ca7]">
            {getSummary(lesson)}
          </p>
        </div>
      )}

      {remainingEvidence.length > 0 && (
        <div>
          {remainingEvidence.map((item, index) => (
            <EvidenceCard
              key={`${getEvidenceText(item)}-${index}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProgressStages({
  currentStage,
}: {
  currentStage: number
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stages.map((stage, index) => {
        const completed = index < currentStage
        const active = index === currentStage

        return (
          <div key={stage}>
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  completed
                    ? "border-[#788c6b] bg-[#182016] text-[#92a987]"
                    : active
                      ? "border-[#b18b48] text-[#c29a50]"
                      : "border-[#353a43] text-[#555b65]"
                }`}
              >
                {completed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="text-[9px]">
                    {index + 1}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] ${
                  active
                    ? "text-[#b4b8c0]"
                    : "text-[#555b65]"
                }`}
              >
                {stage}
              </span>
            </div>

            <div
              className={`h-[2px] ${
                completed
                  ? "bg-[#68785e]"
                  : active
                    ? "bg-[#b18b48]"
                    : "bg-[#242932]"
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}

function MemoryCount({
  count,
}: {
  count: number
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-[#858b95]">
      <Brain className="h-4 w-4 text-[#c29a50]" />

      <span>
        I found{" "}
        <span className="font-medium text-[#c7c9ce]">
          {count}
        </span>{" "}
        memories recalled from Hindsight.
      </span>
    </div>
  )
}

function Recommendation({
  recommendation,
}: {
  recommendation: string
}) {
  return (
    <div className="border border-[#343a44] bg-[#11151c] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-[#c29a50]" />

        <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#c29a50]">
          Recommendation
        </span>
      </div>

      <p className="text-sm leading-7 text-[#b7bbc2]">
        {recommendation}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-[#5f6570]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Based on historical evidence and current context.
      </div>
    </div>
  )
}

export default function RecallDashboard() {
  const [problem, setProblem] = useState(
    "Payment API latency is currently very high. Should we increase the number of Payment Service replicas?"
  )

  const [currentContext, setCurrentContext] = useState(
    "Payment Service. Production. Strong transactional consistency required."
  )

  const [result, setResult] =
    useState<AnalysisResult | null>(null)

  const [loading, setLoading] = useState(false)

  const [saved, setSaved] = useState(false)

  const [error, setError] = useState("")

  const [activeNav, setActiveNav] =
    useState("Investigations")

  const evidence = useMemo(() => {
    return result?.historical_evidence || []
  }, [result])

  async function investigate() {
    setLoading(true)
    setError("")
    setSaved(false)

    try {
      const response = await fetch(
        "http://localhost:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problem,
            current_context: currentContext,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        )
      }

      const data = await response.json()

      setResult(data)
    } catch (err) {
      console.error(err)

      setError(
        "Could not connect to the RECALL backend. Make sure FastAPI is running on port 8000."
      )
    } finally {
      setLoading(false)
    }
  }

  async function saveLesson() {
    if (!result) return

    try {
      const lesson = result.recommendation

      const response = await fetch(
        "http://localhost:8000/lessons",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lesson,
            context: currentContext,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Backend returned ${response.status}`
        )
      }

      setSaved(true)
    } catch (err) {
      console.error(err)

      setError(
        "The lesson could not be saved to Hindsight."
      )
    }
  }

  function newInvestigation() {
    setResult(null)
    setSaved(false)
    setError("")
  }

  function loadAnalyticsDemo() {
    setProblem(
      "Analytics Service needs a new database architecture."
    )

    setCurrentContext(
      "Analytics Service does not require transactional consistency. It primarily handles analytical workloads."
    )

    setResult(null)
    setSaved(false)
    setError("")
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#d8d9dc]">
      <Sidebar onNew={newInvestigation} />

      <main className="ml-[240px] min-h-screen">
        <div className="mx-auto max-w-[1120px] px-12 py-10">
          {/* TOP BAR */}

          <div className="mb-12 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#5e646e]">
                <Sparkles className="h-3.5 w-3.5 text-[#b18b48]" />
                AI engineering memory powered by Hindsight
              </div>

              <h1 className="mt-3 text-[27px] font-medium tracking-[-0.02em] text-[#e5e5e7]">
                RECALL Investigation
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAnalyticsDemo}
                className="border border-[#2d323b] px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-[#777d87] transition hover:border-[#494f59] hover:text-[#a5a9b0]"
              >
                Context demo
              </button>

              <div className="flex items-center gap-2 border border-[#292e36] px-3 py-2 text-[10px] text-[#676d77]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#718667]" />
                Memory active
              </div>
            </div>
          </div>

          {!result ? (
            <>
              {/* INPUT VIEW */}

              <section className="border-t border-[#252a32] pt-8">
                <div className="grid grid-cols-[1fr_280px] gap-14">
                  <div>
                    <div className="mb-7">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[#606671]">
                        Incident brief
                      </div>

                      <p className="max-w-[720px] text-[17px] leading-8 text-[#b9bdc4]">
                        Tell RECALL what is happening and
                        what you are considering.
                      </p>
                    </div>

                    <div className="space-y-7">
                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-[#656b75]">
                          Problem
                        </label>

                        <textarea
                          value={problem}
                          onChange={(e) =>
                            setProblem(e.target.value)
                          }
                          rows={4}
                          className="w-full resize-none border border-[#30353e] bg-[#101319] px-4 py-4 text-sm leading-6 text-[#c2c5ca] outline-none transition focus:border-[#69542f]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-[#656b75]">
                          Current context
                        </label>

                        <textarea
                          value={currentContext}
                          onChange={(e) =>
                            setCurrentContext(
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full resize-none border border-[#30353e] bg-[#101319] px-4 py-4 text-sm leading-6 text-[#c2c5ca] outline-none transition focus:border-[#69542f]"
                        />
                      </div>

                      {error && (
                        <div className="border border-[#493031] bg-[#1a1113] px-4 py-3 text-xs leading-5 text-[#b77e80]">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={investigate}
                        disabled={loading || !problem.trim()}
                        className="group flex items-center gap-3 bg-[#b18b48] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#0d0e11] transition hover:bg-[#c19a53] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {loading
                          ? "Investigating..."
                          : "Start investigation"}

                        {!loading && (
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="border-l border-[#252a32] pl-7">
                    <div className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#606671]">
                      Investigation flow
                    </div>

                    <ProgressStages currentStage={0} />

                    <div className="mt-8 space-y-5">
                      <div className="flex gap-3">
                        <CircleDot className="mt-1 h-3.5 w-3.5 text-[#b18b48]" />

                        <div>
                          <div className="text-xs text-[#969ba3]">
                            Recall past experience
                          </div>

                          <div className="mt-1 text-[11px] leading-5 text-[#555b65]">
                            Search organizational memory
                            for similar situations.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <CircleDot className="mt-1 h-3.5 w-3.5 text-[#4f555f]" />

                        <div>
                          <div className="text-xs text-[#777c85]">
                            Compare context
                          </div>

                          <div className="mt-1 text-[11px] leading-5 text-[#555b65]">
                            Determine whether the old
                            decision still applies.
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <CircleDot className="mt-1 h-3.5 w-3.5 text-[#4f555f]" />

                        <div>
                          <div className="text-xs text-[#777c85]">
                            Recommend
                          </div>

                          <div className="mt-1 text-[11px] leading-5 text-[#555b65]">
                            Turn memory into a contextual
                            engineering decision.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* RESULT VIEW */}

              <section className="border-t border-[#252a32] pt-7">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#656b75]">
                      <Check className="h-3.5 w-3.5 text-[#778d6c]" />
                      Investigation complete
                    </div>

                    <div className="text-[13px] text-[#777d87]">
                      Historical context has been applied to
                      the current problem.
                    </div>
                  </div>

                  <button
                    onClick={newInvestigation}
                    className="flex items-center gap-2 border border-[#30353e] px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-[#777d87] transition hover:border-[#4a5059] hover:text-[#b1b4bb]"
                  >
                    New investigation
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <ProgressStages currentStage={4} />

                <div className="mt-12 grid grid-cols-[1fr_270px] gap-14">
                  <div>
                    <MemoryCount count={evidence.length} />

                    <div className="mt-8">
                      <div className="mb-4 inline-flex items-center gap-2 border border-[#57492f] bg-[#16130e] px-3 py-1.5">
                        <History className="h-3.5 w-3.5 text-[#c29a50]" />

                        <span className="text-[9px] uppercase tracking-[0.14em] text-[#c29a50]">
                          Relevant incident
                        </span>
                      </div>

                      <h2 className="mt-2 text-[21px] font-medium tracking-[-0.015em] text-[#dedfe2]">
                        What happened last time?
                      </h2>

                      <div className="mt-5">
                        <HistoricalEvidence
                          evidence={evidence}
                        />
                      </div>
                    </div>

                    <div className="mt-10">
                      <Recommendation
                        recommendation={
                          result.recommendation
                        }
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#252a32] pt-5">
                      <div className="text-[10px] leading-5 text-[#555b65]">
                        Saving this outcome creates another
                        piece of organizational memory.
                      </div>

                      <button
                        onClick={saveLesson}
                        disabled={saved}
                        className={`flex items-center gap-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                          saved
                            ? "border border-[#374234] bg-[#151b15] text-[#78916c]"
                            : "border border-[#5b4b2e] bg-[#16130e] text-[#c29a50] hover:border-[#806a3e]"
                        }`}
                      >
                        {saved ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Lesson saved
                          </>
                        ) : (
                          <>
                            <Database className="h-3.5 w-3.5" />
                            Save lesson
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <aside className="border-l border-[#252a32] pl-7">
                    <div className="mb-5 text-[10px] uppercase tracking-[0.14em] text-[#606671]">
                      Investigation context
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="mb-2 text-[9px] uppercase tracking-[0.13em] text-[#505661]">
                          Current problem
                        </div>

                        <p className="text-[12px] leading-5 text-[#858a93]">
                          {result.problem}
                        </p>
                      </div>

                      <div>
                        <div className="mb-2 text-[9px] uppercase tracking-[0.13em] text-[#505661]">
                          Current constraints
                        </div>

                        <p className="text-[12px] leading-5 text-[#858a93]">
                          {result.current_context}
                        </p>
                      </div>

                      <div className="border-t border-[#252a32] pt-5">
                        <div className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-[#505661]">
                          <Terminal className="h-3.5 w-3.5" />
                          Memory process
                        </div>

                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Check className="mt-0.5 h-3 w-3 text-[#728667]" />
                            <span className="text-[11px] leading-5 text-[#626872]">
                              Historical memories recalled
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Check className="mt-0.5 h-3 w-3 text-[#728667]" />
                            <span className="text-[11px] leading-5 text-[#626872]">
                              Current context evaluated
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Check className="mt-0.5 h-3 w-3 text-[#728667]" />
                            <span className="text-[11px] leading-5 text-[#626872]">
                              Recommendation generated
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}