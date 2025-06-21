import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if the request is for the PNG version
  if (request.url.includes('/default-avatar.png')) {
    return redirect("/default-avatar.svg");
  }
  
  // For any other path, also redirect to the SVG
  return redirect("/default-avatar.svg");
}

export default function DefaultAvatar() {
  return null;
} 