import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import qs from "qs";

import type { Game, Player } from "~/models/game.server";
import {
  createGame,
  deleteGame,
  getGame,
  updateGame,
} from "~/models/game.server";
import { requireAdminUser } from "~/session.server";
import React from "react";

type LoaderData = {
  game?: Game;
  players?: Array<Pick<Player, "id" | "score" | "userId">>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.id, "Id is required");

  if (params.id === "new") {
    return json({} as LoaderData);
  } else {
    const game = await getGame(Number(params.id));
    if (!game) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({ game, players: game.players } as LoaderData);
  }
};

type FormData = Game & { players: Array<Player>; intent: string };
type ActionData =
  | {
      title: null | string;
    }
  | undefined;
export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.id, "Id is required");

  const requestText = await request.text();
  const formData = qs.parse(requestText) as unknown as FormData; // TODO: oof

  if (formData?.intent === "delete") {
    await deleteGame(Number(params.id));
    return redirect("/games/admin");
  }

  const title = formData.title;
  const errors: ActionData = {
    title: title ? null : "Title is required",
  };
  // TODO: validation for Players
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title must be a string");

  if (params.id !== "new") {
    await updateGame(
      { id: Number(params.id), title },
      formData.players?.map((p) => {
        return { score: Number(p.score), userId: p.userId, id: p.id ?? 0 };
      }) ?? []
    );
  } else {
    await createGame(
      { title },
      formData.players?.map((p) => {
        return { score: Number(p.score), userId: p.userId };
      }) ?? []
    );
  }

  return redirect("/games/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewGame() {
  const { game, players } = useLoaderData<LoaderData>();
  const errors = useActionData();

  const [newPlayerCount, setNewPlayerCount] = useState<number>(0);

  const isNew = !game;

  const formPlayers = players ?? [];
  for (let i = 0; i < newPlayerCount; i++) {
    formPlayers.push({
      id: 0,
      score: 0,
      userId: "",
    });
  }

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  return (
    <Form method="post" key={game?.id ?? "new"}>
      <p>
        <label>
          Game Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={game?.title}
          />
        </label>
      </p>
      <p>
        {players?.map((player, i) => (
          <React.Fragment key={i}>
            <input
              type="select"
              name={`players[${player.id}][id]`}
              className={inputClassName}
              defaultValue={player.id}
            />
            <input
              type="select"
              name={`players[${player.id}][userId]`}
              className={inputClassName}
              defaultValue={player.userId}
            />
            <input
              key={player.id}
              type="number"
              name={`players[${player.id}][score]`}
              className={inputClassName}
              defaultValue={player.score}
            />
          </React.Fragment>
        ))}
      </p>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="rounded bg-yellow-500 py-2 px-4 text-white hover:bg-yellow-600 focus:bg-yellow-400 disabled:bg-yellow-300"
          onClick={() => setNewPlayerCount((state) => state + 1)}
        >
          New Player
        </button>
        {isNew ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Game"}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value={isNew ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNew ? (isCreating ? "Creating..." : "New Game") : null}
          {isNew ? null : isUpdating ? "Updating..." : "Update Game"}
        </button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div>Uh oh! This game with the ID "{params.id}" does not exist!</div>
    );
  }
  throw new Error(`Unsupported thrown response status code ${caught.status}`);
}
