import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { isAdmin: false, email: null as string | null };
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return { isAdmin: Boolean(data), email: user.email ?? null };
    },
  });
}

export async function claimAdmin() {
  const { data, error } = await supabase.rpc("claim_admin");
  if (error) throw error;
  return Boolean(data);
}

const TEN_YEARS = 60 * 60 * 24 * 3650;

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw signError ?? new Error("Falha ao gerar URL da imagem");
  return data.signedUrl;
}
