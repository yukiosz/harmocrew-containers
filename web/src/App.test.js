import { render, screen } from "@testing-library/react";
import LoadingState from "./components/ui/LoadingState";
import ProfileHero from "./domains/profile/components/ProfileHero";
import { errorMessage } from "./services/api";
import { formatDate, isMember, splitList } from "./utils/formatters";

test("renders the loading state copy", () => {
  render(<LoadingState title="Carregando harmocrew" description="Preparando o ambiente." />);
  expect(screen.getByText(/carregando harmocrew/i)).toBeInTheDocument();
});

test("renders an ArtistResponse from the Spring API", () => {
  render(
    <ProfileHero
      artist={{
        id: 1,
        stageName: "ana silva",
        mainSpecialty: "Vocal",
        city: "Braganca Paulista",
        availability: "Fins de semana",
        bio: "Cantora de indie pop",
        instruments: ["Violao"],
        musicalStyles: ["Indie"],
      }}
      isCurrentUser
    />
  );
  expect(screen.getByText("Ana silva")).toBeInTheDocument();
  expect(screen.getByText("Vocal · Braganca Paulista · Fins de semana")).toBeInTheDocument();
  expect(screen.getByText("Indie")).toBeInTheDocument();
});

test("reads the ErrorResponse format of the API", () => {
  expect(errorMessage({ response: { data: { message: "Credenciais invalidas" } } }, "x")).toBe(
    "Credenciais invalidas"
  );
  expect(
    errorMessage({ response: { data: { fieldErrors: { title: "nao deve estar em branco" } } } }, "x")
  ).toBe("title: nao deve estar em branco");
  expect(errorMessage({}, "fallback")).toBe("fallback");
});

test("formatters", () => {
  expect(splitList(" Vocal, Baixo ,, ")).toEqual(["Vocal", "Baixo"]);
  expect(formatDate("2026-11-03")).toBe("03/11/2026");
  expect(isMember({ artists: [{ id: 2 }] }, 2)).toBe(true);
  expect(isMember({ artists: [] }, 2)).toBe(false);
});
