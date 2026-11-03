import React, { useState } from "react";
import { splitList } from "../../../utils/formatters";

const EMPTY = { title: "", description: "", musicalStyle: "", needs: "" };

export default function ProjectComposer({ onSubmit }) {
  const [formData, setFormData] = useState(EMPTY);

  function update(key) {
    return (event) => setFormData((current) => ({ ...current, [key]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.title.trim() || !formData.musicalStyle.trim()) {
      return;
    }
    const ok = await onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      musicalStyle: formData.musicalStyle.trim(),
      needs: splitList(formData.needs),
    });
    if (ok) {
      setFormData(EMPTY);
    }
  }

  return (
    <form className="composer-card" onSubmit={handleSubmit}>
      <label className="field">
        <span>Titulo do projeto</span>
        <input
          type="text"
          value={formData.title}
          onChange={update("title")}
          placeholder="Ex: EP indie pop com cordas"
        />
      </label>
      <label className="field">
        <span>Estilo musical</span>
        <input
          type="text"
          value={formData.musicalStyle}
          onChange={update("musicalStyle")}
          placeholder="Ex: Indie pop"
        />
      </label>
      <label className="field">
        <span>Descricao</span>
        <textarea
          value={formData.description}
          onChange={update("description")}
          placeholder="Explique o som, o momento do projeto e o perfil procurado."
          rows={3}
        />
      </label>
      <label className="field">
        <span>Procura (separe por virgula)</span>
        <input
          type="text"
          value={formData.needs}
          onChange={update("needs")}
          placeholder="Ex: Vocal, Baixo"
        />
      </label>
      <button type="submit" className="primary-button">
        Publicar projeto
      </button>
    </form>
  );
}
