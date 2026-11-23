"use client";

import { useState } from "react";

type Dependency = {
  application: string;
  provider: string;
  model: string;
  business_process: string;
  annual_revenue_exposure: number;
  criticality: string;
  fallback_provider: string;
  fallback_validated: boolean;
};

type Finding = {
  severity: string;
  title: string;
  explanation: string;
  financial_exposure: number;
};

type AnalysisResult = {
  continuity_score: number;
  total_dependencies: number;
  critical_dependencies: number;
  unvalidated_fallbacks: number;
  findings: Finding[];
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://ai-continuity-api.onrender.com").replace(/\\/+$/, "");

function createDependency(): Dependency {
  return {
    application: "",
    provider: "",
    model: "",
    business_process: "",
    annual_revenue_exposure: 0,
    criticality: "medium",
    fallback_provider: "",
    fallback_validated: false,
  };
}

export default function Home() {
  const [dependencies, setDependencies] = useState<Dependency[]>([
    createDependency(),
  ]);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateDependency(
    index: number,
    field: keyof Dependency,
    value: string | number | boolean
  ) {
    setDependencies((current) =>
      current.map((dependency, i) =>
        i === index
          ? {
              ...dependency,
              [field]: value,
            }
          : dependency
      )
    );
  }

  function addDependency() {
    setDependencies((current) => [...current, createDependency()]);
  }

  function removeDependency(index: number) {
    setDependencies((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dependencies,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the analysis service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function scoreLabel(score: number) {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Weak";
    return "Critical";
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-xl font-semibold tracking-tight">
            AI Continuity
          </div>

          <div className="text-sm text-gray-400">
            AI Dependency Risk Intelligence
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="max-w-4xl">
          <div className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            AI Infrastructure Resilience
          </div>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            Know what breaks when your AI stack breaks.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400">
            Map your AI dependencies, identify critical business exposure,
            and discover where your company could fail when an AI provider
            becomes unavailable.
          </p>
        </div>

        {/* Scan */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold">
                Free AI Risk Scan
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Enter the AI systems your business currently depends on.
              </p>
            </div>

            <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-gray-400">
              No account required
            </div>
          </div>

          <div className="space-y-6">
            {dependencies.map((dependency, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-black/40 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-medium">
                    AI Dependency {index + 1}
                  </h3>

                  {dependencies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDependency(index)}
                      className="text-sm text-gray-500 hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Application"
                    placeholder="Customer Support AI"
                    value={dependency.application}
                    onChange={(value) =>
                      updateDependency(index, "application", value)
                    }
                  />

                  <Field
                    label="Provider"
                    placeholder="OpenAI"
                    value={dependency.provider}
                    onChange={(value) =>
                      updateDependency(index, "provider", value)
                    }
                  />

                  <Field
                    label="Model"
                    placeholder="GPT-5"
                    value={dependency.model}
                    onChange={(value) =>
                      updateDependency(index, "model", value)
                    }
                  />

                  <Field
                    label="Business Process"
                    placeholder="Customer Support"
                    value={dependency.business_process}
                    onChange={(value) =>
                      updateDependency(index, "business_process", value)
                    }
                  />

                  <Field
                    label="Annual Revenue Exposure ($)"
                    placeholder="2100000"
                    type="number"
                    value={dependency.annual_revenue_exposure}
                    onChange={(value) =>
                      updateDependency(
                        index,
                        "annual_revenue_exposure",
                        Number(value)
                      )
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Criticality
                    </label>

                    <select
                      value={dependency.criticality}
                      onChange={(event) =>
                        updateDependency(
                          index,
                          "criticality",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-white/30"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <Field
                    label="Fallback Provider"
                    placeholder="Anthropic"
                    value={dependency.fallback_provider}
                    onChange={(value) =>
                      updateDependency(
                        index,
                        "fallback_provider",
                        value
                      )
                    }
                  />

                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-3 pb-3">
                      <input
                        type="checkbox"
                        checked={dependency.fallback_validated}
                        onChange={(event) =>
                          updateDependency(
                            index,
                            "fallback_validated",
                            event.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-gray-300">
                        Fallback has been validated
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addDependency}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/5"
            >
              + Add AI Dependency
            </button>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run Free AI Risk Scan"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <section className="mt-12">
            <div className="mb-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
                Analysis Complete
              </div>

              <h2 className="mt-3 text-3xl font-semibold">
                Your AI Continuity Report
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Metric
                label="Continuity Score"
                value={`${result.continuity_score}/100`}
                subtitle={scoreLabel(result.continuity_score)}
              />

              <Metric
                label="Dependencies"
                value={result.total_dependencies}
              />

              <Metric
                label="Critical"
                value={result.critical_dependencies}
              />

              <Metric
                label="Unvalidated Fallbacks"
                value={result.unvalidated_fallbacks}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <h3 className="text-xl font-semibold">
                Risk Findings
              </h3>

              {result.findings.length === 0 ? (
                <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-5 text-sm text-gray-400">
                  No material findings were detected from the information
                  provided.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {result.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-black/30 p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {finding.severity}
                          </div>

                          <h4 className="mt-2 font-semibold">
                            {finding.title}
                          </h4>

                          <p className="mt-2 text-sm leading-6 text-gray-400">
                            {finding.explanation}
                          </p>
                        </div>

                        {finding.financial_exposure > 0 && (
                          <div className="shrink-0 text-sm text-gray-400">
                            Exposure: $
                            {finding.financial_exposure.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <h3 className="text-2xl font-semibold">
                Want the full continuity assessment?
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
                Identify hidden AI concentration risks, quantify business
                impact, evaluate fallback options, and build a practical
                recovery strategy.
              </p>

              <button
                type="button"
                className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200"
              >
                Request Full Assessment
              </button>
            </div>
          </section>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-500">
          AI Continuity — AI dependency and business continuity intelligence.
        </div>
      </footer>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-white/30"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-gray-500">{label}</div>

      <div className="mt-3 text-3xl font-semibold">
        {value}
      </div>

      {subtitle && (
        <div className="mt-1 text-sm text-gray-400">
          {subtitle}
        </div>
      )}
    </div>
  );
}