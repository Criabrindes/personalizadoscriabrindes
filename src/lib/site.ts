// Configurações da loja. Troque o número de WhatsApp e os contatos aqui.
export const SITE = {
  name: "Criabrindes",
  tagline: "Presentes personalizados que emocionam",
  // Formato internacional, apenas dígitos: 55 + DDD + número
  whatsappNumber: "5500000000000",
  instagram: "criabrindes",
  instagramUrl: "https://instagram.com/criabrindes",
  email: "contato@criabrindes.com.br",
};

export const PAYMENT_METHODS = ["Pix", "Cartão", "Dinheiro"] as const;
export const DELIVERY_METHODS = ["Retirada", "Entrega local", "Correios"] as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
