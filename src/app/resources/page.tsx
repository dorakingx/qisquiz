import { ResourceCard } from "@/components/ResourceCard";
import { STUDY_RESOURCES } from "@/data/resources";

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

      <div className="grid gap-4 sm:grid-cols-2">
        {STUDY_RESOURCES.map((resource) => (
          <ResourceCard key={resource.url} resource={resource} />
        ))}
      </div>
    </div>
  );
}
