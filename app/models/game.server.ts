import { prisma } from "~/db.server";

import type { Game, Player } from "@prisma/client";
export type { Game, Player };

export async function getGames() {
  return prisma.game.findMany({
    include: gameIncludes,
  });
}

export async function getGame(id: number) {
  return prisma.game.findUnique({
    where: { id },
    include: gameIncludes,
  });
}

const gameIncludes = {
  players: {
    include: {
      user: true,
    },
  },
};

export async function createGame(
  game: Pick<Game, "title">,
  players: Array<Pick<Player, "score" | "userId">>
) {
  return prisma.game.create({
    data: {
      title: game.title,
      players: {
        create: players,
      },
    },
    include: gameIncludes,
  });
}

export async function updateGame(
  game: Pick<Game, "id" | "title">,
  players: Array<Pick<Player, "id" | "score" | "userId">>
) {
  var dbGame = await prisma.game.update({
    data: {
      title: game.title,
      updatedAt: new Date(),
      players: {
        deleteMany: {
          id: {
            notIn: players?.filter((p) => p.id).map((p) => p.id),
          },
        },
        create: players
          ?.filter((p) => p.id === 0) // new players
          .map((p) => {
            return { ...p, id: undefined };
          }),
      },
    },
    where: { id: game.id },
    include: gameIncludes,
  });

  players
    ?.filter((p) => {
      if (p.id) {
        const dbPlayer = dbGame.players.find((dbp) => dbp.id == p.id);
        if (dbPlayer && dbPlayer.score !== p.score) {
          return true; // requires an update
        }
      }
      return false;
    }) // updating Players (there has to be a better way?)
    .forEach(async (updatingPlayer) => {
      const dbPlayer = await prisma.player.update({
        data: {
          ...updatingPlayer,
          gameId: dbGame.id,
        },
        where: {
          id: updatingPlayer.id,
        },
        include: {
          user: true,
        },
      });
      dbGame.players.push(dbPlayer);
    });

  return dbGame;
}

export async function deleteGame(id: Game["id"]) {
  return prisma.game.delete({ where: { id } });
}
