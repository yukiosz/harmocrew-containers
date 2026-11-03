import React from "react";
import EmptyState from "../../../components/ui/EmptyState";
import { PROJECT_STATUS } from "../../../utils/formatters";

export default function ProjectList({ projects, emptyDescription }) {
  if (!projects.length) {
    return <EmptyState title="Sem projetos ainda" description={emptyDescription} />;
  }
  return (
    <div className="card-stack">
      {projects.map((project) => (
        <div key={project.id} className="list-row-button list-row-button--static">
          <strong>{project.title}</strong>
          <span>
            {project.musicalStyle} · {PROJECT_STATUS[project.status]?.label}
          </span>
        </div>
      ))}
    </div>
  );
}
