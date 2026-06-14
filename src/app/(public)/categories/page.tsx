import { redirect } from "next/navigation";
import { getCurrentCity } from "@/lib/current-city";

// Categories moved under the city path.
export default async function CategoriesRedirect() {
  redirect(`/${await getCurrentCity()}/categories`);
}
