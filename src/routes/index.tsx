import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gift, PackageCheck, Sparkles } from "lucide-react";

import heroImage from "@/assets/hero-brindes.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { bannersQuery, categoriesQuery, productsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Criabrindes — Presentes e brindes personalizados" },
      {
        name: "description",
        content:
          "Canecas, papelaria personalizada e brindes corporativos sob encomenda. Monte seu pedido e finalize pelo WhatsApp.",
      },
      { property: "og:title", content: "Criabrindes — Presentes personalizados" },
      {
        property: "og:description",
        content:
          "Catálogo de canecas, papelaria e brindes corporativos personalizados. Pedido rápido pelo WhatsApp.",
      },
    ],
  }),
  component: Home,
});

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          to="/produtos"
          search={{ cat: undefined, q: undefined }}
          className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
        >
          Ver tudo
        </Link>
      </div>
      {children}
    </section>
  );
}

function Home() {
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: banners = [] } = useQuery(bannersQuery);

  const bestsellers = products.filter((p) => p.is_bestseller).slice(0, 8);
  const offers = products.filter((p) => p.is_offer).slice(0, 8);

  return (
    <SiteLayout>
      <section className="brand-gradient text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
          <div>
            <Carousel className="w-full">
              <CarouselContent>
                {(banners.length > 0
                  ? banners
                  : [
                      {
                        id: "default",
                        title: "Presentes que emocionam",
                        subtitle: "Canecas, papelaria e brindes personalizados do seu jeito",
                        link_url: null,
                        image_url: null,
                      },
                    ]
                ).map((b) => (
                  <CarouselItem key={b.id}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      <Sparkles className="size-3.5" /> Criabrindes
                    </span>
                    <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
                      {b.title}
                    </h1>
                    <p className="mt-3 max-w-lg text-base opacity-90">{b.subtitle}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild size="lg" variant="secondary">
                        <Link to="/produtos" search={{ cat: undefined, q: undefined }}>
                          Ver catálogo <ArrowRight className="ml-1 size-4" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-primary-foreground/40 bg-transparent hover:bg-primary-dark"
                      >
                        <Link to="/contato">Falar com a gente</Link>
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {banners.length > 1 && (
                <>
                  <CarouselPrevious className="-left-2 text-primary" />
                  <CarouselNext className="-right-2 text-primary" />
                </>
              )}
            </Carousel>
          </div>
          <img
            src={heroImage}
            alt="Canecas, cadernos e brindes personalizados da Criabrindes"
            width={1600}
            height={912}
            className="rounded-2xl object-cover shadow-card-hover"
          />
        </div>
      </section>

      <div className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-3">
          {[
            { icon: Gift, title: "100% personalizado", text: "Sua arte, nome ou logo" },
            { icon: PackageCheck, title: "Sob encomenda", text: "Produção conforme o pedido" },
            {
              icon: Sparkles,
              title: "Pedido pelo WhatsApp",
              text: "Rápido, sem cadastro e sem burocracia",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">
          Carregando produtos...
        </p>
      )}

      {bestsellers.length > 0 && (
        <Section title="Mais vendidos" subtitle="Os favoritos dos nossos clientes">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {offers.length > 0 && (
        <Section title="Ofertas" subtitle="Promoções por tempo limitado">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}

      {categories.map((cat) => {
        const list = products.filter((p) => p.category_id === cat.id).slice(0, 4);
        if (list.length === 0) return null;
        return (
          <Section key={cat.id} title={cat.name}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Section>
        );
      })}
    </SiteLayout>
  );
}
