import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { formatBRL, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const periods = [
  { key: "today", label: "Hoje", days: 0 },
  { key: "7d", label: "Últimos 7 dias", days: 7 },
  { key: "30d", label: "Últimos 30 dias", days: 30 },
  { key: "all", label: "Tudo", days: null },
] as const;

type Period = (typeof periods)[number];

function startOf(period: Period) {
  const now = new Date();
  if (period.days === null) return null;
  if (period.days === 0) {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  now.setDate(now.getDate() - period.days);
  return now.toISOString();
}

function Dashboard() {
  const [period, setPeriod] = useState<Period>(periods[1]);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", period.key],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("id, total, created_at, customer_name")
        .order("created_at", { ascending: false });
      const from = startOf(period);
      if (from) query = query.gte("created_at", from);
      const { data: rows, error } = await query;
      if (error) throw error;
      const list = rows ?? [];
      return {
        count: list.length,
        total: list.reduce((sum, o) => sum + Number(o.total ?? 0), 0),
        latest: list.slice(0, 8),
      };
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Painel</h1>
      <p className="text-sm text-muted-foreground">Resumo dos pedidos recebidos.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              p.key === period.key
                ? "border-primary bg-accent font-semibold text-accent-foreground"
                : "bg-card hover:bg-secondary"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Total vendido</p>
          <p className="mt-1 text-3xl font-extrabold text-price">
            {isLoading ? "—" : formatBRL(data?.total ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Pedidos recebidos</p>
          <p className="mt-1 text-3xl font-extrabold">{isLoading ? "—" : (data?.count ?? 0)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card shadow-card">
        <p className="border-b px-5 py-3 text-sm font-semibold">Últimos pedidos</p>
        {(data?.latest ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum pedido no período.</p>
        ) : (
          <ul className="divide-y">
            {(data?.latest ?? []).map((order) => (
              <li key={order.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <span className="font-semibold text-price">{formatBRL(Number(order.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
