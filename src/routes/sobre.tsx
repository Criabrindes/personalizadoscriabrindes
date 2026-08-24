import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Criabrindes | Presentes personalizados" },
      {
        name: "description",
        content:
          "Conheça a Criabrindes: canecas, papelaria personalizada e brindes corporativos feitos sob encomenda com carinho.",
      },
      { property: "og:title", content: "Sobre a Criabrindes" },
      {
        property: "og:description",
        content: "Presentes e brindes personalizados sob encomenda, do seu jeito.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Sobre a {SITE.name}</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            A {SITE.name} nasceu do desejo de transformar objetos do dia a dia em lembranças
            especiais. Trabalhamos com presentes personalizados: canecas, papelaria e brindes
            corporativos criados sob encomenda para cada cliente.
          </p>
          <p>
            Cada peça é produzida com atenção aos detalhes, respeitando a sua arte, seu nome ou o
            logo da sua empresa. Também atuamos como revenda sob encomenda de brindes corporativos,
            ajudando empresas a fortalecerem sua marca em eventos, datas comemorativas e ações
            internas.
          </p>
          <p>
            Nosso atendimento é direto e humano: você escolhe os produtos no catálogo, monta o
            carrinho e finaliza o pedido pelo WhatsApp, onde combinamos personalização, prazo,
            pagamento e entrega.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/produtos" search={{ cat: undefined, q: undefined }}>
              Ver catálogo
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contato">Falar com a gente</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
