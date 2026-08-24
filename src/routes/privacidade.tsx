import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Criabrindes" },
      {
        name: "description",
        content:
          "Como a Criabrindes coleta, usa e protege os dados informados no pedido, conforme a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade | Criabrindes" },
      {
        property: "og:description",
        content: "Transparência sobre o uso dos dados pessoais informados no pedido.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <div className="mt-6 space-y-5 text-sm text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground">Quais dados coletamos</h2>
            <p className="mt-1">
              Para registrar um pedido pedimos <strong>nome</strong> e <strong>telefone</strong>,
              que são obrigatórios para conseguirmos entrar em contato e confirmar a compra.
              Opcionalmente, você pode informar <strong>endereço</strong> e <strong>CPF</strong>.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Por que pedimos CPF e endereço</h2>
            <p className="mt-1">
              Esses dois campos são <strong>opcionais</strong> e usados apenas quando você deseja
              emissão de nota fiscal ou entrega registrada (transportadora/Correios). Se não
              precisar disso, basta não preencher.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Como usamos e protegemos</h2>
            <p className="mt-1">
              Os dados são armazenados de forma segura no banco de dados do site e ficam acessíveis
              somente à administração da {SITE.name}, através de área restrita protegida por login.
              Nenhum outro visitante consegue visualizar dados de pedidos. Não vendemos nem
              compartilhamos seus dados com terceiros para fins de marketing.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Pagamentos</h2>
            <p className="mt-1">
              O site não processa pagamentos e não coleta dados de cartão. O pagamento é combinado
              diretamente com a loja pelo WhatsApp.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground">Seus direitos (LGPD)</h2>
            <p className="mt-1">
              Você pode solicitar a qualquer momento a confirmação, correção ou exclusão dos seus
              dados enviando uma mensagem para {SITE.email} ou pelo nosso WhatsApp.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
