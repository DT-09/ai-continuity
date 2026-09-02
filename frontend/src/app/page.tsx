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

type Result = {
  continuity_score: number;
  total_dependencies: number;
  critical_dependencies: number;
  unvalidated_fallbacks: number;
  findings: Finding[];
};

const emptyDependency: Dependency = {
  application: "",
  provider: "",
  model: "",
  business_process: "",
  annual_revenue_exposure: 0,
  criticality: "medium",
  fallback_provider: "",
  fallback_validated: false,
};

export default function Home() {
  const [dependencies, setDependencies] = useState<Dependency[]>([
    { ...emptyDependency },
  ]);

  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateDependency(
    index: number,
    field: keyof Dependency,
    value: string | number | boolean
  ) {
    setDependencies((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addDependency() {
    setDependencies((current) => [...current, { ...emptyDependency }]);
  }

  function removeDependency(index: number) {
    setDependencies((current) => current.filter((_, i) => i !== index));
  }

  async function runScan() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dependencies: dependencies.map((d) => ({
            ...d,
            annual_revenue_exposure: Number(d.annual_revenue_exposure),
            fallback_provider: d.fallback_provider || null,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);

      setTimeout(() => {
        document
          .getElementById("report")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError(
        "Could not connect to the analysis engine. Make sure the FastAPI server is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  function scoreLabel(score: number) {
    if (score >= 80) return "Strong";
    if (score >= 60) return "At Risk";
    return "Critical";
  }

  return (
    <main className="min-h-screen bg-[#070b12] text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-semibold tracking-tight">
            AI<span className="text-cyan-400">Continuity</span>
          </div>

          <div className="hidden text-sm text-gray-400 md:block">
            AI Dependency & Resilience Intelligence
          </div>

          <a
            href="#scan"
            className="rounded-lg border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/10"
          >
            Free Risk Scan
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-300">
            AI Business Continuity Infrastructure
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Know what breaks
            <br />
            when your <span className="text-cyan-400">AI stack breaks.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
            Map your AI dependencies, quantify business exposure, identify
            single-provider risks, and determine whether your fallback
            strategy can actually protect the business.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#scan"
              className="rounded-xl bg-cyan-400 px-6 py-3.5 text-center font-semibold text-black transition hover:bg-cyan-300"
            >
              Run Free AI Risk Scan
            </a>

            <a
              href="#how"
              className="rounded-xl border border-white/15 px-6 py-3.5 text-center font-medium text-white transition hover:bg-white/5"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* VALUE PROPS */}
        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {[
            [
              "01",
              "Dependency Visibility",
              "Understand which models, providers and infrastructure your critical AI applications depend on.",
            ],
            [
              "02",
              "Business Impact",
              "Connect technical AI dependencies to revenue exposure and critical business processes.",
            ],
            [
              "03",
              "Fallback Readiness",
              "Identify missing and unvalidated alternatives before an outage forces the issue.",
            ],
          ].map(([number, title, description]) => (
            <div
              key={number}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-7"
            >
              <div className="text-sm text-cyan-400">{number}</div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SCAN */}
      <section id="scan" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-cyan-400">
              FREE RISK SCAN
            </div>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              See your AI continuity risk.
            </h2>

            <p className="mt-4 text-gray-400">
              Enter the AI systems that matter to your business. The engine
              will calculate a preliminary continuity score and identify the
              highest-risk dependencies.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {dependencies.map((dependency, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#0b111b] p-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-semibold">
                    AI Dependency {index + 1}
                  </h3>

                  {dependencies.length > 1 && (
                    <button
                      onClick={() => removeDependency(index)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Application"
                    placeholder="e.g. Customer Support AI"
                    value={dependency.application}
                    onChange={(value) =>
                      updateDependency(index, "application", value)
                    }
                  />

                  <Field
                    label="AI Provider"
                    placeholder="e.g. OpenAI"
                    value={dependency.provider}
                    onChange={(value) =>
                      updateDependency(index, "provider", value)
                    }
                  />

                  <Field
                    label="Model"
                    placeholder="e.g. GPT-5"
                    value={dependency.model}
                    onChange={(value) =>
                      updateDependency(index, "model", value)
                    }
                  />

                  <Field
                    label="Business Process"
                    placeholder="e.g. Customer support"
                    value={dependency.business_process}
                    onChange={(value) =>
                      updateDependency(index, "business_process", value)
                    }
                  />

                  <Field
                    label="Annual Revenue Exposure ($)"
                    placeholder="1000000"
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
                      onChange={(e) =>
                        updateDependency(
                          index,
                          "criticality",
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#111925] px-4 py-3 text-white outline-none focus:border-cyan-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <Field
                    label="Fallback Provider"
                    placeholder="e.g. Anthropic"
                    value={dependency.fallback_provider}
                    onChange={(value) =>
                      updateDependency(index, "fallback_provider", value)
                    }
                  />

                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#111925] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={dependency.fallback_validated}
                        onChange={(e) =>
                          updateDependency(
                            index,
                            "fallback_validated",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 accent-cyan-400"
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

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={addDependency}
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium transition hover:bg-white/5"
            >
              + Add another dependency
            </button>

            <button
              onClick={runScan}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-7 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run Free Risk Scan →"}
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* REPORT */}
      {result && (
        <section id="report" className="mx-auto max-w-7xl px-6 py-20">
          <div>
            <div className="text-sm font-medium text-cyan-400">
              ANALYSIS COMPLETE
            </div>

            <h2 className="mt-3 text-4xl font-bold">
              Your AI Continuity Report
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            <Metric
              label="Continuity Score"
              value={`${result.continuity_score}/100`}
              sublabel={scoreLabel(result.continuity_score)}
            />

            <Metric
              label="Dependencies"
              value={result.total_dependencies}
              sublabel="AI dependencies analyzed"
            />

            <Metric
              label="Critical"
              value={result.critical_dependencies}
              sublabel="High / critical dependencies"
            />

            <Metric
              label="Unvalidated Fallbacks"
              value={result.unvalidated_fallbacks}
              sublabel="Require validation"
            />
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-semibold">Risk Findings</h3>

            {result.findings.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-7 text-gray-300">
                No material findings were detected by the current analysis
                rules.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {result.findings.map((finding, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row">
                      <div>
                        <span className="rounded-full border border-red-400/30 px-3 py-1 text-xs font-semibold text-red-300">
                          {finding.severity}
                        </span>

                        <h4 className="mt-4 text-lg font-semibold">
                          {finding.title}
                        </h4>

                        <p className="mt-2 leading-7 text-gray-400">
                          {finding.explanation}
                        </p>
                      </div>

                      <div className="whitespace-nowrap text-sm text-gray-400">
                        Exposure:{" "}
                        <span className="font-semibold text-white">
                          ${finding.financial_exposure.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-8">
            <h3 className="text-2xl font-bold">
              Want the full continuity assessment?
            </h3>

            <p className="mt-3 max-w-2xl leading-7 text-gray-400">
              The free scan identifies the obvious risks. A full assessment
              maps your production AI stack, business impact, provider
              concentration and fallback readiness in greater depth.
            </p>

            <div className="mt-6 inline-block rounded-lg border border-cyan-400/30 px-5 py-3 text-sm font-medium text-cyan-300">
              Request a Continuity Assessment
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-cyan-400">
              HOW IT WORKS
            </div>

            <h2 className="mt-3 text-4xl font-bold">
              From AI dependency to business resilience.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              ["01", "Inventory", "Map the AI systems your business depends on."],
              ["02", "Quantify", "Connect dependencies to business and financial exposure."],
              ["03", "Assess", "Identify concentration, fallback and continuity risks."],
              ["04", "Prepare", "Build and validate recovery paths before disruption."],
            ].map(([number, title, text]) => (
              <div key={number}>
                <div className="text-cyan-400">{number}</div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-gray-500 md:flex-row">
          <div>© 2026 AI Continuity</div>
          <div>AI Dependency & Business Continuity Intelligence</div>
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
      <label className="mb-2 block text-sm text-gray-300">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#111925] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-cyan-400"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
      <div className="mt-2 text-sm text-gray-500">{sublabel}</div>
    </div>
  );
}