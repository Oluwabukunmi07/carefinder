import { supabase } from "../../../lib/supabase";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data } = await supabase
    .from("hospitals")
    .select("name, city, state")
    .eq("id", params.id)
    .single();

  return {
    title: `${data?.name ?? "Hospital"} | Carefinder`,
    description: `Find information about ${data?.name} in ${data?.city}, ${data?.state}.`,
  };
}

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
