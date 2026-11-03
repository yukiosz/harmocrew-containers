import React from "react";
import StatusPill from "../../../components/ui/StatusPill";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import { capitalizeName } from "../../../utils/formatters";

export default function ProfileHero({ artist, isCurrentUser }) {
  const details = [artist.mainSpecialty, artist.city, artist.availability].filter(Boolean);
  const tags = [...(artist.instruments || []), ...(artist.musicalStyles || [])];

  return (
    <SurfaceCard className="profile-hero">
      <div className="profile-hero-main">
        <div className="profile-avatar">{artist.stageName?.slice(0, 1).toUpperCase() ?? "H"}</div>
        <div className="profile-copy">
          <StatusPill tone="accent">{isCurrentUser ? "Seu perfil" : "Talento da comunidade"}</StatusPill>
          <h1>{capitalizeName(artist.stageName)}</h1>
          <p>{details.join(" · ")}</p>
          <p>
            {artist.bio ||
              "Perfil em construcao. Escreva uma bio para destacar sua identidade artistica."}
          </p>
          {tags.length ? (
            <div className="password-grid">
              {tags.map((tag) => (
                <StatusPill key={tag} tone="neutral">
                  {tag}
                </StatusPill>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}
