export function getBackendUrl() {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("Falta la variable de entorno BACKEND_URL");
  }

  return backendUrl.replace(/\/$/, "");
}
