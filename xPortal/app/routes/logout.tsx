import { type ActionFunctionArgs } from "@remix-run/cloudflare";
import { logout } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return logout(request);
};

// This route should never be rendered
export default function Logout() {
  return null;
} 