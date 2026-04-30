"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Axis = "structured" | "growth" | "impulsive" | "unstructured";
type Choice = "A" | "B";
type Stage = "landing" | "questions" | "result";

type Question = {
  prompt: string;
  optionA: string;
  optionB: string;
  scoreA: Axis;
  scoreB: Axis;
};

type ArchetypeKey = "Architect" | "Strategist" | "Spender" | "Drifter";

type ArchetypeProfile = {
  title: ArchetypeKey;
  summary: string;
  deepDescription: string;
  operation: string;
  strengths: string[];
  weaknesses: string[];
  image: string;
};

const questions: Question[] = [
  {
    prompt: "When you receive extra income, what is your first instinct?",
    optionA: "Allocate it into savings or investments with a clear plan.",
    optionB: "Use it to improve your lifestyle right away.",
    scoreA: "structured",
    scoreB: "impulsive"
  },
  {
    prompt: "How do you typically make major financial decisions?",
    optionA: "After analyzing options, risk, and long-term impact.",
    optionB: "Based on how I feel in the moment.",
    scoreA: "growth",
    scoreB: "impulsive"
  },
  {
    prompt: "How do you track your money month to month?",
    optionA: "With a system and regular review.",
    optionB: "I mostly wing it and react as things happen.",
    scoreA: "structured",
    scoreB: "unstructured"
  },
  {
    prompt: "What best describes your relationship with financial goals?",
    optionA: "I set milestones and refine them over time.",
    optionB: "I have ideas, but they are rarely written or tracked.",
    scoreA: "growth",
    scoreB: "unstructured"
  },
  {
    prompt: "When markets or income become unstable, you usually:",
    optionA: "Adjust strategy quickly and protect downside risk.",
    optionB: "Delay decisions and hope things improve.",
    scoreA: "growth",
    scoreB: "unstructured"
  },
  {
    prompt: "How do you evaluate spending on big purchases?",
    optionA: "I compare opportunity cost with future goals.",
    optionB: "If I want it now, I find a way to buy it.",
    scoreA: "structured",
    scoreB: "impulsive"
  },
  {
    prompt: "Your view on financial progress is mostly:",
    optionA: "Compounding systems create freedom over time.",
    optionB: "Money is for living now, not planning deeply.",
    scoreA: "growth",
    scoreB: "impulsive"
  },
  {
    prompt: "Which statement feels more natural to you?",
    optionA: "I prefer a clear roadmap and measurable execution.",
    optionB: "I avoid rigid plans and go with the flow.",
    scoreA: "structured",
    scoreB: "unstructured"
  }
];

const profiles: Record<ArchetypeKey, ArchetypeProfile> = {
  Architect: {
    title: "Architect",
    summary: "You value control, structure, and long-term security.",
    deepDescription:
      "You are methodical with money and psychologically anchored in stability. You trust systems over impulse, and you naturally build environments where risk is measured, not guessed. Your challenge is not discipline - it is knowing when to move faster on high-quality opportunities.",
    operation:
      "You operate through structure first and emotion second. You create predictability through routines, and you prefer decisions backed by clear evidence rather than momentum.",
    strengths: [
      "Strong consistency in planning and execution",
      "High resilience during uncertainty and market volatility",
      "Excellent long-term wealth preservation instincts"
    ],
    weaknesses: [
      "Can miss asymmetric upside by over-optimizing for safety",
      "May delay decisions while searching for perfect certainty",
      "Can become rigid when strategy needs to evolve"
    ],
    image: "/images/architect.png"
  },
  Strategist: {
    title: "Strategist",
    summary: "You position yourself for growth and calculated opportunity.",
    deepDescription:
      "You combine ambition with analysis, which gives you a rare edge. You are wired to spot leverage points, sequence your next moves, and convert insight into momentum. Your biggest risk is strategic drift - high intelligence without tight execution discipline over time.",
    operation:
      "You operate by balancing growth potential with measured risk. You naturally think in scenarios, make adaptive decisions, and optimize for trajectory rather than short-term comfort.",
    strengths: [
      "Strong pattern recognition and opportunity selection",
      "Comfortable making calculated, high-impact decisions",
      "Adaptive thinking under changing market conditions"
    ],
    weaknesses: [
      "Can overcomplicate choices and slow implementation",
      "May start strong but lose rhythm without accountability",
      "Can underestimate the value of boring, repeatable systems"
    ],
    image: "/images/strategist.png"
  },
  Spender: {
    title: "Spender",
    summary: "You prioritize lifestyle and immediate experience.",
    deepDescription:
      "You are energized by present-moment living and emotional rewards, which makes money feel like a tool for expression and freedom. You can generate income and momentum quickly, but capital retention often lags behind your earning capacity. Your breakthrough comes when excitement is paired with intentional structure.",
    operation:
      "You operate on immediate relevance and visible payoff. Decisions are often emotion-led, with strategy added later instead of driving the first move.",
    strengths: [
      "Action-oriented and decisive under pressure",
      "Comfortable investing in growth opportunities quickly",
      "High personal drive and motivation"
    ],
    weaknesses: [
      "Inconsistent saving and delayed compounding effects",
      "Higher likelihood of reactive spending patterns",
      "Long-term planning often deprioritized"
    ],
    image: "/images/spender.png"
  },
  Drifter: {
    title: "Drifter",
    summary: "You move without a fixed financial direction.",
    deepDescription:
      "You are not incapable - you are under-structured. Financial choices are often postponed, fragmented, or delegated to future you, which creates silent drift over years. Your potential unlocks quickly once clarity, ownership, and a sequence of simple commitments are put in place.",
    operation:
      "You operate reactively, adapting to whatever is urgent. Without a defined framework, decisions default to convenience and short-term pressure rather than intentional design.",
    strengths: [
      "Flexible and adaptable to changing situations",
      "Open-minded and willing to revise assumptions",
      "Can progress quickly once structure is introduced"
    ],
    weaknesses: [
      "Lack of clear direction leads to stalled compounding",
      "Difficulty prioritizing long-term over short-term noise",
      "Progress becomes inconsistent without a concrete system"
    ],
    image: "/images/drifter.png"
  }
};

function determineArchetype(scores: Record<Axis, number>): ArchetypeKey {
  if (scores.structured >= 5) return "Architect";
  if (scores.growth >= 4 && scores.growth >= scores.impulsive) return "Strategist";
  if (scores.impulsive >= scores.unstructured) return "Spender";
  return "Drifter";
}

export default function PersonalityPage() {
  const [stage, setStage] = useState<Stage>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<Axis, number>>({
    structured: 0,
    growth: 0,
    impulsive: 0,
    unstructured: 0
  });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const archetype = useMemo(() => profiles[determineArchetype(scores)], [scores]);

  const handleAnswer = (choice: Choice) => {
    const q = questions[currentQuestion];
    const axis = choice === "A" ? q.scoreA : q.scoreB;
    setScores((prev) => ({ ...prev, [axis]: prev[axis] + 1 }));

    if (currentQuestion + 1 >= questions.length) {
      setStage("result");
      return;
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  const restartTest = () => {
    setStage("landing");
    setCurrentQuestion(0);
    setScores({ structured: 0, growth: 0, impulsive: 0, unstructured: 0 });
    setEmail("");
    setSent(false);
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#0b0f1a] px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-3xl">
        {stage === "landing" && (
          <section className="animate-[fadeIn_.35s_ease] text-center">
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
              <p className="inline-flex rounded-full border border-blue-300/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                Premium Assessment
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                What&apos;s Your Financial Personality?
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Discover how you think, behave and make decisions with money.
              </p>
              <button
                type="button"
                onClick={() => setStage("questions")}
                className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition hover:opacity-90"
              >
                Start Test
              </button>
            </div>
          </section>
        )}

        {stage === "questions" && (
          <section className="animate-[fadeIn_.3s_ease] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
            <div className="mb-7">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  Question {currentQuestion + 1} / {questions.length}
                </span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="text-center text-2xl font-semibold leading-tight sm:text-3xl">
              {questions[currentQuestion].prompt}
            </h2>
            <div className="mt-8 grid gap-4">
              <button
                type="button"
                onClick={() => handleAnswer("A")}
                className="rounded-2xl border border-white/15 bg-[#12192b] px-6 py-5 text-left text-base leading-7 text-slate-100 transition hover:border-blue-400/60 hover:bg-[#16223b]"
              >
                {questions[currentQuestion].optionA}
              </button>
              <button
                type="button"
                onClick={() => handleAnswer("B")}
                className="rounded-2xl border border-white/15 bg-[#12192b] px-6 py-5 text-left text-base leading-7 text-slate-100 transition hover:border-purple-400/60 hover:bg-[#1d1c3b]"
              >
                {questions[currentQuestion].optionB}
              </button>
            </div>
          </section>
        )}

        {stage === "result" && (
          <section className="animate-[fadeIn_.35s_ease] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-12">
            <div className="text-center">
              <Image
                src={archetype.image}
                alt={archetype.title}
                width={320}
                height={320}
                className="mx-auto rounded-xl shadow-xl"
              />
              <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
                You are The {archetype.title}
              </h2>
              <p className="mt-3 text-base text-blue-200">{archetype.summary}</p>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {archetype.deepDescription}
              </p>
            </div>

            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white">How you operate</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                  {archetype.operation}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/5 p-5">
                  <h4 className="text-base font-semibold text-emerald-200">Strengths</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {archetype.strengths.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-amber-300/20 bg-amber-500/5 p-5">
                  <h4 className="text-base font-semibold text-amber-200">Weaknesses</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {archetype.weaknesses.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-300/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-5">
                <p className="text-sm font-medium leading-7 text-slate-100 sm:text-base">
                  Most people with your profile never reach the top tier because they
                  lack a clear execution strategy.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#12192b] p-6 text-center">
                <h3 className="text-xl font-semibold text-white">
                  Your full strategy report is ready
                </h3>
                <div className="mx-auto mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-white/15 bg-[#0f1629] px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSent(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/50 transition hover:opacity-90"
                  >
                    Send My Report
                  </button>
                </div>
                {sent && (
                  <p className="mt-3 text-xs text-blue-200">
                    Report request received. Check your inbox shortly.
                  </p>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={restartTest}
                  className="text-sm text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                >
                  Retake assessment
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
