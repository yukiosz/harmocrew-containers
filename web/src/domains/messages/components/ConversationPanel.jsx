import React, { useState } from "react";
import { formatTime } from "../../../utils/formatters";

export default function ConversationPanel({ activeProject, messages, artistId, onSendMessage }) {
  const [draft, setDraft] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim() || !activeProject) {
      return;
    }
    await onSendMessage(draft.trim());
    setDraft("");
  }

  if (!activeProject) {
    return (
      <div className="conversation-empty">
        <h3>Escolha um projeto</h3>
        <p>Selecione um projeto para ver o historico e enviar uma mensagem para a equipe.</p>
      </div>
    );
  }

  return (
    <div className="conversation-panel">
      <div className="conversation-header">
        <strong>{activeProject.title}</strong>
        <span>{activeProject.musicalStyle}</span>
      </div>

      <div className="message-list">
        {messages.map((message) => {
          const isSelf = message.senderArtistId === artistId;
          return (
            <div
              key={message.id}
              className={`message-bubble ${isSelf ? "message-bubble--self" : ""}`}
            >
              <p>{message.content}</p>
              <span>
                {isSelf ? "Voce" : message.senderArtistName} · {formatTime(message.sentAt)}
              </span>
            </div>
          );
        })}
      </div>

      <form className="conversation-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva uma mensagem"
        />
        <button type="submit" className="primary-button">
          Enviar
        </button>
      </form>
    </div>
  );
}
