import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import api from "../../../services/api";
import { capitalizeName } from "../../../utils/formatters";
import ProjectCard from "../../projects/components/ProjectCard";
import ProjectComposer from "../../projects/components/ProjectComposer";
import useProjects from "../../projects/useProjects";

export default function ExplorePage() {
  const { artistId, projects, status, feedback, reload, relationOf, applicationFor, createProject, apply } =
    useProjects();
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    api.artists
      .list()
      .then((list) => setArtists(list.filter((artist) => artist.id !== artistId)))
      .catch(() => setArtists([]));
  }, [artistId]);

  const recent = projects.slice(0, 6);
  const openCalls = projects.filter((project) => relationOf(project) === "open").slice(0, 4);

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Explorar"
        title="Descubra talentos e projetos"
        subtitle="Projetos musicais publicados na plataforma e artistas para colaborar."
      />

      <div className="hero-grid">
        <SurfaceCard className="hero-panel hero-panel--feature">
          <span className="section-eyebrow">Publicar</span>
          <h2>Comece um projeto e monte sua equipe.</h2>
          <p>
            Descreva o estilo e quais funcoes o projeto procura. Outros artistas
            podem se candidatar, e voce aprova quem entra pelo Painel.
          </p>
        </SurfaceCard>
        <ProjectComposer onSubmit={createProject} />
      </div>

      {feedback ? (
        <SurfaceCard className="feedback-card">
          <p>{feedback}</p>
        </SurfaceCard>
      ) : null}

      <div className="page-grid">
        <section className="content-column">
          <div className="section-block">
            <SectionHeader
              eyebrow="Feed"
              title="Projetos recentes"
              subtitle="Os ultimos projetos publicados por artistas da comunidade."
            />

            {status === "loading" ? (
              <LoadingState title="Montando seu hub" description="Buscando projetos na API." />
            ) : null}

            {status === "error" ? (
              <EmptyState
                title="Nao foi possivel carregar o feed"
                description={feedback || "Verifique se a API esta disponivel."}
                action={
                  <button type="button" className="secondary-button" onClick={reload}>
                    Tentar novamente
                  </button>
                }
              />
            ) : null}

            {status === "ready" && recent.length === 0 ? (
              <EmptyState
                title="Ainda nao ha projetos publicados"
                description="Use o formulario acima para publicar o primeiro."
              />
            ) : null}

            <div className="card-stack">
              {recent.map((project) => (
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
        </section>

        <aside className="sidebar-column">
          <SurfaceCard>
            <SectionHeader
              eyebrow="Projetos"
              title="Chamadas abertas"
              subtitle="Projetos ativos em que voce ainda nao esta."
            />
            <div className="mini-list">
              {openCalls.length ? (
                openCalls.map((project) => (
                  <Link key={project.id} className="list-row-button" to="/oportunidades">
                    <strong>{project.title}</strong>
                    <span>{project.needs?.join(", ") || project.musicalStyle}</span>
                  </Link>
                ))
              ) : (
                <span>Nenhuma chamada aberta no momento.</span>
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SectionHeader
              eyebrow="Artistas"
              title="Talentos da comunidade"
              subtitle="Perfis cadastrados na plataforma."
            />
            <div className="mini-list">
              {artists.slice(0, 6).map((artist) => (
                <Link key={artist.id} className="list-row-button" to={`/perfil/${artist.id}`}>
                  <strong>{capitalizeName(artist.stageName)}</strong>
                  <span>
                    {artist.mainSpecialty}
                    {artist.city ? ` · ${artist.city}` : ""}
                  </span>
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </aside>
      </div>
    </div>
  );
}
