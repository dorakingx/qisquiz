import { TopicSelector } from "@/components/TopicSelector";

export default function TopicsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          Study mode
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Browse topics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Eight exam sections for the IBM Certified Quantum Computation using
          Qiskit v2.X Developer credential. Configure filters and start a
          focused session.
        </p>
      </header>
      <TopicSelector />
    </div>
  );
}
