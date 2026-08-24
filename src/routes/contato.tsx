import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Criabrindes" },
      {
        name: "description",
        content:
          "Fale com a Criabrindes pelo WhatsApp, Instagram ou e-mail para orçamentos de presentes e brindes personalizados.",
      },
      { property: "og:title", content: "Contato | Criabrindes" },
      {
        property: "og:description",
        content: "WhatsApp, Instagram e e-mail para orçamentos de brindes personalizados.",
      },
    ],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Atendimento e orçamentos",
    href: whatsappLink("Olá! Gostaria de um orçamento de brindes personalizados."),
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: `@${SITE.instagram}`,
    href: SITE.instagramUrl,
  },
  { icon: Mail, label: "E-mail", value: SITE.email, href: `mailto:${SITE.email}` },
];

function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Contato</h1>
        <p className="mt-2 text-muted-foreground">
          Quer um orçamento, uma personalização especial ou um kit corporativo? Chame a gente.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {channels.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-card p-5 shadow-card transition hover:shadow-card-hover"
            >
              <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <p className="mt-3 font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">{value}</p>
            </a>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
