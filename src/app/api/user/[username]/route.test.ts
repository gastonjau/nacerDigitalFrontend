import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/user/[username]/route";

const mockProfile = {
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

describe("GET /api/user/[username]", () => {
  beforeEach(() => {
    process.env.BACKEND_URL = "http://localhost:3024";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.BACKEND_URL;
  });

  it("responde 400 si el username está vacío", async () => {
    const response = await GET(new Request("http://localhost/api/user/%20"), {
      params: Promise.resolve({ username: "   " }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "El username es obligatorio",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("proxyea el perfil del backend", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockProfile), { status: 200 }),
    );

    const response = await GET(new Request("http://localhost/api/user/gastonjau"), {
      params: Promise.resolve({ username: "gastonjau" }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3024/user/gastonjau",
      { cache: "no-store" },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(mockProfile);
  });

  it("propaga errores del backend", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }),
    );

    const response = await GET(new Request("http://localhost/api/user/nope"), {
      params: Promise.resolve({ username: "nope" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: "Not Found" });
  });

  it("responde 502 si no puede conectar con el backend", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ECONNREFUSED"));

    const response = await GET(new Request("http://localhost/api/user/gastonjau"), {
      params: Promise.resolve({ username: "gastonjau" }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: "No se pudo conectar con el backend",
    });
  });
});
