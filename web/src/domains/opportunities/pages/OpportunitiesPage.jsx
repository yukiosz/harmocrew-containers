import React, { useState } from "react";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import ProjectCard from "../../projects/components/ProjectCard";
import useProjects from "../../projects/useProjects";

const FILTERS = [
  { key: "open", label: "Abertos para mim" },
  { key: "applied", label: "Minhas candidaturas" },
  { key: "member", label: "Meus projetos" },
  { key: "all", label: "Todos" },
];

export default function OpportunitiesPage() {
  const { projects, status, feedback, reload, relationOf, applicationFor, apply } = useProjects();
  const [filter, setFilter] = useState("open");

  const visible =
    filter === "all" ? projects : projects.filter((project) => relationOf(project) === filter);

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Projetos"
        title="Projetos musicais em andamento"
        subtitle="Candidate-se aos projetos abertos e acompanhe os que voce ja participa."
      />

      <div className="password-grid">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === filter ? "primary-button" : "ghost-button"}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {feedback ? <div className="inline-feedback">{feedback}</div> : null}

      {status === "loading" ? (
        <LoadingState title="Buscando projetos" description="Consultando a API." />
      ) : null}

      {status === "error" ? (
        <EmptyState
          title="Falha ao carregar projetos"
          description={feedback || "Revise a API ou tente novamente em instantes."}
          action={
            <button type="button" className="secondary-button" onClick={reload}>
              Recarregar
            </button>
          }
        />
      ) : null}

      {status === "ready" && visible.length === 0 ? (
        <EmptyState
          title="Nenhum projeto nesta lista"
          description="Troque o filtro ou publique um projeto em Explorar."
        />
      ) : null}

      <div className="card-stack">
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            relation={relationOf(project)}
            application={applicationFor(project)}
            onApply={apply}
          />
        ))}
      </div>
    </div>
  );
}
