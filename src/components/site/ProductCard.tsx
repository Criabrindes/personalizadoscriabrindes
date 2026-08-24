import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { finalPrice, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const price = finalPrice(product);
  const hasDiscount = product.sale_price != null && product.sale_price < product.price;
  const image = product.images[0];

  return (
    <Link
      to="/produto/$code"
      params={{ code: product.code }}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageIcon className="size-10" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_offer && <Badge className="bg-destructive">Oferta</Badge>}
          {product.is_bestseller && <Badge className="bg-primary">Mais vendido</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">Cód. {product.code}</span>
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        <div className="mt-auto pt-2">
          {hasDiscount && (
            <span className="block text-xs text-muted-foreground line-through">
              {formatBRL(product.price)}
            </span>
          )}
          <span className="text-xl font-bold text-price">{formatBRL(price)}</span>
        </div>
      </div>
    </Link>
  );
}
