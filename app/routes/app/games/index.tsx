import { useLoaderData, Link } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/server-runtime";
import { getGames } from "~/models/game.server";

type LoaderData = {
  games: Awaited<ReturnType<typeof getGames>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json({ games: await getGames() });
};

export default function GamesIndex() {
  const { games } = useLoaderData<LoaderData>();

  return (
    <>
      <h2>All Games</h2>
      <ul>
        {games.map((game) => (
          <li key={game.id}>
            <Link
              to={`${game.id.toString()}`}
              className="text-blue-600 underline"
            >
              {game.title}
            </Link>
          </li>
        ))}
        <hr />
        <li>
          <Link to="new" className="text-blue-600 underline">
            Create a New Game
          </Link>
        </li>
      </ul>
    </>
  );
}
