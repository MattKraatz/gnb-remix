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
import { useMemo, useState } from "react";
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
import { getUsers } from "~/models/user.server";

type LoaderData = {
  game?: Game;
  players?: Array<Pick<Player, "id" | "score" | "userId">>;
  users?: Awaited<ReturnType<typeof getUsers>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.id, "Id is required");

  const users = await getUsers();

  if (params.id === "new") {
    return json({ users } as LoaderData);
  } else {
    const game = await getGame(Number(params.id));
    if (!game) {
      throw new Response("Not Found", { status: 404 });
    }
    return json({ game, players: game.players, users } as LoaderData);
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
    return redirect("/app/games");
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
        return {
          score: Number(p.score),
          userId: p.userId,
          id: Number(p.id),
        };
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

  return redirect("/app/games");
};

export default function GameForm() {
  const { game, players, users } = useLoaderData<LoaderData>();
  const errors = useActionData();

  const [newPlayerCount, setNewPlayerCount] = useState<number>(0);

  const isNew = !game;

  const formPlayers = useMemo(() => {
    const newPlayers = [];
    for (let i = 0; i < newPlayerCount; i++) {
      newPlayers.push({
        id: 0,
        score: 0,
        userId: "",
      });
    }

    return [...(players ?? []), ...newPlayers];
  }, [players, newPlayerCount]);

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  return (
    <Form method="post" key={game?.id ?? "new"}>
      <div className="-mx-3 flex flex-wrap">
        <div className="w-full px-3">
          <div className="mb-5">
            <label className="mb-3 block text-base font-medium text-[#07074D]">
              Game Title:{" "}
              {errors?.title ? (
                <em className="text-red-600">{errors.title}</em>
              ) : null}
            </label>
            <input
              type="text"
              name="title"
              className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              defaultValue={game?.title}
            />
          </div>
        </div>
        <div className="w-full px-3">
          <label className="mb-3 block text-base font-medium text-[#07074D]">
            Players:{" "}
            {errors?.title ? (
              <em className="text-red-600">{errors.players}</em>
            ) : null}
          </label>
          {formPlayers?.map((player, i) => (
            <div className="mb-2 flex w-full" key={i}>
              <input
                type="number"
                name={`players[${i}][id]`}
                className="hidden"
                defaultValue={player.id}
              />
              <div className="w-2/3">
                <span className="mr-6 w-1/6">{i + 1}.</span>
                <select
                  name={`players[${i}][userId]`}
                  defaultValue={player.userId}
                  className="w-5/6 rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value=""></option>
                  {users?.map((u) => (
                    <option value={u.id} key={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/3 px-4">
                <input
                  type="number"
                  name={`players[${i}][score]`}
                  className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
                  defaultValue={player.score}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
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
          {isNew ? (isCreating ? "Creating..." : "Save Game") : null}
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
