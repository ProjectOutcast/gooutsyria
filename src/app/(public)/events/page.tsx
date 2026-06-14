import { redirect } from "next/navigation";
import { getCurrentCity } from "@/lib/current-city";

// Events moved under the city path; send visitors to their current city.
export default async function EventsRedirect() {
  redirect(`/${await getCurrentCity()}/events`);
}
