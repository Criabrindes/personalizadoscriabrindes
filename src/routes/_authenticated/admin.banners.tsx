import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { uploadProductImage } from "@/lib/admin";
import { bannersQuery, type Banner } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: AdminBanners,
});

type FormState = {
  id: string | null;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  id: null,
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  sort_order: "0",
  is_active: true,
};

function toForm(banner: Banner): FormState {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    image_url: banner.image_url ?? "",
    link_url: banner.link_url ?? "",
    sort_order: String(banner.sort_order),
    is_active: banner.is_active,
  };
}

function AdminBanners() {
  const queryClient = useQueryClient();
  const { data: banners = [] } = useQuery(bannersQuery);
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const payload = {
        title: state.title.trim(),
        subtitle: state.subtitle.trim(),
        image_url: state.image_url || null,
        link_url: state.link_url || null,
        sort_order: Number(state.sort_order) || 0,
        is_active: state.is_active,
      };
      if (state.id) {
        const { error } = await supabase.from("banners").update(payload).eq("id", state.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Banner salvo");
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner removido");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !form) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm({ ...form, image_url: url });
      toast.success("Imagem enviada");
    } catch {
      toast.error("Falha ao enviar a imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Banners da home</h1>
          <p className="text-sm text-muted-foreground">
            Cards de promoção exibidos no topo da página inicial.
          </p>
        </div>
        <Button onClick={() => setForm({ ...emptyForm })}>
          <Plus className="mr-1 size-4" /> Novo banner
        </Button>
      </div>

      {form && (
        <div className="mt-6 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{form.id ? "Editar banner" : "Novo banner"}</h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Fechar">
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                inputMode="numeric"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
              <span className="text-sm">Ativo</span>
            </div>
            <div className="sm:col-span-2">
              <Label>Imagem (opcional)</Label>
              <div className="mt-2 flex items-center gap-3">
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt=""
                    className="h-20 w-32 rounded-lg border object-cover"
                  />
                )}
                <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-secondary">
                  <Upload className="size-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
                {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar banner"}
            </Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              {banner.image_url && (
                <img
                  src={banner.image_url}
                  alt=""
                  className="h-14 w-24 rounded-lg border object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{banner.title}</p>
                <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {banner.is_active ? "Ativo" : "Inativo"}
              </span>
              <Button variant="outline" size="sm" onClick={() => setForm(toForm(banner))}>
                Editar
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (confirm(`Remover "${banner.title}"?`)) remove.mutate(banner.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
