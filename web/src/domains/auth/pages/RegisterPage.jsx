import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api, { errorMessage } from "../../../services/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6; // mesma regra do RegisterRequest da API

const FIELDS = [
  { key: "name", label: "Nome completo", type: "text", placeholder: "Seu nome" },
  { key: "stageName", label: "Nome artistico", type: "text", placeholder: "Como voce assina suas musicas" },
  { key: "mainSpecialty", label: "Especialidade principal", type: "text", placeholder: "Ex: Guitarrista, Produtora, Vocal" },
  { key: "email", label: "Email", type: "email", placeholder: "voce@harmocrew.com" },
  { key: "password", label: "Senha", type: "password", placeholder: `Minimo de ${MIN_PASSWORD} caracteres` },
  { key: "confirmPassword", label: "Confirmar senha", type: "password", placeholder: "Repita a senha" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    stageName: "",
    mainSpecialty: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.stageName.trim() || !formData.mainSpecialty.trim()) {
      setError("Preencha nome, nome artistico e especialidade.");
      return;
    }
    if (!EMAIL_REGEX.test(formData.email)) {
      setError("Informe um email valido.");
      return;
    }
    if (formData.password.length < MIN_PASSWORD) {
      setError(`A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas precisam coincidir.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      // Com stageName e mainSpecialty a API ja cria o perfil de artista.
      const authResponse = await api.auth.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        stageName: formData.stageName.trim(),
        mainSpecialty: formData.mainSpecialty.trim(),
      });
      login(authResponse);
      navigate("/perfil");
    } catch (requestError) {
      setError(errorMessage(requestError, "Nao foi possivel criar sua conta."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell auth-shell--register">
      <div className="auth-hero">
        <span className="hero-kicker">Perfil artistico + projetos</span>
        <h1>Monte sua presenca artistica e encontre projetos certos.</h1>
        <p>
          Crie seu perfil de artista, publique projetos musicais, receba
          candidaturas e converse com a equipe de cada projeto.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-copy">
          <span className="section-eyebrow">Criar conta</span>
          <h2>Entre com uma identidade pronta para colaborar</h2>
        </div>

        {FIELDS.map((field) => (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            <input
              type={field.type}
              value={formData[field.key]}
              onChange={(event) =>
                setFormData((current) => ({ ...current, [field.key]: event.target.value }))
              }
              placeholder={field.placeholder}
            />
          </label>
        ))}

        <div className="password-grid">
          <span
            className={`status-pill status-pill--${
              formData.password.length >= MIN_PASSWORD ? "success" : "neutral"
            }`}
          >
            {MIN_PASSWORD}+ caracteres
          </span>
          <span
            className={`status-pill status-pill--${
              formData.password && formData.password === formData.confirmPassword
                ? "success"
                : "neutral"
            }`}
          >
            Senhas iguais
          </span>
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar conta"}
        </button>

        <p className="auth-footnote">
          Ja tem cadastro? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </section>
  );
}
