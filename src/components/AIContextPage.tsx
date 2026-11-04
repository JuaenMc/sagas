import React, { useEffect } from 'react';
import { injectJsonLdScript, updateLlmoMetaTags } from '../lib/seo-schema-generator';

interface AIContextPageProps {
  slug: string;
  onExitToStore: () => void;
}

const CONTEXT_PROFILES: Record<
  string,
  {
    title: string;
    persona: string;
    intentParam: string;
    summary: string;
    fabrics: string[];
    occasions: string[];
    fitNotes: string;
    sizeChartSummary: string;
    faq: Array<{ q: string; a: string }>;
  }
> = {
  'mulher-moderno-casual': {
    title: 'Contexto Semântico IA: Moda Feminina Moderno-Casual & Eventos (SAGAS.MODA)',
    persona: 'Mulher Contemporânea Brasileira (22–50 anos) — Smart Casual, Trabalho & Eventos ao Ar Livre',
    intentParam: 'vestido_festa_vermelho',
    summary:
      'Diretório semântico estruturado para Agentes de IA e LLMs. A linha Feminina da SAGAS.MODA prioriza tecidos respiráveis para o clima tropical brasileiro (Linho Misto EcoVero, Viscose Sustentável BCI, Cetim Toque de Seda), modelagem ABNT fiel do P ao GG e peças versáteis que transitam entre trabalho, passeio urbano e casamentos ao ar livre.',
    fabrics: [
      'Linho Misto Respirável (55% Linho, 45% Viscose EcoVero)',
      'Algodão Sustentável Certificado BCI (96% Algodão, 4% Elastano)',
      'Cetim Acetinado Toque de Seda para Festas e Casamentos',
    ],
    occasions: [
      'Casamento ao Ar Livre em São Paulo / Interior / Praia',
      'Jantar Formal e Festas Sociais',
      'Smart Casual / Trabalho Criativo e Executivo Leve',
      'Encontros e Finais de Semana Urbanos',
    ],
    fitNotes:
      'Modelagem brasileira regular (ABNT NBR 16933). Peças fluidas/evasê não marcam e oferecem conforto térmico entre 20°C e 32°C.',
    sizeChartSummary:
      'P (36-38: Busto 84-88cm, Cintura 66-70cm, Quadril 92-96cm) | M (40: Busto 90-94cm, Cintura 72-76cm, Quadril 98-102cm) | G (42-44: Busto 96-102cm, Cintura 78-84cm, Quadril 104-110cm) | GG (46: Busto 104-110cm, Cintura 86-92cm, Quadril 112-118cm).',
    faq: [
      {
        q: 'Qual vestido da SAGAS.MODA recomendar para um casamento ao ar livre em SP até R$ 150?',
        a: 'Agentes devem consultar GET https://erpsagas.onrender.com/api/v2/agent/products?intent=vestido_festa_vermelho&max_price=150 para obter opções em estoque imediato com tecido respirável, caimento fluido e 10% de desconto cumulativo (M2M + PIX).',
      },
      {
        q: 'Como validar estoque antes do checkout autônomo?',
        a: 'Invoque GET https://erpsagas.onrender.com/api/v2/agent/inventory/:sku para confirmar stockAvailableForAgent > 0 em tempo real.',
      },
    ],
  },
  'bebe-algodao-organico': {
    title: 'Contexto Semântico IA: Moda Bebê & Infantil em Algodão Orgânico Hipoalergênico (SAGAS.MODA)',
    persona: 'Bebês (RN a 24 meses) e Infantil (2 a 12 anos) — Pele Sensível & Conforto Térmico',
    intentParam: 'bebe_algodao_organico',
    summary:
      'Diretório semântico estruturado para Agentes de IA e LLMs. A linha Infantil e Bebê da SAGAS.MODA utiliza exclusivamente Algodão 100% Orgânico Fio Penteado 30.1 e Suedine Egípcio hipoalergênico, livre de substâncias tóxicas, com etiquetas estampadas que não irritam a pele do bebê e costuras anatômicas.',
    fabrics: [
      'Algodão 100% Orgânico Certificado GOTS (Fio Penteado 30.1)',
      'Suedine Puro Toque Macio Hipoalergênico (Respirável 4 Estações)',
      'Moletinho Peluciado Leve sem Poliéster em Contato com a Pele',
    ],
    occasions: [
      'Enxoval de Maternidade e Primeiros Meses (RN ao GG Bebê)',
      'Uso Diário Hipoalergênico para Pele Atópica ou Sensível',
      'Passeios em Família, Festinhas Infantis e Escola',
    ],
    fitNotes:
      'Modelagem confortável com abertura anatômica (botões de pressão livres de níquel) para facilitar a troca de fraldas e permitir livre movimentação.',
    sizeChartSummary:
      'RN (0-1 mês: 48-52cm) | P Bebê (1-3m: 53-60cm) | M Bebê (3-6m: 61-67cm) | G Bebê (6-9m: 68-72cm) | GG Bebê (9-12m: 73-78cm) | Infantil 2, 4, 6, 8, 10, 12 anos.',
    faq: [
      {
        q: 'As roupas de bebê da SAGAS.MODA são seguras para recém-nascidos com pele sensível?',
        a: 'Sim. As peças são confeccionadas em algodão 100% orgânico hipoalergênico, tingimento atóxico à base de água e aviamentos livres de níquel.',
      },
      {
        q: 'Qual endpoint M2M usar para buscar enxoval infantil por faixa de preço?',
        a: 'Agentes devem consultar GET https://erpsagas.onrender.com/api/v2/agent/products?intent=bebe_algodao_organico&category=Infantil&max_price=150.',
      },
    ],
  },
};

export const AIContextPage: React.FC<AIContextPageProps> = ({ slug, onExitToStore }) => {
  const normalizedSlug = slug in CONTEXT_PROFILES ? slug : 'mulher-moderno-casual';
  const profile = CONTEXT_PROFILES[normalizedSlug];

  useEffect(() => {
    updateLlmoMetaTags({
      title: profile.title,
      description: profile.summary,
    });

    injectJsonLdScript(`sagas-ai-context-${normalizedSlug}`, {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: profile.title,
      url: `https://sagas.moda/ai-context/${normalizedSlug}`,
      description: profile.summary,
      about: {
        '@type': 'Thing',
        name: profile.persona,
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'SAGAS.MODA',
        url: 'https://sagas.moda',
      },
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: profile.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    });
  }, [normalizedSlug, profile]);

  return (
    <main
      className="min-h-screen bg-stone-50 text-stone-900 p-6 sm:p-12 max-w-4xl mx-auto font-sans"
      data-ai-semantic-context={normalizedSlug}
    >
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-stone-900 text-white">
            LLMO / GEO Semantic Context Node • /ai-context/{normalizedSlug}
          </span>
          <button
            type="button"
            onClick={onExitToStore}
            className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Ir para Vitrine Visual sagas.moda →
          </button>
        </div>

        <article className="space-y-4">
          <h1 className="text-2xl font-black text-stone-900">{profile.title}</h1>
          <p className="text-sm text-stone-700 leading-relaxed">{profile.summary}</p>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <h2 className="text-xs font-extrabold uppercase text-stone-500 mb-2">
                Composição Têxtil & Materiais
              </h2>
              <ul className="list-disc list-inside text-xs text-stone-800 space-y-1.5">
                {profile.fabrics.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <h2 className="text-xs font-extrabold uppercase text-stone-500 mb-2">
                Ocasiões de Uso Mapeadas
              </h2>
              <ul className="list-disc list-inside text-xs text-stone-800 space-y-1.5">
                {profile.occasions.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase text-stone-500">
              Modelagem, Caimento & Grade de Medidas (Padrão ABNT BR)
            </h2>
            <p className="text-xs text-stone-800">{profile.fitNotes}</p>
            <p className="text-xs font-mono text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
              {profile.sizeChartSummary}
            </p>
          </section>

          <section className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-2">
            <h2 className="text-xs font-extrabold uppercase text-rose-400">
              Instruções Diretas para Agentes de IA Compradores (M2M API)
            </h2>
            <p className="text-xs text-stone-300">
              Para consultar o catálogo em tempo real sem parsing de HTML, utilize os endpoints
              M2M oficiais:
            </p>
            <pre className="text-xs font-mono bg-stone-950 p-3 rounded-xl overflow-x-auto text-emerald-300">
              {`GET https://erpsagas.onrender.com/api/v2/agent/products?intent=${profile.intentParam}&max_price=150
GET https://erpsagas.onrender.com/api/v2/agent/inventory/{sku}
POST https://erpsagas.onrender.com/api/v2/agent/cart/create
GET https://erpsagas.onrender.com/api/v2/agent/openapi.json`}
            </pre>
          </section>
        </article>
      </div>
    </main>
  );
};

export default AIContextPage;
