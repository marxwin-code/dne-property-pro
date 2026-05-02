"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Option = "A" | "B" | "C" | "D";
type Stage = "landing" | "quiz" | "result";

type Question = {
  text: string;
  options: { key: Option; label: string }[];
};

type ResultProfile = {
  title: string;
  description: string;
  image: string;
};

const questions: Question[] = [
  {
    text: "When you get unexpected extra income, what do you usually do first?",
    options: [
      { key: "A", label: "Move it into savings or long-term planning." },
      { key: "B", label: "Use part for growth and part for reserves." },
      { key: "C", label: "Spend it on lifestyle upgrades or experiences." },
      { key: "D", label: "Leave it in the account and decide later." }
    ]
  },
  {
    text: "How would you describe your financial decision style?",
    options: [
      { key: "A", label: "Systematic, planned, and risk-controlled." },
      { key: "B", label: "Calculated, flexible, and growth-oriented." },
      { key: "C", label: "Emotion-led and short-term focused." },
      { key: "D", label: "Reactive, depending on current pressure." }
    ]
  },
  {
    text: "How do you normally manage monthly budgeting?",
    options: [
      { key: "A", label: "I run a clear, tracked budget each month." },
      { key: "B", label: "I track trends and adjust as opportunities change." },
      { key: "C", label: "I spend first and review later if needed." },
      { key: "D", label: "I do not follow a stable budget structure." }
    ]
  },
  {
    text: "How do you approach investing or wealth building?",
    options: [
      { key: "A", label: "Steady, low-volatility, and long-term." },
      { key: "B", label: "Strategic, selective, and growth-driven." },
      { key: "C", label: "Only when I feel highly motivated." },
      { key: "D", label: "I have not built a clear approach yet." }
    ]
  },
  {
    text: "When facing a large purchase decision, you usually:",
    options: [
      { key: "A", label: "Evaluate the long-term impact before acting." },
      { key: "B", label: "Compare upside, timing, and opportunity cost." },
      { key: "C", label: "Decide quickly if it feels worth it." },
      { key: "D", label: "Delay until pressure forces a decision." }
    ]
  },
  {
    text: "How do you respond to financial uncertainty?",
    options: [
      { key: "A", label: "Strengthen my plan and reduce unnecessary risk." },
      { key: "B", label: "Reposition quickly to protect and grow." },
      { key: "C", label: "Keep spending habits mostly unchanged." },
      { key: "D", label: "Pause and avoid making clear decisions." }
    ]
  },
  {
    text: "What best describes your relationship with financial goals?",
    options: [
      { key: "A", label: "I define clear milestones and execute consistently." },
      { key: "B", label: "I set dynamic targets based on market opportunities." },
      { key: "C", label: "I prefer flexibility over strict targets." },
      { key: "D", label: "My goals are broad and not regularly reviewed." }
    ]
  },
  {
    text: "How would you describe your current financial trajectory?",
    options: [
      { key: "A", label: "Stable and controlled, with steady progress." },
      { key: "B", label: "Upward with intentional growth moves." },
      { key: "C", label: "Inconsistent, with cycles of progress and pullback." },
      { key: "D", label: "Unclear, with no fixed direction yet." }
    ]
  }
];

const profiles: Record<Option, ResultProfile> = {
  A: {
    title: "You are The Architect",
    description: "You value structure, control, and long-term financial security.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad64e?auto=format&fit=crop&w=900&q=80"
  },
  B: {
    title: "You are The Strategist",
    description: "You think ahead and balance growth with calculated decisions.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80"
  },
  C: {
    title: "You are The Spender",
    description: "You prioritize lifestyle, speed, and immediate outcomes.",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=80"
  },
  D: {
    title: "You are The Drifter",
    description: "You stay adaptable, but your money flow lacks fixed direction.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
  }
};

export default function PersonalityPage() {
  const [stage, setStage] = useState<Stage>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const resultKey = useMemo<Option>(() => {
    const counts: Record<Option, number> = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((ans) => {
      counts[ans] += 1;
    });
    const order: Option[] = ["A", "B", "C", "D"];
    return order.reduce((best, current) =>
      counts[current] > counts[best] ? current : best
    );
  }, [answers]);

  const result = profiles[resultKey];

  const handleAnswer = (option: Option) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = option;
      return next;
    });

    if (currentQuestion === questions.length - 1) {
      setStage("result");
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSendReport = async () => {
    if (!email) return;
    setSubmitState("loading");
    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          type: result.title.replace("You are The ", "").trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send report");
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const restartTest = () => {
    setStage("landing");
    setCurrentQuestion(0);
    setAnswers([]);
    setEmail("");
    setSubmitState("idle");
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#0b0f1a] px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_50px_rgba(59,130,246,0.2)] backdrop-blur sm:p-10">
          {stage === "landing" && (
            <div className="text-center transition-all duration-300">
              <p className="inline-flex rounded-full border border-blue-300/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Personality Test
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Discover Your Financial Personality
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Answer a short diagnostic and get your dominant money behavior profile.
              </p>
              <button
                type="button"
                onClick={() => setStage("quiz")}
                className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:opacity-90"
              >
                Start Test
              </button>
            </div>
          )}

          {stage === "quiz" && (
            <div key={currentQuestion} className="transition-all duration-300">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>
                  Question {currentQuestion + 1}/{questions.length}
                </span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>

              <h2 className="mt-8 text-xl font-semibold leading-8 text-white sm:text-2xl">
                {questions[currentQuestion].text}
              </h2>
              <div className="mt-6 grid gap-3">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={`${currentQuestion}-${option.key}`}
                    type="button"
                    onClick={() => handleAnswer(option.key)}
                    className="rounded-xl border border-white/15 bg-[#0f1629] px-4 py-4 text-left text-sm text-slate-200 transition hover:border-purple-300/50 hover:bg-[#141d33]"
                  >
                    <span className="mr-2 font-semibold">{option.key}.</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === "result" && (
            <div className="text-center transition-all duration-300">
              <Image
                src={result.image}
                alt={result.title}
                width={320}
                height={320}
                className="mx-auto rounded-xl shadow-xl"
              />
              <h3 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">
                {result.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {result.description}
              </p>

              <div className="mt-8 rounded-xl border border-blue-300/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-5">
                <p className="text-base font-medium text-blue-100">
                  Enter your email to receive full report
                </p>
                <div className="mx-auto mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/15 bg-[#0f1629] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendReport()}
                    disabled={!email || submitState === "loading"}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitState === "loading" ? "Sending..." : "Get Full Report"}
                  </button>
                </div>
              </div>

              {submitState === "success" && (
                <p className="mt-4 text-sm text-emerald-300">
                  Your report has been sent to your email.
                </p>
              )}
              {submitState === "error" && (
                <p className="mt-4 text-sm text-rose-300">
                  Failed to send report. Please try again.
                </p>
              )}

              <button
                type="button"
                onClick={restartTest}
                className="mt-6 text-sm text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
              >
                Retake Test
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
