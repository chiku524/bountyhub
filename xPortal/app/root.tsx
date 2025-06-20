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
import { useEffect } from "react";
import { Nav } from "~/components/nav";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUser } from "~/utils/auth.server";
import { WalletProvider } from './components/WalletProvider';
import { createDb } from "~/utils/db.server";

import "./tailwind.css";
import "./styles/wallet-adapter.css";

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
  // Favicon configuration - portal.ask logo
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/logo.png" },
  { rel: "shortcut icon", href: "/favicon.svg" },
];

export function ErrorBoundary() {
  const error = useRouteError();
  
  // Determine error type and message
  let errorTitle = "Something went wrong";
  let errorMessage = "An unexpected error occurred. Please try again later.";
  let errorStatus = 500;
  let is404 = false;
  
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    is404 = error.status === 404;
    
    if (is404) {
      errorTitle = "Page Not Found";
      errorMessage = "The page you're looking for doesn't exist or has been moved.";
    } else if (error.status === 401) {
      errorTitle = "Unauthorized";
      errorMessage = "You need to be logged in to access this page.";
    } else if (error.status === 403) {
      errorTitle = "Access Denied";
      errorMessage = "You don't have permission to access this page.";
    } else if (error.status === 500) {
      errorTitle = "Server Error";
      errorMessage = "Something went wrong on our end. Please try again later.";
    } else {
      errorTitle = `Error ${error.status}`;
      errorMessage = error.data?.message || error.statusText || "An error occurred.";
    }
  } else if (error instanceof Error) {
    errorTitle = "Application Error";
    errorMessage = error.message || "An unexpected error occurred.";
  }

  return (
    <html lang="en" className="h-full bg-neutral-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{errorTitle} - portal.ask</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-lg shadow-lg border border-red-500/30">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
                {is404 ? (
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              
              {/* Error Title */}
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-4">
                {errorTitle}
              </h1>
              
              {/* Error Message */}
              <p className="text-gray-400 mb-8 leading-relaxed">
                {errorMessage}
              </p>
              
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && error instanceof Error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
                    Technical Details
                  </summary>
                  <div className="bg-neutral-700 p-4 rounded-lg border border-neutral-600">
                    <p className="text-xs text-red-400 font-mono break-all">
                      {error.stack}
                    </p>
                  </div>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Try Again
              </button>
              
              <a
                href="/"
                className="w-full py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-center"
              >
                Return Home
              </a>
              
              {!is404 && (
                <button
                  onClick={() => window.history.back()}
                  className="w-full py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-neutral-700 hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Go Back
                </button>
              )}
            </div>
            
            {/* Additional Help */}
            <div className="text-center pt-4 border-t border-neutral-700">
              <p className="text-xs text-gray-500 mb-2">
                Still having trouble?
              </p>
              <a
                href="mailto:support@xportal.com"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const db = createDb((context as any).env.DB)
  return json({
    user: await getUser(request, db),
  });
};

function WalletModalHandler() {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.wallet-adapter-modal');
      const modalWrapper = document.querySelector('.wallet-adapter-modal-wrapper');
      
      if (modal && modalWrapper && !modalWrapper.contains(event.target as Node)) {
        // Find and click the close button if it exists, or trigger modal close
        const closeButton = modal.querySelector('.wallet-adapter-modal-button-close');
        if (closeButton) {
          (closeButton as HTMLElement).click();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const modal = document.querySelector('.wallet-adapter-modal');
        if (modal) {
          // Find and click the close button if it exists, or trigger modal close
          const closeButton = modal.querySelector('.wallet-adapter-modal-button-close');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return null;
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const isClient = typeof window !== "undefined";

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

  return (
    <html lang="en" className="h-full bg-neutral-900">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <WalletProvider>
          <WalletModalHandler />
          <Outlet context={{ user }} />
        </WalletProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
