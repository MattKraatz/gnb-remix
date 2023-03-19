import { Link } from "@remix-run/react";
import type { GameWithPlayers } from "~/models/game.server";

export default function GameList({ games }: { games: GameWithPlayers[] }) {
  return (
    <table className="mb-2 w-full table-auto border-collapse border border-slate-400">
      <thead className="border border-slate-300">
        <tr className="bg-slate-100 text-left">
          <th className="py-1 px-2">Date</th>
          <th className="py-1 px-2">Title</th>
          <th className="py-1 px-2">Players</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) => (
          <tr key={game.id} className="border border-slate-300">
            <td className="py-1 px-2">
              <Link to={`/app/games/${game.id.toString()}`} className="text-blue-600 underline">
                {new Date(game.createdAt).toLocaleDateString()}
              </Link>
            </td>
            <td className="py-1 px-2">{game.title}</td>
            <td className="py-1 px-2">{game.players.length} Players</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
