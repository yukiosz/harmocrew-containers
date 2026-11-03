import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { errorMessage } from "../../services/api";
import { isMember, isOpen, todayIso } from "../../utils/formatters";

/*
 * Carrega projetos e as candidaturas do artista logado, e expoe as acoes
 * de criar projeto e candidatar-se. Usado por Explorar e Projetos.
 */
export default function useProjects() {
  const { user, artist } = useAuth();
  const artistId = user?.artistId;
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [nextProjects, nextApplications] = await Promise.all([
        api.projects.list(),
        artistId ? api.applications.byArtist(artistId) : Promise.resolve([]),
      ]);
      setProjects([...nextProjects].sort((a, b) => b.id - a.id));
      setMyApplications(nextApplications);
      setStatus("ready");
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel carregar os projetos."));
      setStatus("error");
    }
  }, [artistId]);

  useEffect(() => {
    load();
  }, [load]);

  function relationOf(project) {
    if (isMember(project, artistId)) {
      return "member";
    }
    if (myApplications.some((application) => application.projectId === project.id)) {
      return "applied";
    }
    return isOpen(project) ? "open" : "closed";
  }

  function applicationFor(project) {
    return myApplications.find((application) => application.projectId === project.id);
  }

  async function createProject(payload) {
    if (!artistId) {
      setFeedback("Sua conta nao tem perfil de artista vinculado.");
      return false;
    }
    try {
      const created = await api.projects.create({
        ...payload,
        status: "ACTIVE",
        startDate: todayIso(),
      });
      // Quem cria o projeto entra como primeiro integrante.
      await api.projects.addArtist(created.id, artistId);
      await load();
      setFeedback("Projeto publicado com sucesso.");
      return true;
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel publicar o projeto."));
      return false;
    }
  }

  async function apply(project, message) {
    if (!artistId) {
      setFeedback("Sua conta nao tem perfil de artista vinculado.");
      return false;
    }
    try {
      await api.applications.create(project.id, {
        artistId,
        message,
        specialty: artist?.mainSpecialty || "Artista",
        availability: artist?.availability || "A combinar",
      });
      await load();
      setFeedback(`Candidatura enviada para "${project.title}".`);
      return true;
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel enviar a candidatura."));
      return false;
    }
  }

  return {
    artistId,
    projects,
    status,
    feedback,
    reload: load,
    relationOf,
    applicationFor,
    createProject,
    apply,
  };
}
