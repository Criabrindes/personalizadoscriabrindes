import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/catalog";

type ProductSearch = { q?: string | undefined; cat?: string | undefined };

export const Route = createFileRoute("/produtos")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    cat: typeof search["cat"] === "string" && search["cat"] ? search["cat"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo de produtos personalizados | Criabrindes" },
      {
        name: "description",
        content:
          "Veja canecas, papelaria personalizada e brindes corporativos. Filtre por categoria e monte seu pedido.",
      },
      { property: "og:title", content: "Catálogo Criabrindes" },
      {
        property: "og:description",
        content: "Canecas, papelaria e brindes corporativos personalizados sob encomenda.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/produtos" });
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);

  const activeCategory = categories.find((c) => c.slug === cat);
  const term = (q ?? "").trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (activeCategory && p.category_id !== activeCategory.id) return false;
    if (!term) return true;
    const categoryName = categories.find((c) => c.id === p.category_id)?.name ?? "";
    return `${p.name} ${p.code} ${p.description} ${categoryName}`.toLowerCase().includes(term);
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">
          {activeCategory ? activeCategory.name : "Todos os produtos"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} produto(s) {term ? `para "${q}"` : ""}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-max rounded-xl border bg-card p-4 shadow-card">
            <p className="mb-3 text-sm font-semibold">Categorias</p>
            <nav className="flex flex-col gap-1">
              <Link
                to="/produtos"
                search={{ cat: undefined, q: q }}
                className={`rounded-md px-3 py-2 text-sm transition hover:bg-accent ${
                  !cat ? "bg-accent font-semibold text-accent-foreground" : ""
                }`}
              >
                Todas
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to="/produtos"
                  search={{ cat: c.slug, q: q }}
                  className={`rounded-md px-3 py-2 text-sm transition hover:bg-accent ${
                    cat === c.slug ? "bg-accent font-semibold text-accent-foreground" : ""
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const value = new FormData(e.currentTarget).get("q");
                navigate({
                  search: {
                    cat: cat,
                    q: typeof value === "string" && value.trim() ? value.trim() : undefined,
                  },
                });
              }}
              className="relative mb-5"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Buscar por nome ou código"
                aria-label="Buscar produtos"
                className="h-11 w-full rounded-full border bg-card pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </form>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : filtered.length === 0 ? (
              <p className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
