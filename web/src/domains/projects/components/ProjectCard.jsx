import React, { useState } from "react";
import { Link } from "react-router-dom";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import StatusPill from "../../../components/ui/StatusPill";
import { APPLICATION_STATUS, PROJECT_STATUS, formatDate } from "../../../utils/formatters";

/*
 * Card de projeto musical (MusicalProjectResponse).
 * relation: "member" | "applied" | "open" | "closed"
 */
export default function ProjectCard({ project, relation, application, onApply }) {
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState("");
  const status = PROJECT_STATUS[project.status] || { label: project.status, tone: "neutral" };

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    const ok = await onApply(project, message.trim());
    if (ok) {
      setIsApplying(false);
      setMessage("");
    }
  }

  return (
    <SurfaceCard className="feed-card">
      <div className="feed-card-top">
        <div>
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
          <h3>{project.title}</h3>
        </div>
        <span>{project.musicalStyle}</span>
      </div>

      {project.description ? <p>{project.description}</p> : null}

      {project.needs?.length ? (
        <div className="password-grid">
          {project.needs.map((need) => (
            <StatusPill key={need} tone="accent">
              Procura: {need}
            </StatusPill>
          ))}
        </div>
      ) : null}

      <p>
        Equipe:{" "}
        {project.artists?.length
          ? project.artists.map((artist, index) => (
              <React.Fragment key={artist.id}>
                {index > 0 ? ", " : ""}
                <Link to={`/perfil/${artist.id}`}>{artist.stageName}</Link>
              </React.Fragment>
            ))
          : "sem integrantes ainda"}
      </p>

      {isApplying ? (
        <form className="conversation-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Conte por que voce quer entrar neste projeto"
          />
          <button type="submit" className="primary-button">
            Enviar
          </button>
        </form>
      ) : null}

      <div className="feed-card-footer">
        <span>Inicio: {formatDate(project.startDate)}</span>
        {relation === "member" ? <StatusPill tone="success">Voce faz parte</StatusPill> : null}
        {relation === "applied" && application ? (
          <StatusPill tone={APPLICATION_STATUS[application.status]?.tone}>
            Candidatura {APPLICATION_STATUS[application.status]?.label.toLowerCase()}
          </StatusPill>
        ) : null}
        {relation === "open" && onApply && !isApplying ? (
          <button type="button" className="secondary-button" onClick={() => setIsApplying(true)}>
            Candidatar-se
          </button>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
