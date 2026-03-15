import { ProjectCard as ProjectCardData } from "@/content/site";

type ProjectCardProps = {
  project: ProjectCardData;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-card__visual" aria-hidden="true">
        <div className="project-visual project-visual--transformer">
          <span className="project-visual__orbit" />
          <span className="project-visual__core" />
          <div className="project-visual__tokens">
            <span>prompt</span>
            <span>decode</span>
            <span>token</span>
            <span>next</span>
          </div>
        </div>
      </div>

      <div className="project-card__body">
        <div className="project-card__meta">
          <span>{project.category}</span>
          <strong>{project.status}</strong>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </div>

      <div className="project-card__actions">
        <a href={project.repoUrl} target="_blank" rel="noreferrer" className="button button--secondary">
          View GitHub
        </a>
      </div>
    </article>
  );
}
