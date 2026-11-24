// Privacy policy text. Review with your accountant/lawyer and complete the
// company's legal name and NIF in lib/site.ts.
import type { Locale } from "@/lib/locales";
import { site } from "@/lib/site";

type Policy = { title: string; updated: string; intro: string; sections: { title: string; body: string[] }[] };

const contact = `${site.email} · ${site.phoneDisplay}`;

export const privacyPolicy: Record<Locale, Policy> = {
  pt: {
    title: "Política de Privacidade",
    updated: "Última atualização: 24 de novembro de 2026",
    intro:
      "Esta política explica que dados pessoais tratamos quando utiliza este site e a área de cliente, para que fins e quais são os seus direitos, nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD).",
    sections: [
      {
        title: "1. Responsável pelo tratamento",
        body: [
          `${site.legal.companyName}${site.legal.nif ? `, NIF ${site.legal.nif}` : ""}, com base em ${site.base}, Portugal. Contacto: ${contact}.`,
        ],
      },
      {
        title: "2. Que dados tratamos",
        body: [
          "Dados que nos indica ao criar conta ou ao atualizar os seus dados: nome, email, telemóvel, tipo de cliente, empresa ou condomínio, NIF, localidade e morada.",
          "Informação dos pedidos de orçamento, dos orçamentos, das obras e das respetivas atualizações, bem como o registo das ações na conta (por exemplo, a data em que um orçamento foi aceite) e a data do último acesso.",
          "O formulário de contacto da página inicial não guarda dados neste site: apenas abre o WhatsApp ou o seu programa de email com a mensagem preenchida.",
        ],
      },
      {
        title: "3. Para que usamos os dados",
        body: [
          "Responder aos seus pedidos e preparar orçamentos; gerir a sua área de cliente; executar e acompanhar os trabalhos adjudicados; cumprir obrigações legais, nomeadamente fiscais e contabilísticas.",
        ],
      },
      {
        title: "4. Fundamento jurídico",
        body: [
          "Diligências pré-contratuais a seu pedido e execução de contrato (artigo 6.º, n.º 1, alínea b) do RGPD) e cumprimento de obrigações legais (alínea c)).",
        ],
      },
      {
        title: "5. Durante quanto tempo",
        body: [
          "Conservamos os dados enquanto a conta estiver ativa. Se pedir a eliminação, apagamos os dados, exceto os que tenhamos de conservar por obrigação legal (por exemplo, documentos de faturação, pelo prazo legalmente previsto).",
        ],
      },
      {
        title: "6. Partilha de dados",
        body: [
          "Não vendemos nem cedemos dados pessoais para fins comerciais. Os dados podem ser tratados por prestadores de serviços tecnológicos (alojamento do site e da base de dados) que atuam por nossa conta e com garantias adequadas.",
        ],
      },
      {
        title: "7. Segurança",
        body: [
          "As palavras-passe são guardadas de forma cifrada (hash), as sessões são protegidas e o acesso à gestão está limitado a pessoas autorizadas.",
        ],
      },
      {
        title: "8. Cookies",
        body: [
          "Usamos apenas cookies essenciais: um cookie de sessão, para manter a sessão iniciada na área de cliente, e um cookie com a preferência de idioma. Não usamos cookies de publicidade nem de análise.",
        ],
      },
      {
        title: "9. Os seus direitos",
        body: [
          `Pode pedir o acesso, a retificação, o apagamento, a limitação do tratamento e a portabilidade dos seus dados, ou opor-se ao tratamento, através de ${site.email}.`,
          "Tem ainda o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD) — www.cnpd.pt.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: 24 November 2026",
    intro:
      "This policy explains which personal data we process when you use this website and the client area, for what purposes, and what your rights are under the General Data Protection Regulation (GDPR).",
    sections: [
      {
        title: "1. Data controller",
        body: [
          `${site.legal.companyName}${site.legal.nif ? `, tax no. ${site.legal.nif}` : ""}, based in ${site.base}, Portugal. Contact: ${contact}.`,
        ],
      },
      {
        title: "2. What data we process",
        body: [
          "Data you give us when creating an account or updating your details: name, email, mobile phone, client type, company or condominium, tax number, town and address.",
          "Information about your quote requests, quotes, works and their updates, as well as a record of actions in your account (for example, the date a quote was accepted) and the date of your last login.",
          "The contact form on the home page does not store any data on this website: it only opens WhatsApp or your email program with the message filled in.",
        ],
      },
      {
        title: "3. What we use it for",
        body: [
          "To reply to your requests and prepare quotes; to manage your client area; to carry out and follow up the works you award us; and to meet legal obligations, namely tax and accounting obligations.",
        ],
      },
      {
        title: "4. Legal basis",
        body: [
          "Steps taken at your request prior to entering into a contract and the performance of a contract (Article 6(1)(b) GDPR), and compliance with legal obligations (Article 6(1)(c)).",
        ],
      },
      {
        title: "5. How long we keep it",
        body: [
          "We keep your data while your account is active. If you ask us to delete it, we will do so, except for data we must keep by law (for example, invoicing records, for the legally required period).",
        ],
      },
      {
        title: "6. Sharing",
        body: [
          "We do not sell or share personal data for marketing purposes. Data may be processed by technology providers (website and database hosting) acting on our behalf with appropriate safeguards.",
        ],
      },
      {
        title: "7. Security",
        body: [
          "Passwords are stored in encrypted (hashed) form, sessions are protected and access to the management area is restricted to authorised people.",
        ],
      },
      {
        title: "8. Cookies",
        body: [
          "We only use essential cookies: a session cookie to keep you logged in to the client area and a cookie that remembers your language. We do not use advertising or analytics cookies.",
        ],
      },
      {
        title: "9. Your rights",
        body: [
          `You can request access to, rectification, erasure, restriction or portability of your data, or object to its processing, by writing to ${site.email}.`,
          "You also have the right to lodge a complaint with the Portuguese Data Protection Authority (CNPD) — www.cnpd.pt.",
        ],
      },
    ],
  },
};
