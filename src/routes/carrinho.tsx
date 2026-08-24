import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { DELIVERY_METHODS, PAYMENT_METHODS, SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Meu carrinho | Criabrindes" },
      {
        name: "description",
        content:
          "Revise os itens do seu pedido, escolha pagamento e entrega e finalize direto pelo WhatsApp.",
      },
      { property: "og:title", content: "Meu carrinho | Criabrindes" },
      {
        property: "og:description",
        content: "Finalize seu pedido de brindes personalizados pelo WhatsApp.",
      },
    ],
  }),
  component: CartPage,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone válido")
    .max(20, "Telefone muito longo")
    .regex(/^[0-9()+\-\s]+$/, "Telefone inválido"),
  address: z.string().trim().max(300, "Endereço muito longo").optional(),
  cpf: z
    .string()
    .trim()
    .max(14, "CPF inválido")
    .regex(/^$|^[0-9.\-]{11,14}$/, "CPF inválido")
    .optional(),
  notes: z.string().trim().max(500, "Observação muito longa").optional(),
});

function CartPage() {
  const { items, total, setQuantity, removeItem, clear } = useCart();
  const [showOptional, setShowOptional] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    cpf: "",
    notes: "",
    payment: PAYMENT_METHODS[0] as string,
    delivery: DELIVERY_METHODS[0] as string,
  });

  function buildMessage() {
    const lines = [
      `*Novo pedido — ${SITE.name}*`,
      "",
      ...items.map((item) => {
        const variation = Object.entries(item.variation)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        return `• [${item.code}] ${item.name}${variation ? ` (${variation})` : ""} — ${
          item.quantity
        }x ${formatBRL(item.unitPrice)} = ${formatBRL(item.unitPrice * item.quantity)}`;
      }),
      "",
      `*Total: ${formatBRL(total)}*`,
      `Pagamento: ${form.payment}`,
      `Entrega: ${form.delivery}`,
      "",
      `Cliente: ${form.name}`,
      `Telefone: ${form.phone}`,
      ...(form.address ? [`Endereço: ${form.address}`] : []),
      ...(form.cpf ? [`CPF: ${form.cpf}`] : []),
      ...(form.notes ? ["", `Observações: ${form.notes}`] : []),
    ];
    return lines.join("\n");
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    const parsed = formSchema.safeParse({
      name: form.name,
      phone: form.phone,
      address: form.address,
      cpf: form.cpf,
      notes: form.notes,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados informados");
      return;
    }

    setSubmitting(true);
    const message = buildMessage();
    const { error } = await supabase.from("orders").insert({
      customer_name: parsed.data.name,
      customer_phone: parsed.data.phone,
      customer_address: parsed.data.address || null,
      customer_cpf: parsed.data.cpf || null,
      payment_method: form.payment,
      delivery_method: form.delivery,
      notes: parsed.data.notes || null,
      total,
      items: items.map((i) => ({
        code: i.code,
        name: i.name,
        variation: i.variation,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      })),
    });
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível registrar o pedido. Tente novamente.");
      return;
    }

    window.open(whatsappLink(message), "_blank", "noopener");
    toast.success("Pedido registrado! Envie a mensagem no WhatsApp para confirmar.");
    clear();
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Meu carrinho</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-card p-10 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild className="mt-4">
              <Link to="/produtos" search={{ cat: undefined, q: undefined }}>
                Ver produtos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="divide-y rounded-xl border bg-card shadow-card">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-4 p-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-muted-foreground">
                          <ImageIcon className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Cód. {item.code}</p>
                      <p className="font-medium">{item.name}</p>
                      {Object.entries(item.variation).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(item.variation)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center rounded-full border text-sm">
                          <button
                            type="button"
                            className="px-3 py-1"
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                            aria-label="Diminuir"
                          >
                            −
                          </button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            className="px-3 py-1"
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                            aria-label="Aumentar"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="inline-flex items-center gap-1 text-xs text-destructive"
                        >
                          <Trash2 className="size-3.5" /> Remover
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(item.unitPrice)} un.
                      </p>
                      <p className="font-bold text-price">
                        {formatBRL(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-card">
                <h2 className="text-lg font-semibold">Seus dados</h2>
                <p className="text-xs text-muted-foreground">
                  Nome e telefone são obrigatórios. Endereço e CPF são opcionais.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      maxLength={120}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      maxLength={20}
                      placeholder="(00) 00000-0000"
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOptional((v) => !v)}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  {showOptional ? "Ocultar" : "Adicionar"} endereço e CPF (opcional)
                </button>

                {showOptional && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Endereço (opcional)</Label>
                      <Input
                        id="address"
                        value={form.address}
                        maxLength={300}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF (opcional)</Label>
                      <Input
                        id="cpf"
                        value={form.cpf}
                        maxLength={14}
                        placeholder="000.000.000-00"
                        onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground sm:col-span-2">
                      Endereço e CPF são usados apenas para emissão de nota fiscal ou entrega
                      registrada. Saiba mais na{" "}
                      <Link to="/privacidade" className="text-primary underline">
                        Política de Privacidade
                      </Link>
                      .
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    maxLength={500}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <aside className="h-max space-y-4 rounded-xl border bg-card p-5 shadow-card lg:sticky lg:top-40">
              <h2 className="text-lg font-semibold">Resumo do pedido</h2>

              <div>
                <Label htmlFor="payment">Forma de pagamento</Label>
                <select
                  id="payment"
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="delivery">Forma de entrega</Label>
                <select
                  id="delivery"
                  value={form.delivery}
                  onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {DELIVERY_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-lg">
                <span className="font-medium">Total</span>
                <span className="font-extrabold text-price">{formatBRL(total)}</span>
              </div>

              <Button size="lg" className="w-full" onClick={handleCheckout} disabled={submitting}>
                {submitting ? "Enviando..." : "Finalizar pedido pelo WhatsApp"}
              </Button>
              <p className="text-xs text-muted-foreground">
                O pagamento é combinado diretamente com a loja pelo WhatsApp.
              </p>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
