import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getRecentGames } from "~/models/game.server";

type LoaderData = {
  games: Awaited<ReturnType<typeof getRecentGames>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json({ games: await getRecentGames() });
};

export default function GamesIndex() {
  const { games } = useLoaderData<LoaderData>();

  return (
    <>
      <h2>Recent Games</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <Link
              to={`games/${game.id.toString()}`}
              className="text-blue-600 underline"
            >
              {game.title}
            </Link>
          </li>
        ))}
        <hr />
        <li>
          <Link to="games/new" className="text-blue-600 underline">
            Create a New Game
          </Link>
        </li>
      </ul>
    </>
  );
}
