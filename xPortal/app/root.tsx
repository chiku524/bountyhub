import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { AuthNotice } from "~/components/auth-notice";
import { Nav } from "~/components/nav";
import { json } from "@remix-run/node";
import { getUser } from "~/utils/auth.server";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css?family=Tangerine",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.cdnfonts.com/css/self-deception",
  },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return <AuthNotice />;
    }
    
    return (
      <div className="h-screen w-full bg-neutral-900 flex flex-row">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Oops!</h2>
            <p className="text-gray-300 mb-6 text-center">
              {error.status === 404 
                ? "The page you're looking for doesn't exist."
                : "Something went wrong. Please try again."}
            </p>
            <div className="flex justify-center">
              <a
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-neutral-900 flex flex-row">
      <Nav />
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Unexpected Error</h2>
          <p className="text-gray-300 mb-6 text-center">
            An unexpected error occurred. Please try again later.
          </p>
          <div className="flex justify-center">
            <a
              href="/"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  return json({ user });
}

export default function Root() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Clear any existing storage access errors
      const originalOnError = window.onerror;
      window.onerror = (event) => {
        if (event.toString().includes("access to storage is not allowed")) {
          return true; // Prevent the error from being logged
        }
        return originalOnError ? originalOnError(event) : false;
      };
    }
  }, [isClient, location]);

  return <Outlet context={{ user }} />;
}
