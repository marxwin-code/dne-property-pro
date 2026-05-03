"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSiteText } from "@/lib/i18n/use-site-text";
import { fillTemplate } from "@/lib/i18n/fill-template";
import {
  getUltimateFallbackSrc,
  type PersonalityResultKey,
  PERSONALITY_IMAGE_FALLBACK,
  resolvePersonalityImageSrc
} from "@/lib/personality-images";

type Option = PersonalityResultKey;
type Stage = "landing" | "quiz" | "result";

export default function PersonalityPage() {
  const t = useSiteText();
  const [stage, setStage] = useState<Stage>("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const questions = t.personality.questions;
  const profiles = t.personality.profiles;

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
  const primaryImageSrc = resolvePersonalityImageSrc(resultKey, result.image);
  const [heroSrc, setHeroSrc] = useState(primaryImageSrc);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    setHeroSrc(primaryImageSrc);
    setHeroLoaded(false);
  }, [primaryImageSrc, resultKey]);

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
          type: resultKey
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

  const progressLabel = fillTemplate(t.personality.questionProgress, {
    current: currentQuestion + 1,
    total: questions.length
  });

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#0b0f1a] px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_12px_50px_rgba(59,130,246,0.2)] backdrop-blur sm:p-10">
          {stage === "landing" && (
            <div className="text-center transition-all duration-300">
              <p className="inline-flex rounded-full border border-blue-300/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                {t.personality.landingKicker}
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                {t.personality.landingTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
                {t.personality.landingLead}
              </p>
              <button
                type="button"
                onClick={() => setStage("quiz")}
                className="mt-8 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:opacity-90"
              >
                {t.personality.startTest}
              </button>
            </div>
          )}

          {stage === "quiz" && (
            <div key={currentQuestion} className="transition-all duration-300">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{progressLabel}</span>
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
              <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-white/5 shadow-xl ring-1 ring-white/10">
                {!heroLoaded && (
                  <div
                    className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-slate-700/80 via-slate-800/60 to-slate-900/80 backdrop-blur-[2px]"
                    aria-hidden
                  />
                )}
                <Image
                  key={`${resultKey}-${heroSrc}`}
                  src={heroSrc}
                  alt={result.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 576px"
                  className={`object-cover transition-opacity duration-500 ${
                    heroLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setHeroLoaded(true)}
                  onError={() => {
                    setHeroLoaded(true);
                    setHeroSrc((prev) => {
                      const tier = PERSONALITY_IMAGE_FALLBACK[resultKey];
                      if (prev === tier) return getUltimateFallbackSrc();
                      return tier;
                    });
                  }}
                />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white sm:text-3xl">{result.title}</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {result.description}
              </p>

              <div className="mt-8 rounded-xl border border-blue-300/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-5">
                <p className="text-base font-medium text-blue-100">{t.personality.emailPrompt}</p>
                <div className="mx-auto mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.personality.placeholderEmail}
                    className="w-full rounded-xl border border-white/15 bg-[#0f1629] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSendReport()}
                    disabled={!email || submitState === "loading"}
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitState === "loading" ? t.personality.sending : t.personality.getReport}
                  </button>
                </div>
              </div>

              {submitState === "success" && (
                <p className="mt-4 text-sm text-emerald-300">{t.personality.successEmail}</p>
              )}
              {submitState === "error" && (
                <p className="mt-4 text-sm text-rose-300">{t.personality.errorEmail}</p>
              )}

              <button
                type="button"
                onClick={restartTest}
                className="mt-6 text-sm text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
              >
                {t.personality.retake}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
