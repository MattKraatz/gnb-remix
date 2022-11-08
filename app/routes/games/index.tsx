import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getGames } from "~/models/game.server";
import { useOptionalAdminUser } from "~/utils";

type LoaderData = {
  games: Awaited<ReturnType<typeof getGames>>;
};

export const loader = async () => {
  const games = await getGames();
  return json<LoaderData>({
    games,
  });
};

export default function Games() {
  const { games } = useLoaderData<LoaderData>();

  const adminUser = useOptionalAdminUser();

  return (
    <main>
      <h1>Games</h1>
      {adminUser ? (
        <Link to="admin" className="text-red-600 underline">
          Admin
        </Link>
      ) : null}

      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <Link
              to={game.id.toString()}
              prefetch="intent"
              className="text-blue-600 underline"
            >
              {game.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
