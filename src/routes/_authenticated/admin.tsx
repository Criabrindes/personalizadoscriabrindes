import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Images, LogOut, Package, ScrollText, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin, useIsAdmin } from "@/lib/admin";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Painel", icon: BarChart3, exact: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package, exact: false },
  { to: "/admin/banners", label: "Banners", icon: Images, exact: false },
  { to: "/admin/pedidos", label: "Pedidos", icon: ScrollText, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useIsAdmin();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <p className="p-10 text-sm text-muted-foreground">Carregando painel...</p>;
  }

  if (!data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-card">
          <h1 className="text-xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A conta {data?.email} não tem permissão de administrador. Se você é o dono da loja e
            este é o primeiro acesso, ative sua permissão abaixo.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              onClick={async () => {
                try {
                  const ok = await claimAdmin();
                  if (ok) {
                    toast.success("Permissão de administrador ativada");
                    refetch();
                  } else {
                    toast.error("Já existe um administrador nesta loja");
                  }
                } catch {
                  toast.error("Não foi possível ativar a permissão");
                }
              }}
            >
              Sou o dono da loja
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground md:w-60">
        <div className="flex items-center gap-2 px-5 py-5 text-lg font-extrabold">
          <Store className="size-5" /> {SITE.name}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              activeProps={{ className: "bg-sidebar-accent" }}
              className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition hover:bg-sidebar-accent"
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
          <Link
            to="/"
            className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm opacity-80 transition hover:bg-sidebar-accent"
          >
            <Store className="size-4" /> Ver loja
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm opacity-80 transition hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
