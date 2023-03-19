import { prisma } from "~/db.server";

import type { Game, Player } from "@prisma/client";

type GameWithPlayers = StringifyDates<Game> & {
  players: Array<StringifyDates<Player>>;
};

type StringifyDates<T> = {
  [k in keyof T]: T[k] extends Date ? string : T[k];
};

export type { Game, Player, GameWithPlayers };

export async function getGames() {
  return prisma.game.findMany({
    include: gameIncludes,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRecentGames() {
  return prisma.game.findMany({
    take: 5,
    include: gameIncludes,
    orderBy: {
      createdAt: "desc",
    },
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

export async function createGame(game: Pick<Game, "title">) {
  return prisma.game.create({
    data: {
      title: game.title,
    },
    include: gameIncludes,
  });
}

export async function createPlayer(gameId: number) {
  return prisma.player.create({
    data: {
      gameId: gameId,
    },
  });
}

export async function deletePlayer(playerId: number) {
  return prisma.player.delete({
    where: {
      id: playerId,
    },
  });
}

export async function updateGame(game: Pick<Game, "id" | "title">, players: Array<Pick<Player, "id" | "score" | "userId">>) {
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
