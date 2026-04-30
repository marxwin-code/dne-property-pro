import Link from "next/link";

const products = [
  {
    name: "CompareMe AI",
    description: "Compare your income and financial position with others.",
    button: "Try Now",
    href: "/compare",
    active: true
  },
  {
    name: "Invoice Extract AI",
    description: "Automatically extract invoice data into Excel.",
    button: "Coming Soon",
    href: "#",
    active: false
  },
  {
    name: "Financial Personality AI",
    description: "Discover your money personality and behavioral patterns.",
    button: "Take Test",
    href: "/personality",
    active: true
  }
];

export default function LabsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          D&amp;E Labs
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          AI tools built to solve real-world problems.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.name}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
            {product.active ? (
              <Link
                href={product.href}
                className="mt-6 inline-flex w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {product.button}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex w-fit cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
              >
                {product.button}
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
