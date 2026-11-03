import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { capitalizeName } from "../utils/formatters";

const NAV_ITEMS = [
  { to: "/explorar", label: "Explorar" },
  { to: "/oportunidades", label: "Projetos" },
  { to: "/mensagens", label: "Mensagens" },
  { to: "/painel", label: "Painel" },
  { to: "/perfil", label: "Perfil" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, artist, logout } = useAuth();
  const displayName = artist?.stageName || user?.name;

  return (
    <header className="topbar">
      <button
        type="button"
        className="brand-mark"
        onClick={() => navigate("/explorar")}
      >
        HarmoCrew
      </button>

      <nav className="topbar-nav" aria-label="Navegacao principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `topbar-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-user">
        <div className="topbar-avatar">
          {displayName?.slice(0, 1).toUpperCase() ?? "H"}
        </div>
        <div className="topbar-user-copy">
          <strong>{capitalizeName(displayName) || "HarmoCrew"}</strong>
          <span>{user?.email ?? "comunidade musical"}</span>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
