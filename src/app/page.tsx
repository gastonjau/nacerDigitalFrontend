import ProfileExplorer from "@/components/ProfileExplorer";
import { getBackendUrl } from "@/lib/backend";
import type { UserProfile } from "@/lib/types";

const DEFAULT_USERNAME = "gastonjau";

async function getInitialProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetch(
      `${getBackendUrl()}/user/${DEFAULT_USERNAME}`,
      { cache: "no-store" },
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const initialUser = await getInitialProfile();

  return (
    <ProfileExplorer
      initialUsername={DEFAULT_USERNAME}
      initialUser={initialUser}
    />
  );
}
