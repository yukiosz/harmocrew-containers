import React, { useCallback, useEffect, useState } from "react";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import { useAuth } from "../../../context/AuthContext";
import api, { errorMessage } from "../../../services/api";
import { isMember } from "../../../utils/formatters";
import ConversationPanel from "../components/ConversationPanel";

/*
 * Na API Spring as mensagens pertencem a um projeto (chat da equipe).
 * Cada "conversa" desta tela e um projeto do qual o artista faz parte.
 */
export default function MessagesPage() {
  const { user } = useAuth();
  const artistId = user?.artistId;
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [listStatus, setListStatus] = useState("loading");
  const [conversationStatus, setConversationStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  const loadProjects = useCallback(async () => {
    setListStatus("loading");
    setFeedback("");
    try {
      const all = await api.projects.list();
      const mine = all.filter((project) => isMember(project, artistId));
      setProjects(mine);
      setActiveId((current) => current ?? mine[0]?.id ?? null);
      setListStatus("ready");
    } catch (error) {
      setListStatus("error");
      setFeedback(errorMessage(error, "Nao foi possivel carregar seus projetos."));
    }
  }, [artistId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const loadConversation = useCallback(async (projectId) => {
    if (!projectId) {
      return;
    }
    setConversationStatus("loading");
    try {
      setMessages(await api.messages.byProject(projectId));
      setConversationStatus("ready");
    } catch (error) {
      setMessages([]);
      setConversationStatus("error");
      setFeedback(errorMessage(error, "Nao foi possivel carregar a conversa."));
    }
  }, []);

  useEffect(() => {
    loadConversation(activeId);
  }, [activeId, loadConversation]);

  async function handleSendMessage(content) {
    try {
      await api.messages.send(activeId, artistId, content);
      await loadConversation(activeId);
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel enviar a mensagem."));
    }
  }

  const activeProject = projects.find((project) => project.id === activeId) || null;

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Mensagens"
        title="Converse com a equipe de cada projeto"
        subtitle="Cada projeto do qual voce participa tem um canal proprio."
      />

      {feedback ? <div className="inline-feedback">{feedback}</div> : null}

      <div className="messages-layout">
        <SurfaceCard className="messages-sidebar">
          {listStatus === "loading" ? (
            <LoadingState title="Carregando projetos" description="Buscando seus canais." />
          ) : null}

          {listStatus === "error" ? (
            <EmptyState
              title="Sua caixa de entrada nao abriu"
              description={feedback}
              action={
                <button type="button" className="secondary-button" onClick={loadProjects}>
                  Tentar novamente
                </button>
              }
            />
          ) : null}

          {listStatus === "ready" && projects.length === 0 ? (
            <EmptyState
              title="Nenhum canal ainda"
              description="Publique um projeto ou tenha uma candidatura aprovada para conversar."
            />
          ) : null}

          {listStatus === "ready"
            ? projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`contact-row ${project.id === activeId ? "contact-row--active" : ""}`}
                  onClick={() => setActiveId(project.id)}
                >
                  <strong>{project.title}</strong>
                  <span>{project.artists.map((artist) => artist.stageName).join(", ")}</span>
                </button>
              ))
            : null}
        </SurfaceCard>

        <SurfaceCard className="messages-main">
          {conversationStatus === "loading" ? (
            <LoadingState title="Abrindo conversa" description="Recuperando o historico." />
          ) : (
            <ConversationPanel
              activeProject={activeProject}
              messages={messages}
              artistId={artistId}
              onSendMessage={handleSendMessage}
            />
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
