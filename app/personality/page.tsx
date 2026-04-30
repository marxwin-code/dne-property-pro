import Image from "next/image";
const personalities = [
  {
    name: "Architect",
    description: "You value control, structure, and long-term security.",
    image: "/images/architect.png"
  },
  {
    name: "Strategist",
    description: "You position yourself for growth and calculated opportunity.",
    image: "/images/strategist.png"
  },
  {
    name: "Spender",
    description: "You prioritize lifestyle and immediate experience.",
    image: "/images/spender.png"
  },
  {
    name: "Drifter",
    description: "You move without a fixed financial direction.",
    image: "/images/drifter.png"
  }
] as const;

export default function PersonalityPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#0b0f1a] px-4 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <section className="text-center">
          <p className="inline-flex rounded-full border border-blue-300/20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
            Personality Profiles
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Your Financial Personality
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore your money mindset through four premium personality archetypes.
          </p>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          {personalities.map((item) => (
            <article
              key={item.name}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_50px_rgba(59,130,246,0.18)] backdrop-blur transition hover:border-blue-300/40 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_18px_65px_rgba(79,70,229,0.35)]"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={320}
                height={320}
                className="mx-auto w-full max-w-[320px] rounded-xl shadow-xl"
              />
              <h2 className="mt-6 text-center text-2xl font-semibold text-white">
                {item.name}
              </h2>
              <p className="mt-3 text-center text-sm leading-7 text-slate-300">
                {item.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
