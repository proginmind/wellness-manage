import { redirect } from "next/navigation";

import { buildRoute } from "@/lib/routes";

export default function Home() {
  redirect(buildRoute.login());
}
