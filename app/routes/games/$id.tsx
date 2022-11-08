import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Game } from "~/models/game.server";
import { getGame } from "~/models/game.server";

type LoaderData = { game: Game };

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, `params.id is required and must be a number`);
  const game = await getGame(Number(params.id));

  invariant(game, `Game not found: ${params.id}`);

  return json<LoaderData>({ game });
};

export default function GameSlug() {
  const { game } = useLoaderData<LoaderData>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{game.title}</h1>
      {/* Show Players and Scores */}
    </main>
  );
}
