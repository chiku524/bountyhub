import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { createDb } from "~/utils/db.server";
import { getUser } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "portal.ask" },
    { name: "description", content: "Welcome to portal.ask!" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const typedContext = context as { env: { DB: D1Database; SESSION_SECRET?: string } };
  console.log('Index loader called, method:', request.method);
  console.log('Index loader called, context exists:', !!context);
  console.log('Index loader called, context.env exists:', !!typedContext?.env);
  
  if (!typedContext?.env?.DB) {
    throw new Error("D1 Database binding is missing from context.env.DB");
  }
  
  // Set the session secret for the auth system
  if (typedContext.env.SESSION_SECRET) {
    (global as unknown as { SESSION_SECRET: string }).SESSION_SECRET = typedContext.env.SESSION_SECRET;
  }
  
  const db = createDb(typedContext.env.DB);
  const user = await getUser(request, db);
  console.log('Index loader - user found:', !!user);
  
  if (user) {
    console.log('Index loader - redirecting to /profile');
    return redirect("/profile");
  }
  console.log('Index loader - redirecting to /login');
  return redirect("/login");
};

export default function Index() {
  return null;
}
