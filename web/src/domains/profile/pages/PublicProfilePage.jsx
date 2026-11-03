import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import { useAuth } from "../../../context/AuthContext";
import api, { errorMessage } from "../../../services/api";
import { isMember } from "../../../utils/formatters";
import ProfileHero from "../components/ProfileHero";
import ProjectList from "../components/ProjectList";

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState(null);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function load() {
      setStatus("loading");
      const artistId = Number(id);
      const [nextArtist, allProjects] = await Promise.all([
        api.artists.get(artistId),
        api.projects.list(),
      ]);
      setArtist(nextArtist);
      setProjects(allProjects.filter((project) => isMember(project, artistId)));
      setStatus("ready");
    }
    load().catch((error) => {
      setArtist(null);
      setStatus("error");
      setFeedback(errorMessage(error, "Nao foi possivel carregar este perfil."));
    });
  }, [id]);

  if (status === "loading") {
    return <LoadingState title="Carregando perfil" description="Buscando o artista na API." />;
  }

  if (!artist) {
    return <EmptyState title="Perfil nao encontrado" description={feedback} />;
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Perfil publico"
        title="Conheca melhor este talento"
        subtitle="Especialidade, estilos e projetos dos quais o artista participa."
      />
      <ProfileHero artist={artist} isCurrentUser={artist.id === user?.artistId} />
      <SurfaceCard>
        <SectionHeader eyebrow="Projetos" title="Projetos que integra" />
        <ProjectList projects={projects} emptyDescription="Este artista ainda nao integra projetos." />
      </SurfaceCard>
    </div>
  );
}
