import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { fetchProductByCode, finalPrice } from "@/lib/catalog";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/produto/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Produto ${params.code} | Criabrindes` },
      {
        name: "description",
        content: "Detalhes, variações e valores do produto personalizado da Criabrindes.",
      },
      { property: "og:title", content: `Produto ${params.code} | Criabrindes` },
      {
        property: "og:description",
        content: "Escolha as variações e adicione ao carrinho para finalizar pelo WhatsApp.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { code } = Route.useParams();
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", code],
    queryFn: () => fetchProductByCode(code),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-7xl px-4 py-16 text-sm text-muted-foreground">Carregando...</p>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Button asChild className="mt-4">
            <Link to="/produtos" search={{ cat: undefined, q: undefined }}>
              Voltar ao catálogo
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const price = finalPrice(product);
  const hasDiscount = product.sale_price != null && product.sale_price < product.price;
  const missing = product.variations.filter((v) => !selected[v.name]);

  function handleAdd() {
    if (!product) return;
    if (missing.length > 0) {
      toast.error(`Escolha: ${missing.map((m) => m.name).join(", ")}`);
      return;
    }
    addItem({
      productId: product.id,
      code: product.code,
      name: product.name,
      unitPrice: price,
      quantity,
      image: product.images[0] ?? null,
      variation: selected,
    });
    toast.success("Produto adicionado ao carrinho");
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link to="/produtos" search={{ cat: undefined, q: undefined }} className="hover:underline">
            Produtos
          </Link>{" "}
          / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-xl border bg-card">
              {product.images[imageIndex] ? (
                <img
                  src={product.images[imageIndex]}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <ImageIcon className="size-16" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    className={`size-16 overflow-hidden rounded-lg border ${
                      i === imageIndex ? "ring-2 ring-ring" : ""
                    }`}
                  >
                    <img src={img} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-card">
            <div className="flex flex-wrap gap-2">
              {product.is_offer && <Badge className="bg-destructive">Oferta</Badge>}
              {product.is_bestseller && <Badge className="bg-primary">Mais vendido</Badge>}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Cód. {product.code}</p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>

            <div className="mt-4">
              {hasDiscount && (
                <span className="block text-sm text-muted-foreground line-through">
                  {formatBRL(product.price)}
                </span>
              )}
              <span className="text-4xl font-extrabold text-price">{formatBRL(price)}</span>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
              {product.description}
            </p>

            {product.variations.map((variation) => (
              <div key={variation.name} className="mt-5">
                <p className="mb-2 text-sm font-semibold">{variation.name}</p>
                <div className="flex flex-wrap gap-2">
                  {variation.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setSelected((prev) => ({ ...prev, [variation.name]: option }))
                      }
                      className={`rounded-full border px-4 py-1.5 text-sm transition ${
                        selected[variation.name] === option
                          ? "border-primary bg-accent font-semibold text-accent-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border">
                <button
                  type="button"
                  className="px-4 py-2 text-lg"
                  onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                  aria-label="Diminuir quantidade"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  className="px-4 py-2 text-lg"
                  onClick={() => setQuantity((v) => v + 1)}
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAdd}>
                <ShoppingCart className="mr-2 size-4" /> Adicionar ao carrinho
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Pedidos são finalizados pelo WhatsApp. Não realizamos pagamento online.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
