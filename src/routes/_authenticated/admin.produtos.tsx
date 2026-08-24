import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { uploadProductImage } from "@/lib/admin";
import { categoriesQuery, productsQuery, type Product, type Variation } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: AdminProducts,
});

type FormState = {
  id: string | null;
  code: string;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  category_id: string;
  images: string[];
  variations: Variation[];
  is_offer: boolean;
  is_bestseller: boolean;
  is_active: boolean;
};

const emptyForm: FormState = {
  id: null,
  code: "",
  name: "",
  description: "",
  price: "",
  sale_price: "",
  category_id: "",
  images: [],
  variations: [],
  is_offer: false,
  is_bestseller: false,
  is_active: true,
};

function toForm(product: Product): FormState {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    price: String(product.price),
    sale_price: product.sale_price != null ? String(product.sale_price) : "",
    category_id: product.category_id ?? "",
    images: product.images,
    variations: product.variations,
    is_offer: product.is_offer,
    is_bestseller: product.is_bestseller,
    is_active: product.is_active,
  };
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [form, setForm] = useState<FormState | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (state: FormState) => {
      const payload = {
        code: state.code.trim(),
        name: state.name.trim(),
        description: state.description.trim(),
        price: Number(state.price.replace(",", ".")) || 0,
        sale_price: state.sale_price ? Number(state.sale_price.replace(",", ".")) : null,
        category_id: state.category_id || null,
        images: state.images,
        variations: state.variations.filter((v) => v.name && v.options.length > 0),
        is_offer: state.is_offer,
        is_bestseller: state.is_bestseller,
        is_active: state.is_active,
      };
      if (state.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", state.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Produto salvo");
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Produto removido");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleFlag = useMutation({
    mutationFn: async ({
      id,
      field,
      value,
    }: {
      id: string;
      field: "is_offer" | "is_bestseller" | "is_active";
      value: boolean;
    }) => {
      const patch: Record<string, boolean> = { [field]: value };
      const { error } = await supabase
        .from("products")
        .update(patch as { is_offer?: boolean; is_bestseller?: boolean; is_active?: boolean })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUpload(files: FileList | null) {
    if (!files || !form) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadProductImage(file));
      }
      setForm({ ...form, images: [...form.images, ...urls] });
      toast.success("Imagem(ns) enviada(s)");
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
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">{products.length} cadastrados</p>
        </div>
        <Button onClick={() => setForm({ ...emptyForm })}>
          <Plus className="mr-1 size-4" /> Novo produto
        </Button>
      </div>

      {form && (
        <div className="mt-6 rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? "Editar produto" : "Novo produto"}
            </h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Fechar">
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sale">Preço promocional (opcional)</Label>
              <Input
                id="sale"
                inputMode="decimal"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm"
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.is_offer}
                  onCheckedChange={(v) => setForm({ ...form, is_offer: v })}
                />
                Em oferta
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.is_bestseller}
                  onCheckedChange={(v) => setForm({ ...form, is_bestseller: v })}
                />
                Mais vendido
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                Ativo
              </label>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-5">
            <Label>Fotos</Label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {form.images.map((img) => (
                <div key={img} className="relative size-20 overflow-hidden rounded-lg border">
                  <img src={img} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, images: form.images.filter((i) => i !== img) })
                    }
                    className="absolute right-0 top-0 bg-destructive px-1 text-xs text-destructive-foreground"
                    aria-label="Remover imagem"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-secondary">
                <Upload className="size-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
              {uploading && <span className="text-sm text-muted-foreground">Enviando...</span>}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <Label>Variações (ex: Cor, Tamanho)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({ ...form, variations: [...form.variations, { name: "", options: [] }] })
                }
              >
                <Plus className="mr-1 size-3.5" /> Adicionar
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {form.variations.map((variation, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
                  <Input
                    placeholder="Nome (ex: Cor)"
                    value={variation.name}
                    onChange={(e) => {
                      const next = [...form.variations];
                      next[index] = { ...variation, name: e.target.value };
                      setForm({ ...form, variations: next });
                    }}
                  />
                  <Input
                    placeholder="Opções separadas por vírgula"
                    value={variation.options.join(", ")}
                    onChange={(e) => {
                      const next = [...form.variations];
                      next[index] = {
                        ...variation,
                        options: e.target.value
                          .split(",")
                          .map((o) => o.trim())
                          .filter(Boolean),
                      };
                      setForm({ ...form, variations: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setForm({
                        ...form,
                        variations: form.variations.filter((_, i) => i !== index),
                      })
                    }
                    aria-label="Remover variação"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? "Salvando..." : "Salvar produto"}
            </Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Oferta</th>
              <th className="px-4 py-3">Mais vendido</th>
              <th className="px-4 py-3">Ativo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.code}</p>
                </td>
                <td className="px-4 py-3">
                  {formatBRL(product.sale_price ?? product.price)}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.is_offer}
                    onCheckedChange={(v) =>
                      toggleFlag.mutate({ id: product.id, field: "is_offer", value: v })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.is_bestseller}
                    onCheckedChange={(v) =>
                      toggleFlag.mutate({ id: product.id, field: "is_bestseller", value: v })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={(v) =>
                      toggleFlag.mutate({ id: product.id, field: "is_active", value: v })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => setForm(toForm(product))}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Remover "${product.name}"?`)) remove.mutate(product.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
