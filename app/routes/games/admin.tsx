import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, Outlet } from "@remix-run/react";

import { getGames } from "~/models/game.server";
import { requireAdminUser } from "~/session.server";

type LoaderData = {
  games: Awaited<ReturnType<typeof getGames>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return json({ games: await getGames() });
};

export default function GameAdmin() {
  const { games } = useLoaderData<LoaderData>();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">Games Admin</h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  to={game.id.toString()}
                  className="text-blue-600 underline"
                >
                  {game.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
