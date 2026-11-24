# HENPROTRUST — site institucional

Site bilingue (português de Portugal e inglês) da HENPROTRUST — construção, remodelação e manutenção de edifícios na Região Oeste.

- `/pt` — Português (predefinido)
- `/en` — English
- `/` redireciona automaticamente conforme o idioma do browser e lembra a última escolha.

## Correr localmente

```bash
npm install
npm run dev
```

Abrir <http://localhost:3000>.

## Onde editar

| O quê | Ficheiro |
| --- | --- |
| Telefone, WhatsApp, email, localidades | `lib/site.ts` |
| Textos em português | `lib/dictionaries/pt.ts` |
| Textos em inglês | `lib/dictionaries/en.ts` |
| Cores da marca | `app/globals.css` (bloco `@theme`) |
| Logótipo (SVG) | `components/logo.tsx` e `app/icon.svg` |
| Secções da página | `components/sections/` |

Os dois ficheiros de textos têm de manter a mesma estrutura (o TypeScript avisa se faltar algum texto em inglês).

## Publicar

1. Definir a variável de ambiente `SITE_URL` com o domínio final, por exemplo `https://www.henprotrust.pt`. É usada nos links canónicos, no `sitemap.xml` e na imagem de partilha (WhatsApp, Facebook, LinkedIn).
2. `npm run build` e `npm start`, ou importar o projeto na Vercel (lá o `SITE_URL` é detetado automaticamente se não for definido).

## Formulário de contacto

O formulário não guarda dados nem precisa de servidor de email: abre o WhatsApp (ou o programa de email) com a mensagem já preenchida para +351 912 866 284.
