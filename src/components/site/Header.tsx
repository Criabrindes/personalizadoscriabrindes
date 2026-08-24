import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { categoriesQuery } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { SITE } from "@/lib/site";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const { count } = useCart();
  const [term, setTerm] = useState("");
  const { data: categories = [] } = useQuery(categoriesQuery);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate({ to: "/produtos", search: { q: term || undefined, cat: undefined } });
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="brand-gradient text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="mt-8 flex flex-col gap-1 px-4">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                  >
                    {l.label}
                  </Link>
                ))}
                <span className="mt-4 px-3 text-xs font-semibold uppercase text-muted-foreground">
                  Categorias
                </span>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to="/produtos"
                    search={{ cat: c.slug, q: undefined }}
                    className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary-foreground text-base font-black text-primary">
              C
            </span>
            {SITE.name}
          </Link>

          <form
            onSubmit={submitSearch}
            className="order-last flex w-full items-center gap-2 md:order-none md:ml-6 md:w-auto md:flex-1"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar canecas, papelaria, brindes..."
                aria-label="Buscar produtos"
                className="h-10 w-full rounded-full border-0 bg-card pl-9 pr-4 text-sm text-foreground shadow-card outline-none ring-offset-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-sm font-medium opacity-90 transition hover:bg-primary-dark hover:opacity-100"
                activeProps={{ className: "bg-primary-dark opacity-100" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/carrinho"
            className="relative ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-primary-dark md:ml-2"
          >
            <ShoppingCart className="size-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-card px-1 text-xs font-bold text-primary">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2">
          <Link
            to="/produtos"
            search={{ cat: undefined, q: undefined }}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Todos os produtos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/produtos"
              search={{ cat: c.slug, q: undefined }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
