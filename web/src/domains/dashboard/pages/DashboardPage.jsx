import React, { useCallback, useEffect, useState } from "react";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import SectionHeader from "../../../components/ui/SectionHeader";
import StatusPill from "../../../components/ui/StatusPill";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import { useAuth } from "../../../context/AuthContext";
import api, { errorMessage } from "../../../services/api";
import { APPLICATION_STATUS, capitalizeName, formatDate, isMember, isOpen } from "../../../utils/formatters";
import SummaryCard from "../components/SummaryCard";

/*
 * A API nao tem um endpoint de resumo: o painel e montado no frontend a
 * partir de /projects e /applications.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const artistId = user?.artistId;
  const [summary, setSummary] = useState({ received: [], sent: [], openProjects: 0 });
  const [status, setStatus] = useState("loading");
  const [feedback, setFeedback] = useState("");

  const loadSummary = useCallback(async () => {
    setStatus("loading");
    try {
      const [projects, sent] = await Promise.all([
        api.projects.list(),
        artistId ? api.applications.byArtist(artistId) : Promise.resolve([]),
      ]);
      const mine = projects.filter((project) => isMember(project, artistId));
      const receivedLists = await Promise.all(
        mine.map((project) => api.applications.byProject(project.id))
      );
      const received = receivedLists
        .flat()
        .filter((application) => application.artistId !== artistId)
        .sort((a, b) => b.id - a.id);
      setSummary({
        received,
        sent: [...sent].sort((a, b) => b.id - a.id),
        openProjects: projects.filter((project) => isOpen(project) && !isMember(project, artistId))
          .length,
      });
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setFeedback(errorMessage(error, "O resumo do painel nao foi carregado."));
    }
  }, [artistId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  async function handleDecision(application, decision) {
    try {
      await api.applications.updateStatus(application.id, decision);
      if (decision === "APPROVED") {
        // Aprovar a candidatura adiciona o artista a equipe do projeto.
        await api.projects.addArtist(application.projectId, application.artistId);
      }
      await loadSummary();
      setFeedback(
        decision === "APPROVED"
          ? `${application.artistName} agora faz parte de "${application.projectTitle}".`
          : "Candidatura rejeitada."
      );
    } catch (error) {
      setFeedback(errorMessage(error, "Nao foi possivel atualizar a candidatura."));
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Painel"
        title="Visao geral da sua atividade musical"
        subtitle="Candidaturas recebidas nos seus projetos e as que voce enviou."
      />

      {status === "loading" ? (
        <LoadingState title="Montando seu painel" description="Consolidando projetos e candidaturas." />
      ) : null}

      {status === "error" ? (
        <EmptyState
          title="Nao foi possivel abrir o painel"
          description={feedback}
          action={
            <button type="button" className="secondary-button" onClick={loadSummary}>
              Recarregar painel
            </button>
          }
        />
      ) : null}

      {feedback && status !== "error" ? <div className="inline-feedback">{feedback}</div> : null}

      <div className="summary-grid">
        <SummaryCard
          label="Candidaturas recebidas"
          value={summary.received.filter((item) => item.status === "PENDING").length}
          detail="Pendentes de decisao nos seus projetos."
        />
        <SummaryCard
          label="Candidaturas enviadas"
          value={summary.sent.length}
          detail="Projetos aos quais voce se candidatou."
        />
        <SummaryCard
          label="Projetos abertos"
          value={summary.openProjects}
          detail="Projetos ativos em que voce ainda nao esta."
        />
      </div>

      <SurfaceCard>
        <SectionHeader
          eyebrow="Curadoria"
          title="Candidaturas recebidas"
          subtitle="Aprove ou rejeite quem se inscreveu nos seus projetos."
        />
        {summary.received.length ? (
          <div className="card-stack">
            {summary.received.map((application) => {
              const pill = APPLICATION_STATUS[application.status];
              return (
                <div key={application.id} className="approval-card">
                  <div className="approval-copy">
                    <strong>{capitalizeName(application.artistName)}</strong>
                    <span>
                      {application.projectTitle} · {application.specialty}
                    </span>
                    <small>
                      {formatDate(application.createdAt)} — “{application.message}”
                    </small>
                  </div>
                  <div className="approval-actions">
                    <StatusPill tone={pill?.tone}>{pill?.label}</StatusPill>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleDecision(application, "APPROVED")}
                      disabled={application.status !== "PENDING"}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleDecision(application, "REJECTED")}
                      disabled={application.status !== "PENDING"}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma candidatura recebida"
            description="Quando alguem se inscrever em um projeto seu, a aprovacao aparece aqui."
          />
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader
          eyebrow="Enviadas"
          title="Suas candidaturas"
          subtitle="Acompanhe a resposta de cada projeto."
        />
        {summary.sent.length ? (
          <div className="mini-list">
            {summary.sent.map((application) => (
              <div key={application.id} className="list-row-button list-row-button--static">
                <strong>{application.projectTitle}</strong>
                <span>{APPLICATION_STATUS[application.status]?.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sem candidaturas enviadas"
            description="Encontre projetos abertos na aba Projetos."
          />
        )}
      </SurfaceCard>
    </div>
  );
}
