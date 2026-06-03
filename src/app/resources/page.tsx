import { ResourceCard } from "@/components/ResourceCard";
import { STUDY_RESOURCES, type ResourceCategory } from "@/data/resources";

const CATEGORY_ORDER: ResourceCategory[] = [
  "Official IBM / Qiskit resources",
  "Qiskit API documentation",
  "Runtime / Sampler / Estimator references",
  "OpenQASM references",
  "Community tutorials",
  "Practice exams",
  "Slides",
];

export default function ResourcesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          External references
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Resources
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Official documentation and community study materials referenced while
          building Qisquiz. Qisquiz questions are original and not copied from
          these sources.
        </p>
      </header>

      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const resources = STUDY_RESOURCES.filter(
            (resource) => resource.category === category,
          );
          if (resources.length === 0) return null;

          return (
            <section key={category}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-100">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {resources.map((resource) => (
                  <ResourceCard key={resource.url} resource={resource} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
