"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { UserProfile } from "@/lib/types";

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

type ProfileExplorerProps = {
  initialUsername: string;
  initialUser: UserProfile | null;
};

export default function ProfileExplorer({
  initialUsername,
  initialUser,
}: ProfileExplorerProps) {
  const [query, setQuery] = useState(initialUsername);
  const debouncedQuery = useDebouncedValue(query);
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const skipNextFetch = useRef(Boolean(initialUser));

  useEffect(() => {
    const username = debouncedQuery.trim();

    if (!username) {
      setUser(null);
      setError(null);
      setIsFetching(false);
      return;
    }

    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const controller = new AbortController();
    setIsFetching(true);
    setError(null);

    async function loadProfile() {
      try {
        const response = await fetch(
          `/api/user/${encodeURIComponent(username)}`,
          { signal: controller.signal, cache: "no-store" },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ?? `No se pudo obtener el perfil (${response.status})`,
          );
        }

        startTransition(() => {
          setUser(data as UserProfile);
          setError(null);
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setUser(null);
        setError(
          err instanceof Error ? err.message : "Error al buscar el perfil",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [debouncedQuery]);

  const showLoading = isFetching || isPending;
  const stats = user
    ? [
        { label: "Repos", value: user.publicRepos },
        { label: "Followers", value: user.followers },
        { label: "Following", value: user.following },
        { label: "Gists", value: user.publicGists },
      ]
    : [];

  const details = user
    ? [
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
      ].filter((item) => item.value)
    : [];

  return (
    <div className="relative flex min-h-dvh w-full flex-1 flex-col overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#1f3d2f_0%,_transparent_55%),linear-gradient(160deg,#0f1419_0%,#15202b_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
        <label className="block">
          <span className="mb-3 block text-sm tracking-[0.2em] text-muted uppercase">
            Buscar usuario de GitHub
          </span>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5 sm:size-6"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ej: gastonjau"
              autoComplete="off"
              spellCheck={false}
              className="w-full border-b border-accent bg-transparent py-3 pr-24 pl-9 text-2xl text-foreground outline-none placeholder:text-muted/50 sm:pl-10"
            />
            {showLoading ? (
              <span className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-xs tracking-wide text-muted">
                Buscando…
              </span>
            ) : null}
          </div>
        </label>

        <div
          className={`mt-12 transition-opacity duration-300 ${showLoading ? "opacity-55" : "opacity-100"}`}
        >
          {error ? (
            <p className="border-l border-accent/40 pl-4 text-base text-muted">
              {error}
            </p>
          ) : null}

          {!error && !user && !showLoading ? (
            <p className="text-muted">Escribí un username para ver el perfil.</p>
          ) : null}

          {user ? (
            <>
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
                            href={
                              item.href.startsWith("http")
                                ? item.href
                                : `https://${item.href}`
                            }
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
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
