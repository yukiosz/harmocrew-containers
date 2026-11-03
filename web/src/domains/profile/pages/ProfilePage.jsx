import React, { useEffect, useState } from "react";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import { useAuth } from "../../../context/AuthContext";
import api, { errorMessage } from "../../../services/api";
import { isMember, splitList } from "../../../utils/formatters";
import ProfileHero from "../components/ProfileHero";
import ProjectList from "../components/ProjectList";

const TEXT_FIELDS = [
  { key: "stageName", label: "Nome artistico" },
  { key: "mainSpecialty", label: "Especialidade principal" },
  { key: "availability", label: "Disponibilidade" },
  { key: "city", label: "Cidade" },
  { key: "instruments", label: "Instrumentos (separe por virgula)" },
  { key: "musicalStyles", label: "Estilos musicais (separe por virgula)" },
];

function toDraft(artist) {
  return {
    stageName: artist.stageName || "",
    mainSpecialty: artist.mainSpecialty || "",
    availability: artist.availability || "",
    city: artist.city || "",
    bio: artist.bio || "",
    instruments: (artist.instruments || []).join(", "),
    musicalStyles: (artist.musicalStyles || []).join(", "),
  };
}

export default function ProfilePage() {
  const { user, artist, setArtist } = useAuth();
  const [draft, setDraft] = useState(null);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!artist) {
      setStatus(user?.artistId ? "loading" : "no-artist");
      return;
    }
    setDraft(toDraft(artist));
    api.projects
      .list()
      .then((list) => setProjects(list.filter((project) => isMember(project, artist.id))))
      .catch(() => setProjects([]))
      .finally(() => setStatus("ready"));
  }, [artist, user]);

  async function handleSave(event) {
    event.preventDefault();
    try {
      const updated = await api.artists.update(artist.id, {
        stageName: draft.stageName.trim(),
        mainSpecialty: draft.mainSpecialty.trim(),
        availability: draft.availability.trim(),
        city: draft.city.trim() || null,
        bio: draft.bio.trim() || null,
        instruments: splitList(draft.instruments),
        musicalStyles: splitList(draft.musicalStyles),
      });
      setArtist(updated);
      setFeedback("Perfil atualizado com sucesso.");
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel salvar o perfil."));
    }
  }

  if (status === "no-artist") {
    return (
      <EmptyState
        title="Conta sem perfil de artista"
        description="Esta conta foi criada sem nome artistico. Crie uma nova conta pelo cadastro para usar o perfil."
      />
    );
  }

  if (status === "loading" || !draft) {
    return <LoadingState title="Carregando seu perfil" description="Buscando seus dados na API." />;
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Perfil"
        title="Sua identidade artistica"
        subtitle="Essas informacoes aparecem para quem avalia suas candidaturas."
      />

      {feedback ? <div className="inline-feedback">{feedback}</div> : null}

      <ProfileHero artist={artist} isCurrentUser />

      <div className="page-grid">
        <section className="content-column">
          <SurfaceCard>
            <SectionHeader
              eyebrow="Editar"
              title="Dados do artista"
              subtitle="Nome artistico, especialidade e disponibilidade sao obrigatorios."
            />
            <form className="page-stack" onSubmit={handleSave}>
              {TEXT_FIELDS.map((field) => (
                <label key={field.key} className="field">
                  <span>{field.label}</span>
                  <input
                    type="text"
                    value={draft[field.key]}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                  />
                </label>
              ))}
              <label className="field">
                <span>Bio</span>
                <textarea
                  rows={5}
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, bio: event.target.value }))
                  }
                />
              </label>
              <button type="submit" className="primary-button">
                Salvar perfil
              </button>
            </form>
          </SurfaceCard>
        </section>

        <aside className="sidebar-column">
          <SurfaceCard>
            <SectionHeader eyebrow="Projetos" title="Projetos que voce integra" />
            <ProjectList
              projects={projects}
              emptyDescription="Publique um projeto em Explorar ou candidate-se em Projetos."
            />
          </SurfaceCard>
        </aside>
      </div>
    </div>
  );
}
