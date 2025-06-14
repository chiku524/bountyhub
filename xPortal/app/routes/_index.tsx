import { LoaderFunction, redirect } from "@remix-run/node";
import { getUser } from "~/utils/auth.server";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "portal.ask" },
    { name: "description", content: "Welcome to portal.ask!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user) {
    return redirect("/profile");
  }
  return redirect("/login");
};

export default function Index() {
  return null;
}

const resources = [
  {
    href: "/login",
    text: "Login / Signup",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300 w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
      </svg>
    ),
  },
];
