import { Link, Outlet } from "@remix-run/react";
import { HomeIcon, BackpackIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";

export default function App() {
  return (
    <div className="mx-auto h-screen max-w-4xl bg-white py-1 px-3">
      <h1 className="my-2 border-b-2 border-blue-200 border-opacity-40 text-center text-3xl font-extrabold tracking-tight">
        <span className="block pt-2 pb-4 uppercase text-blue-500 drop-shadow-md">
          <Link to="/">Game Night Buddy</Link>
        </span>
      </h1>
      <div className="grid grid-cols-4 gap-6">
        <NavigationMenu.Root>
          <NavigationMenu.List className="mt-8 divide-y divide-blue-100 px-4">
            <NavigationMenu.Item>
              <NavigationMenu.Link className="items-middle my-4 block uppercase leading-none text-gray-500" href="/app">
                <HomeIcon aria-hidden className="relative mr-3 inline" style={{ top: "-1px" }} />
                Home
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="items-middle my-4 block uppercase leading-none text-gray-500" href="/app/games">
                <BackpackIcon aria-hidden className="relative mr-3 inline" style={{ top: "-1px" }} />
                Games
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Link className="items-middle my-4 block uppercase leading-none text-gray-500" href="/app/about">
                <InfoCircledIcon aria-hidden className="relative mr-3 inline" style={{ top: "-1px" }} />
                About
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="text-red-500">
      Oh no, something went wrong!<pre>{error.message}</pre>
    </div>
  );
}
