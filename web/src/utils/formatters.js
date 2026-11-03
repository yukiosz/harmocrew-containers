export function capitalizeName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
}

export function formatDate(value) {
  if (!value) {
    return "";
  }
  // LocalDate ("2026-11-03") e LocalDateTime ("2026-11-03T13:00:00") do Spring
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

export function formatTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export const PROJECT_STATUS = {
  PLANNING: { label: "Em planejamento", tone: "warning" },
  ACTIVE: { label: "Ativo", tone: "success" },
  PAUSED: { label: "Pausado", tone: "neutral" },
  FINISHED: { label: "Finalizado", tone: "neutral" },
};

export const APPLICATION_STATUS = {
  PENDING: { label: "Pendente", tone: "warning" },
  APPROVED: { label: "Aprovada", tone: "success" },
  REJECTED: { label: "Rejeitada", tone: "danger" },
};

export function isMember(project, artistId) {
  return (project.artists || []).some((artist) => artist.id === artistId);
}

export function isOpen(project) {
  return project.status === "ACTIVE" || project.status === "PLANNING";
}
