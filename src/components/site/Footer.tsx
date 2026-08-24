import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";

import { SITE, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-primary">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Navegue</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/produtos" search={{ cat: undefined, q: undefined }}>
                Produtos
              </Link>
            </li>
            <li>
              <Link to="/sobre">Sobre</Link>
            </li>
            <li>
              <Link to="/contato">Contato</Link>
            </li>
            <li>
              <Link to="/privacidade">Política de Privacidade</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Contato</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href={whatsappLink("Olá! Vim pelo site da Criabrindes.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Instagram className="size-4" /> @{SITE.instagram}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2">
                <Mail className="size-4" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Como funciona</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Escolha os produtos, monte seu carrinho e finalize o pedido pelo WhatsApp. Não
            processamos pagamentos online — combinamos tudo direto com você.
          </p>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
