import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, Outlet } from "@remix-run/react";

import { getGames } from "~/models/game.server";

type LoaderData = {
  games: Awaited<ReturnType<typeof getGames>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json({ games: await getGames() });
};

export default function App() {
  const { games } = useLoaderData<LoaderData>();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">
        <Link to="/">Game Night Buddy</Link>
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            <li>
              <Link to={"/app"} className="text-blue-600 underline">
                Home
              </Link>
            </li>
            <li>
              <Link to={"/app/games"} className="text-blue-600 underline">
                Games
              </Link>
            </li>
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="text-red-500">
      Oh no, something went wrong!<pre>{error.message}</pre>
    </div>
  );
}
