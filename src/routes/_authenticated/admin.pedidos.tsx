import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: OrdersPage,
});

type OrderItem = {
  code: string;
  name: string;
  quantity: number;
  unit_price: number;
  variation: Record<string, string>;
};

type Order = {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  customer_cpf: string | null;
  payment_method: string;
  delivery_method: string;
  notes: string | null;
  total: number;
  items: OrderItem[];
  created_at: string;
};

function OrdersPage() {
  const [open, setOpen] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Order[];
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <p className="text-sm text-muted-foreground">
        Dados informados pelos clientes. Visíveis apenas para a administração.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum pedido recebido ainda.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card shadow-card">
              <button
                type="button"
                onClick={() => setOpen(open === order.id ? null : order.id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <p className="font-semibold">
                    #{order.order_number} — {order.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)} · {order.customer_phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-price">{formatBRL(Number(order.total))}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.payment_method} · {order.delivery_method}
                  </p>
                </div>
              </button>

              {open === order.id && (
                <div className="space-y-3 border-t px-5 py-4 text-sm">
                  <ul className="space-y-1">
                    {(order.items ?? []).map((item, i) => (
                      <li key={`${order.id}-${i}`} className="flex justify-between gap-4">
                        <span>
                          [{item.code}] {item.name}
                          {item.variation && Object.keys(item.variation).length > 0 && (
                            <span className="text-muted-foreground">
                              {" "}
                              (
                              {Object.entries(item.variation)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                              )
                            </span>
                          )}{" "}
                          × {item.quantity}
                        </span>
                        <span>{formatBRL(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-1 border-t pt-3 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>Telefone: {order.customer_phone}</span>
                    <span>Endereço: {order.customer_address || "não informado"}</span>
                    <span>CPF: {order.customer_cpf || "não informado"}</span>
                    <span>Observações: {order.notes || "—"}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
