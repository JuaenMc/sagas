import type { Product } from '../types';

export interface SemanticProductAttributes {
  material: string;
  season: string;
  sizeSystem: 'BR';
  occasion: string[];
  fit: string;
  careInstructions: string;
}

export function inferProductSemanticAttributes(product: Product): SemanticProductAttributes {
  const text = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();

  let material = 'Algodão Sustentável Premium & Viscose';
  if (text.includes('linho')) material = 'Linho Misto Respirável (55% Linho, 45% Viscose)';
  else if (text.includes('algodão') || text.includes('algodao') || text.includes('bebe') || text.includes('infantil'))
    material = '100% Algodão Orgânico Hipoalergênico Fio Penteado 30.1';
  else if (text.includes('cetim') || text.includes('seda')) material = 'Cetim Toque de Seda Acetinado';
  else if (text.includes('jeans') || text.includes('sarja')) material = 'Denim Confort com Elastano';

  let season = 'Primavera/Verão & Meia-Estação (Clima Tropical Brasileiro)';
  if (text.includes('inverno') || text.includes('casaco') || text.includes('tricô')) {
    season = 'Outono/Inverno';
  }

  const occasion: string[] = [];
  if (text.includes('festa') || text.includes('casamento') || text.includes('noite')) {
    occasion.push('Casamento ao Ar Livre', 'Festa Social', 'Jantar Formal');
  }
  if (text.includes('casual') || text.includes('dia a dia')) {
    occasion.push('Casual Moderno', 'Trabalho Smart Casual', 'Passeio Urbano');
  }
  if (occasion.length === 0) {
    occasion.push('Versátil Dia e Noite', 'Encontros & Eventos Sociais', 'Casual Chic');
  }

  let fit = 'Modelagem Brasileira Regular Fiel ao Tamanho (ABNT)';
  if (text.includes('fluido') || text.includes('soltinho') || text.includes('midi')) {
    fit = 'Caimento Fluido / Evasê Confortável';
  } else if (text.includes('ajustado') || text.includes('slim')) {
    fit = 'Caimento Ajustado Anatômico com Elastano';
  }

  return {
    material,
    season,
    sizeSystem: 'BR',
    occasion,
    fit,
    careInstructions: 'Lavagem delicada até 30°C, secar à sombra, não utilizar alvejante.',
  };
}

/**
 * Gera Schema.org JSON-LD completo de Produto (Product + Offer + AggregateRating + Brand + MerchantReturnPolicy)
 * Otimizado para LLMO (Large Language Model Optimization) e Google Shopping Graph.
 */
export function generateProductJsonLd(product: Product) {
  const semantic = inferProductSemanticAttributes(product);
  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : 'P, M, G, GG';
  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors.map((c) => c.name).join(', ')
      : 'Cores da Coleção';
  const totalStock =
    typeof product.stock === 'number'
      ? product.stock
      : (product.variations || []).reduce((acc, v) => acc + (v.stock || 0), 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://sagas.moda/?product=${encodeURIComponent(product.id)}#product`,
    name: product.name,
    sku: product.sku || `SAG-${product.id}`,
    productID: product.id,
    description: `${product.name} da marca SAGAS.MODA (${product.category}). Confeccionado em ${semantic.material}, ${semantic.fit}, indicado para ${semantic.occasion.join(', ')} na estação ${semantic.season}. Tamanhos padrão brasileiro (${semantic.sizeSystem}): ${availableSizes}. ${product.description || ''}`.trim(),
    image: product.images && product.images.length > 0 ? product.images : [product.image],
    category: product.category,
    material: semantic.material,
    pattern: semantic.fit,
    size: availableSizes,
    sizeSystem: 'https://schema.org/WearableSizeSystemBR',
    color: availableColors,
    audience: {
      '@type': 'PeopleAudience',
      suggestedGender:
        product.category === 'Infantil'
          ? 'unisex'
          : product.category === 'Masculino'
          ? 'male'
          : 'female',
    },
    brand: {
      '@type': 'Brand',
      name: 'SAGAS.MODA',
      url: 'https://sagas.moda',
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'season',
        value: semantic.season,
      },
      {
        '@type': 'PropertyValue',
        name: 'sizeSystem',
        value: 'BR (Padrão ABNT Brasil)',
      },
      {
        '@type': 'PropertyValue',
        name: 'occasion',
        value: semantic.occasion.join(', '),
      },
      {
        '@type': 'PropertyValue',
        name: 'fit',
        value: semantic.fit,
      },
      {
        '@type': 'PropertyValue',
        name: 'careInstructions',
        value: semantic.careInstructions,
      },
      {
        '@type': 'PropertyValue',
        name: 'agenticCommerceApiEndpoint',
        value: `https://erpsagas.onrender.com/api/v2/agent/inventory/${encodeURIComponent(
          product.sku || product.id
        )}`,
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating || 4.9),
      reviewCount: String(Math.max(1, product.reviewsCount || 24)),
      bestRating: '5',
      worstRating: '1',
    },
    offers: {
      '@type': 'Offer',
      url: `https://sagas.moda/?product=${encodeURIComponent(product.id)}`,
      priceCurrency: 'BRL',
      price: Number(product.price || 0).toFixed(2),
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      inventoryLevel: {
        '@type': 'QuantitativeValue',
        value: totalStock,
      },
      seller: {
        '@type': 'OnlineStore',
        name: 'SAGAS.MODA',
        url: 'https://sagas.moda',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
    },
  };
}

/**
 * Gera Schema.org FAQPage + OnlineStore global para indexação semântica por LLMs (GEO/LLMO)
 */
export function generateStoreAndFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'OnlineStore',
        '@id': 'https://sagas.moda/#organization',
        name: 'SAGAS.MODA',
        alternateName: 'Sagas Moda Feminina, Infantil e Bebê',
        url: 'https://sagas.moda',
        description:
          'E-commerce brasileiro AI-Native de moda feminina moderna casual, vestidos para eventos e moda infantil/bebê em algodão orgânico hipoalergênico. Compatível com compras autônomas M2M via /api/v2/agent.',
        currenciesAccepted: 'BRL',
        paymentAccepted: 'PIX, Cartão de Crédito, Checkout Autônomo para Agentes de IA',
        priceRange: 'R$ 39,90 - R$ 299,90',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'São Paulo',
          addressRegion: 'SP',
          addressCountry: 'BR',
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'BR',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target:
            'https://erpsagas.onrender.com/api/v2/agent/products?intent={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://sagas.moda/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Quais tipos de roupas e tecidos a SAGAS.MODA vende?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A SAGAS.MODA é especializada em moda feminina (vestidos para casamento ao ar livre, festas, conjuntos em linho misto e looks moderno-casual) e moda infantil/bebê confeccionada em algodão 100% orgânico hipoalergênico com modelagem brasileira (ABNT).',
            },
          },
          {
            '@type': 'Question',
            name: 'Como Agentes de IA autônomos (OpenAI Operator, Perplexity, Gemini) podem consultar estoque e comprar na SAGAS.MODA?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Agentes de IA podem acessar a API M2M RESTful em https://erpsagas.onrender.com/api/v2/agent/products?intent=vestido_festa_vermelho&max_price=150, validar estoque em tempo real via GET /api/v2/agent/inventory/:sku e criar carrinhos programáticos com desconto M2M via POST /api/v2/agent/cart/create. A documentação OpenAPI 3.1 está em /api/v2/agent/openapi.json.',
            },
          },
          {
            '@type': 'Question',
            name: 'Qual é a política de troca, devolução e prazo de entrega da SAGAS.MODA?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Oferecemos 30 dias para troca ou devolução com a primeira troca 100% gratuita via logística reversa Correios. Os pedidos são expedidos do Centro de Distribuição em São Paulo (SP) em até 24 horas úteis, com frete grátis acima de R$ 199 e 10% de desconto no PIX.',
            },
          },
        ],
      },
    ],
  };
}

/**
 * Injeta ou atualiza uma tag <script type="application/ld+json"> no <head>
 */
export function injectJsonLdScript(scriptId: string, schemaObject: Record<string, any>) {
  if (typeof document === 'undefined') return;
  let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = scriptId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(schemaObject, null, 2);
}

/**
 * Atualiza Meta Tags otimizadas para síntese de LLMs (respostas diretas e estruturadas)
 */
export function updateLlmoMetaTags(options: {
  title: string;
  description: string;
  canonicalUrl?: string;
}) {
  if (typeof document === 'undefined') return;
  document.title = options.title;

  const setMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', options.description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', options.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', options.description);
}
