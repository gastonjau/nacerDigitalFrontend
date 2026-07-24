import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileExplorer from "@/components/ProfileExplorer";
import type { UserProfile } from "@/lib/types";

const initialUser: UserProfile = {
  username: "gastonjau",
  name: "Gaston Jaurena",
  bio: null,
  avatarUrl: "https://avatars.githubusercontent.com/u/132623094?v=4",
  profileUrl: "https://github.com/gastonjau",
  publicRepos: 29,
  followers: 6,
  following: 6,
  publicGists: 0,
  company: null,
  location: null,
  blog: null,
  twitterUsername: null,
  createdAt: "2023-05-04T22:42:31Z",
};

const octocat: UserProfile = {
  ...initialUser,
  username: "octocat",
  name: "The Octocat",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
  profileUrl: "https://github.com/octocat",
  publicRepos: 8,
  followers: 100,
  following: 9,
};

describe("ProfileExplorer", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra el usuario inicial gastonjau", () => {
    render(
      <ProfileExplorer
        initialUsername="gastonjau"
        initialUser={initialUser}
      />,
    );

    expect(screen.getByDisplayValue("gastonjau")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Gaston Jaurena" }),
    ).toBeInTheDocument();
    expect(screen.getByText("@gastonjau")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("busca un nuevo usuario después del debounce", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(octocat), { status: 200 }),
    );

    render(
      <ProfileExplorer
        initialUsername="gastonjau"
        initialUser={initialUser}
      />,
    );

    const input = screen.getByPlaceholderText("Ej: gastonjau");
    await user.clear(input);
    await user.type(input, "octocat");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/user/octocat",
        expect.objectContaining({ cache: "no-store" }),
      );
    });

    expect(
      await screen.findByRole("heading", { name: "The Octocat" }),
    ).toBeInTheDocument();
    expect(screen.getByText("@octocat")).toBeInTheDocument();
  });

  it("muestra un error si la búsqueda falla", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Usuario no encontrado" }), {
        status: 404,
      }),
    );

    render(
      <ProfileExplorer
        initialUsername="gastonjau"
        initialUser={initialUser}
      />,
    );

    const input = screen.getByPlaceholderText("Ej: gastonjau");
    await user.clear(input);
    await user.type(input, "noexiste");

    expect(
      await screen.findByText("Usuario no encontrado"),
    ).toBeInTheDocument();
  });

  it("limpia el perfil si el input queda vacío", async () => {
    const user = userEvent.setup();

    render(
      <ProfileExplorer
        initialUsername="gastonjau"
        initialUser={initialUser}
      />,
    );

    const input = screen.getByPlaceholderText("Ej: gastonjau");
    await user.clear(input);

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Gaston Jaurena" }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText("Escribí un username para ver el perfil."),
    ).toBeInTheDocument();
  });
});
