import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function SpeciesList() {
  // Redirect to the species-and-breeds page which provides a better UI
  redirect("/admin/species-and-breeds");
}