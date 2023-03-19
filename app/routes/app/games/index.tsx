import { PlusCircledIcon } from "@radix-ui/react-icons";
import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import GameList from "~/components/gameList";
import PageHeader from "~/components/header";
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
      <PageHeader>All Games</PageHeader>
      <GameList games={games} />
      <Link to="new" className="float-right text-blue-600">
        <PlusCircledIcon className="relative mr-1 inline" style={{ top: "-2px" }} />
        Create a New Game
      </Link>
    </>
  );
}
