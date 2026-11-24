# HENPROTRUST — site, área de cliente e gestão

Site bilingue (português de Portugal e inglês) da HENPROTRUST — construção, remodelação e manutenção de edifícios na Região Oeste — com área de cliente para aceitar orçamentos online e painel de gestão.

| Endereço | O que é |
| --- | --- |
| `/pt`, `/en` | Site público. `/` redireciona conforme o idioma do browser. |
| `/pt/conta` | Área de cliente: registo, pedidos de orçamento, aceitar/recusar orçamentos, acompanhar obras, dados pessoais. |
| `/admin` | Gestão (só administradores): painel, pedidos, orçamentos, obras, clientes e histórico. |
| `/pt/privacidade` | Política de Privacidade. |

## Primeira utilização

```bash
npm install
npm run admin:create -- --email o-seu-email@exemplo.pt --name "O seu nome"
npm run dev
```

O comando `admin:create` cria o administrador e mostra uma palavra-passe gerada (guarde-a). Para escolher a palavra-passe, acrescente `--password "…"` (mínimo 10 caracteres). O mesmo comando serve para repor a palavra-passe de um administrador.

Abrir <http://localhost:3000> (site) e <http://localhost:3000/admin> (gestão).

## Como funciona

1. **Pedido** — o cliente cria conta e faz um pedido de orçamento (ou fala pelo WhatsApp; nesse caso, crie-lhe a conta em *Gestão → Clientes → Novo cliente* e envie-lhe o acesso pelo botão do WhatsApp).
2. **Orçamento** — na gestão, cria o orçamento (linhas com quantidade, unidade e preço; IVA 23/13/6/0 %), guarda como rascunho e envia. O botão *Avisar cliente no WhatsApp* manda-lhe o link.
3. **Aceitação** — o cliente abre o orçamento na área de cliente e aceita (com confirmação) ou recusa. Fica registada a data e hora. A gestão vê se o cliente já abriu o orçamento.
4. **Obra** — cada orçamento aceite abre uma obra. Na gestão atualiza o estado (por iniciar → em curso → concluída), as datas e publica atualizações, que o cliente vê na sua área (ou ficam como nota interna).
5. **Histórico** — tudo fica registado: em *Histórico* (geral) e na ficha de cada cliente (cronologia).

Esquecimento da palavra-passe: o cliente pede ajuda pelo WhatsApp e o administrador gera uma palavra-passe temporária na ficha do cliente.

## Onde editar

| O quê | Ficheiro |
| --- | --- |
| Telefone, WhatsApp, email, localidades, NIF e alvará | `lib/site.ts` |
| Textos em português / inglês | `lib/dictionaries/pt.ts` / `en.ts` |
| Política de Privacidade | `lib/legal/privacy.ts` |
| Cores da marca | `app/globals.css` (bloco `@theme`) |
| Logótipo (SVG) | `components/logo.tsx` e `app/icon.svg` |

Os dois ficheiros de textos têm de manter a mesma estrutura (o TypeScript avisa se faltar algum texto em inglês).

## Dados

- Base de dados SQLite (libSQL). Localmente fica em `data/henprotrust.db`, que **não** vai para o git: contém dados pessoais de clientes. Faça cópias de segurança deste ficheiro.
- Em alojamento sem disco permanente (ex.: Vercel), use uma base [Turso](https://turso.tech) e defina `DATABASE_URL` e `DATABASE_AUTH_TOKEN` (ver `.env.example`). O esquema é criado automaticamente.
- Palavras-passe guardadas com scrypt; sessões em cookie httpOnly (30 dias); bloqueio temporário após 8 tentativas de login falhadas.

## Publicar

1. Definir `SITE_URL` com o domínio final (ex.: `https://www.henprotrust.pt`) — usado nos links canónicos, no `sitemap.xml`, na imagem de partilha e nos links enviados por WhatsApp.
2. Configurar a base de dados (ver acima) e correr `npm run admin:create` apontado para ela.
3. `npm run build` e `npm start` num servidor com Node.js, ou importar o projeto na Vercel.
