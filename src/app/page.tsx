import Image from "next/image";
import type { UserProfile } from "@/lib/types";

const API_URL = "http://localhost:3000/user/octocat";

async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(API_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo obtener el perfil (${response.status})`);
  }

  return response.json();
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-AR").format(value);
}

export default async function Home() {
  const user = await getUserProfile();

  const stats = [
    { label: "Repos", value: user.publicRepos },
    { label: "Followers", value: user.followers },
    { label: "Following", value: user.following },
    { label: "Gists", value: user.publicGists },
  ];

  const details = [
    { label: "Empresa", value: user.company },
    { label: "Ubicación", value: user.location },
    { label: "Blog", value: user.blog, href: user.blog },
    {
      label: "Twitter",
      value: user.twitterUsername ? `@${user.twitterUsername}` : null,
      href: user.twitterUsername
        ? `https://twitter.com/${user.twitterUsername}`
        : null,
    },
    { label: "Desde", value: formatDate(user.createdAt) },
  ].filter((item) => item.value);

  return (
    <div className="relative min-h-full overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1f3d2f_0%,_transparent_55%),linear-gradient(160deg,#0f1419_0%,#15202b_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <p className="mb-8 text-sm tracking-[0.2em] text-muted uppercase">
          Perfil desde API local
        </p>

        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:gap-10">
          <Image
            src={user.avatarUrl}
            alt={`Avatar de ${user.username}`}
            width={160}
            height={160}
            priority
            className="size-36 rounded-full object-cover ring-2 ring-accent/40 sm:size-40"
          />

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
              {user.name ?? user.username}
            </h1>
            <p className="mt-2 text-xl text-accent">@{user.username}</p>
            {user.bio ? (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                {user.bio}
              </p>
            ) : null}
            <a
              href={user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-b border-accent/50 pb-0.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Ver en GitHub
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-line py-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs tracking-[0.16em] text-muted uppercase">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-3xl tracking-tight">
                {formatNumber(stat.value)}
              </dd>
            </div>
          ))}
        </dl>

        {details.length > 0 ? (
          <dl className="mt-10 grid gap-5 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label} className="border-l border-line pl-4">
                <dt className="text-xs tracking-[0.16em] text-muted uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-base">
                  {"href" in item && item.href ? (
                    <a
                      href={item.href.startsWith("http") ? item.href : `https://${item.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </main>
    </div>
  );
}
