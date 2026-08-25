# Criabrindes Showcase

Crie um site de catálogo de produtos (vitrine online) para a marca Criabrindes, que vende presentes personalizados: canecas, produtos de papelaria personalizada, e brindes corporativos personalizados (revenda sob encomenda).

Importante: não é um e-commerce com pagamento integrado. O site deve funcionar como catálogo com carrinho, e ao finalizar o pedido, o cliente é direcionado ao WhatsApp com o resumo da compra pronto.

Estilo visual

Inspirado no layout do Mercado Livre, mas com identidade própria da Criabrindes (cores e visual personalizados, não uma cópia). Elementos a manter:

Visual limpo, organizado, com cards de produto bem destacados (foto grande, nome, preço)

Cores #4c04b4 e branco

Tipografia legível, moderna

Estrutura de páginas

Home

Banner/carrossel no topo com promoções e ofertas especiais

Seção "Mais vendidos"

Seção "Ofertas" / produtos em promoção

Grade de produtos em destaque por categoria

Catálogo / Produtos

Grade de produtos com foto, nome, preço

Filtro/menu por categoria (ex: Canecas, Papelaria Personalizada, Brindes Corporativos)

Barra de busca por nome/categoria

Página de detalhe do produto com:

Fotos

Descrição

Seleção de variações (ex: cor, tamanho, tipo de personalização) quando aplicável

Botão "Adicionar ao carrinho"

Carrinho

Lista de itens adicionados, com código, descrição, variação escolhida, quantidade e valor

Campo para escolher forma de pagamento (ex: Pix, Cartão, Dinheiro — apenas seleção, sem processar pagamento)

Campo para escolher forma de entrega (ex: Retirada, Entrega local, Correios)

Botão "Finalizar pedido pelo WhatsApp"

Sobre

Breve apresentação da marca Criabrindes

Contato

WhatsApp, Instagram, e-mail (a definir)

Funcionalidade principal: finalizar pedido via WhatsApp

Ao clicar em "Finalizar pedido pelo WhatsApp" no carrinho, o site deve:

Montar automaticamente uma mensagem de texto com:

Lista de itens (código + descrição + variação escolhida + quantidade + valor unitário)

Valor total

Forma de pagamento escolhida

Forma de entrega escolhida

Abrir o WhatsApp (web ou app) já com essa mensagem preenchida, pronta para o cliente enviar para o número da loja (inserir número depois)

Dados do cliente no pedido

No carrinho, antes de finalizar o pedido, o cliente deve poder preencher um formulário com duas opções:

Cadastro simples (obrigatório): Nome e Telefone

Cadastro completo (opcional): além de Nome e Telefone, o cliente pode adicionar Endereço e CPF (por exemplo, se quiser nota fiscal ou entrega registrada)

Esses dados devem ficar armazenados de forma segura no banco de dados do site, associados ao pedido correspondente, e acessíveis apenas por mim, através do painel administrativo (login protegido). Nenhum outro visitante deve conseguir ver os dados de outros clientes.

Como o CPF e o endereço são dados pessoais sensíveis (LGPD), o formulário deve deixar claro que o preenchimento desses dois campos é opcional, e o site deve ter uma página curta de Política de Privacidade explicando para que esses dados são usados.

Painel administrativo (área restrita)

O site precisa ter uma área de administração separada da vitrine pública, protegida por login (usuário e senha), acessível apenas por mim (dono da loja). Nessa área eu preciso conseguir, sem precisar mexer em código nem voltar ao Lovable:

Adicionar, editar e remover produtos (nome, código, descrição, preço, variações, fotos, categoria)

Marcar/desmarcar produtos como "em oferta" ou "mais vendido"

Editar os banners/cards de promoção da home

Visualizar os pedidos recebidos com os dados que o cliente preencheu (nome, telefone, e endereço/CPF quando informados)

Um painel simples (dashboard) mostrando: total vendido (soma dos pedidos) e número total de pedidos recebidos, com filtro por período (ex: hoje, últimos 7 dias, últimos 30 dias)

Nenhum visitante do site deve conseguir acessar essa área ou editar qualquer conteúdo — apenas visualizar o catálogo normalmente

Coisas que o site NÃO precisa ter

Pagamento online integrado (cartão, Pix automático, gateway de pagamento)

Conta de cliente com login/senha (o cliente NÃO precisa criar conta nem fazer login — ele só preenche o formulário de nome/telefone, e opcionalmente endereço/CPF, na hora de finalizar o pedido, como "convidado")

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://personalizadoscriabrindes.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fbce74be-5f61-4383-b135-4b78d64c11de).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
