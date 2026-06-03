import type { StudyResource } from "@/data/resources";

type ResourceCardProps = {
  resource: StudyResource;
};

const CATEGORY_STYLES: Record<StudyResource["category"], string> = {
  Official: "bg-blue-950/60 text-blue-300 ring-blue-500/30",
  Community: "bg-violet-950/60 text-violet-300 ring-violet-500/30",
  Practice: "bg-amber-950/60 text-amber-300 ring-amber-500/30",
  Slides: "bg-teal-950/60 text-teal-300 ring-teal-500/30",
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="card flex flex-col">
      <span
        className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${CATEGORY_STYLES[resource.category]}`}
      >
        {resource.category}
      </span>
      <h3 className="mt-3 font-medium text-zinc-100">{resource.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
        {resource.description}
      </p>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:underline"
      >
        Open resource →
      </a>
    </article>
  );
}
