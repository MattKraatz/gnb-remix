import { PlusCircledIcon } from "@radix-ui/react-icons";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import GameList from "~/components/gameList";
import PageHeader from "~/components/header";
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
      <PageHeader>Recent Games</PageHeader>
      <GameList games={games} />
      <Link to="games/new" className="float-right text-blue-600">
        <PlusCircledIcon className="relative mr-1 inline" style={{ top: "-2px" }} />
        Create a New Game
      </Link>
    </>
  );
}
