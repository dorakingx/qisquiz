import { Quiz } from "@/components/Quiz";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto mb-10 w-full max-w-3xl text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Practice
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          IBM Qiskit v2.X Developer certification
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Runtime sessions and batches, EstimatorV2 / SamplerV2 and PUBs, OpenQASM
          3 loading in Qiskit — instant feedback after each answer.
        </p>
      </header>

      <main className="mx-auto flex w-full flex-1 flex-col items-stretch justify-start pb-8">
        <Quiz />
      </main>
    </div>
  );
}
