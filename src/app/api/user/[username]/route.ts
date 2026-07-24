import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend";

type RouteContext = {
  params: Promise<{ username: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { username } = await context.params;
  const trimmed = username?.trim();

  if (!trimmed) {
    return NextResponse.json(
      { message: "El username es obligatorio" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${getBackendUrl()}/user/${encodeURIComponent(trimmed)}`,
      { cache: "no-store" },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        data ?? { message: "No se pudo obtener el perfil" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el backend" },
      { status: 502 },
    );
  }
}
