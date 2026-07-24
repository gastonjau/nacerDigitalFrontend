import { afterEach, describe, expect, it } from "vitest";
import { getBackendUrl } from "@/lib/backend";

describe("getBackendUrl", () => {
  afterEach(() => {
    delete process.env.BACKEND_URL;
  });

  it("devuelve la URL sin barra final", () => {
    process.env.BACKEND_URL = "http://localhost:3024/";
    expect(getBackendUrl()).toBe("http://localhost:3024");
  });

  it("devuelve la URL tal cual si no tiene barra final", () => {
    process.env.BACKEND_URL = "http://localhost:3024";
    expect(getBackendUrl()).toBe("http://localhost:3024");
  });

  it("lanza error si falta BACKEND_URL", () => {
    delete process.env.BACKEND_URL;
    expect(() => getBackendUrl()).toThrow("Falta la variable de entorno BACKEND_URL");
  });
});
