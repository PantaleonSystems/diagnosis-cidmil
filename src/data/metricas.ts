/**
 * Catálogo do módulo Saúde — métricas 63 a 105 do framework Cidades MIL,
 * organizadas nos 5 pilares.
 *
 * Esta é a fonte única do catálogo: `scripts/gen-seed.ts` gera a migration
 * de seed a partir daqui, então o banco e o front nunca divergem.
 *
 * Nota sobre a métrica 100: o protótipo a listava duas vezes (Pilar 1 e
 * Pilar 4). Como uma métrica pertence a um único pilar, ela fica no Pilar 1
 * (Governança), onde é "Registro seguro e integrado de dados do cidadão".
 * Total: 43 métricas.
 */

export type TipoMetrica = 'percentual' | 'densidade' | 'faixa' | 'regua'

export interface CampoNumerico {
  /** chave dentro de respostas.dados_brutos */
  id: string
  label: string
}

/** [limiteSuperior, nota] — a primeira faixa cujo limite comporta o valor vence */
export type Faixa = [limite: number, nota: number]

export type ConfigMetrica =
  | { campos: [CampoNumerico, CampoNumerico] } // percentual: [total, parte]
  | { campos: [CampoNumerico, CampoNumerico]; por: number } // densidade
  | { campos: [CampoNumerico]; faixas: Faixa[]; faixaTxt: string } // faixa
  | { niveis: [string, string, string, string, string] } // régua 0–4

interface Base {
  numero: number
  titulo: string
  /** metodologia de busca do dado, exibida no card de coleta */
  dica: string
}

export type Metrica = Base &
  (
    | { tipo: 'percentual'; campos: [CampoNumerico, CampoNumerico] }
    | { tipo: 'densidade'; campos: [CampoNumerico, CampoNumerico]; por: number }
    | { tipo: 'faixa'; campos: [CampoNumerico]; faixas: Faixa[]; faixaTxt: string }
    | { tipo: 'regua'; niveis: [string, string, string, string, string] }
  )

export interface Pilar {
  numero: number
  nome: string
  /** rótulo curto para o radar e os mini-cards */
  curto: string
  descricao: string
  /** peso na soma ponderada do ISPS — os 5 somam 1.0 */
  peso: number
  cor: string
  central: string
  metricas: Metrica[]
}

export const MODULO_SAUDE = 'saude'

export const PILARES: Pilar[] = [
  {
    numero: 1,
    nome: 'Governança Participativa e Transparência',
    curto: 'Governança',
    descricao:
      'Como as decisões são tomadas e como o cidadão influencia a gestão da saúde.',
    peso: 0.35,
    cor: '#0A7C93',
    central: 'Participação na tomada de decisões (M101)',
    metricas: [
      {
        numero: 101,
        titulo: 'Participação da população nas decisões de saúde',
        tipo: 'percentual',
        campos: [
          { id: 'reunioes_total', label: 'Reuniões do Conselho de Saúde no ano' },
          { id: 'reunioes_comunidade', label: 'Reuniões com pauta vinda da comunidade' },
        ],
        dica: 'Percepção vira dado: percentual de pautas de origem comunitária.',
      },
      {
        numero: 99,
        titulo: 'Comitês de bioética ativos',
        tipo: 'faixa',
        campos: [{ id: 'comites', label: 'Número de comitês de bioética ativos' }],
        faixas: [
          [0, 0],
          [1, 1],
          [3, 2],
          [6, 3],
        ],
        faixaTxt: '0 / 1 / 2–3 / 4–6 / >6',
        dica: 'Contagem por faixas objetivas de comitês em atuação.',
      },
      {
        numero: 100,
        titulo: 'Registro seguro e integrado de dados do cidadão',
        tipo: 'regua',
        niveis: [
          'Dados dispersos, sem registro integrado',
          'Registros em papel ou sistemas desconectados',
          'Sistema eletrônico básico, sem integração sociodemográfica',
          'Sistema integrado com governança e anonimização',
          'Interoperabilidade total, blockchain, consentimento e análise em tempo real',
        ],
        dica: 'Rúbrica de maturidade — do dado disperso ao registro seguro e inteligente.',
      },
      {
        numero: 75,
        titulo: 'Plano anticrise para epidemias e pandemias',
        tipo: 'regua',
        niveis: [
          'Nenhum plano anticrise',
          'Plano genérico, desatualizado (+2 anos)',
          'Plano atualizado, com fluxos, mas sem simulações',
          'Plano detalhado por cenário, com recursos e testes',
          'Plano integrado a redes, comitê ativo, IA e comunicação MIL',
        ],
        dica: 'Rúbrica — existência e detalhamento do plano de contingência.',
      },
      {
        numero: 76,
        titulo: 'Canal unificado entre instituições de saúde',
        tipo: 'regua',
        niveis: [
          'Nenhum canal formal',
          'Comunicação por e-mail/telefone, sem padrão',
          'Plataforma básica, adesão parcial',
          'Plataforma oficial, adesão total, fluxos definidos',
          'Plataforma integrada com dados e inteligência analítica',
        ],
        dica: 'Rúbrica — grau de integração da comunicação institucional.',
      },
      {
        numero: 78,
        titulo: 'Mapa de doações e responsabilidade social em saúde',
        tipo: 'regua',
        niveis: [
          'Nenhum mapeamento',
          'Lista informal de parceiros conhecidos',
          'Cadastro anual, sem critérios claros',
          'Mapa georreferenciado com histórico de contribuições',
          'Plataforma que conecta demandas a doadores, com transparência',
        ],
        dica: 'Rúbrica — mapeamento de parceiros para ações sociais.',
      },
      {
        numero: 84,
        titulo: 'Canal oficial exclusivo entre instituições vinculadas',
        tipo: 'regua',
        niveis: [
          'Nenhum canal específico',
          'Canais informais sem governança',
          'Canal institucional definido, baixa adesão',
          'Canal com adesão obrigatória e fluxos',
          'Canal integrado com dados e apoio à decisão',
        ],
        dica: 'Rúbrica — canal padronizado entre instituições de saúde.',
      },
      {
        numero: 85,
        titulo: 'Canal unificado entre saúde e população',
        tipo: 'regua',
        niveis: [
          'Nenhum canal com a população',
          'Canais tradicionais com alta espera',
          'Canais digitais básicos, resposta em 48h',
          'Plataforma unificada, resposta em 24h',
          'Omnichannel com IA, acompanhamento e satisfação',
        ],
        dica: 'Rúbrica — comunicação de mão dupla com o cidadão.',
      },
      {
        numero: 102,
        titulo: 'Disponibilidade — cobertura de UBS por bairro (ONU)',
        tipo: 'percentual',
        campos: [
          { id: 'bairros_total', label: 'Número total de bairros/distritos' },
          { id: 'bairros_cobertos', label: 'Bairros com cobertura de UBS/hospital' },
        ],
        dica: 'Percentual de bairros com cobertura mínima de saúde.',
      },
      {
        numero: 103,
        titulo: 'Acessibilidade — barreiras física, econômica e informacional (ONU)',
        tipo: 'regua',
        niveis: [
          'Barreiras graves, serviços concentrados, sem gratuidade',
          'Acessibilidade física e econômica parciais',
          'Acessibilidade física (NBR 9050) e econômica (SUS), barreira de informação',
          'Acessibilidade plena para a maioria, transporte adequado',
          'Acesso garantido a todos os grupos, com tradução, intérpretes e MIL',
        ],
        dica: 'Rúbrica — eliminação de barreiras de acesso.',
      },
      {
        numero: 104,
        titulo: 'Aceitabilidade — respeito cultural e ético (ONU)',
        tipo: 'regua',
        niveis: [
          'Serviços padronizados, denúncias de discriminação',
          'Atenção a algumas diversidades em casos isolados',
          'Protocolos de humanização em algumas unidades',
          'Protocolos em todas as unidades, com treinamento',
          'Modelo que integra saberes tradicionais, com respeito pleno',
        ],
        dica: 'Rúbrica — respeito à cultura, religião e tradições.',
      },
      {
        numero: 105,
        titulo: 'Qualidade — pessoal, insumos e saneamento (ONU)',
        tipo: 'regua',
        niveis: [
          'Falta crônica de insumos e qualificação',
          'Medicamentos básicos, desabastecimento frequente',
          'Insumos essenciais regulares, saneamento com falhas',
          'Insumos completos, equipes especializadas, água 100%',
          'Certificação (ONA/JCI), prontuário eletrônico, rastreio e MIL',
        ],
        dica: 'Rúbrica — padrões, certificações e condições sanitárias.',
      },
    ],
  },
  {
    numero: 2,
    nome: 'Engajamento Comunitário e Cocriação',
    curto: 'Engajamento',
    descricao: 'Participação ativa da população em ações e na coleta de dados.',
    peso: 0.25,
    cor: '#0CA5C0',
    central: 'Participação de cidadãos e associações (M96)',
    metricas: [
      {
        numero: 96,
        titulo: 'Associações participando da coleta de dados',
        tipo: 'percentual',
        campos: [
          { id: 'bairros_total', label: 'Número total de bairros' },
          { id: 'bairros_associacoes', label: 'Bairros com associações ativas na coleta' },
        ],
        dica: 'Percentual de bairros com associações ativas na vigilância.',
      },
      {
        numero: 64,
        titulo: 'Responsabilidade social com populações vulneráveis',
        tipo: 'percentual',
        campos: [
          { id: 'instituicoes_total', label: 'Total de instituições de saúde' },
          {
            id: 'instituicoes_projetos',
            label: 'Instituições com projetos p/ grupos vulneráveis',
          },
        ],
        dica: 'Percentual de instituições com projetos sociais estruturados.',
      },
      {
        numero: 74,
        titulo: 'Pesquisa epidemiológica sistemática',
        tipo: 'regua',
        niveis: [
          'Sem pesquisa sistemática',
          'Coleta anual básica, defasagem +1 ano',
          'Coleta semestral, com tabulação',
          'Coleta trimestral, georreferenciada',
          'Coleta contínua em tempo real, com IA e painéis públicos',
        ],
        dica: 'Rúbrica — regularidade e abrangência da coleta epidemiológica.',
      },
      {
        numero: 86,
        titulo: 'Medicina preventiva com a comunidade',
        tipo: 'regua',
        niveis: [
          'Nenhuma ação preventiva comunitária',
          'Ações pontuais (1–2 por ano)',
          'Ações trimestrais regulares',
          'Ações mensais por demanda comunitária',
          'Programa contínuo com equipe dedicada e MIL',
        ],
        dica: 'Rúbrica — frequência das ações de medicina preventiva.',
      },
      {
        numero: 87,
        titulo: 'Controle de assintomáticos em epidemias',
        tipo: 'regua',
        niveis: [
          'Nenhum programa para assintomáticos',
          'Testagem aleatória, sem rastreamento',
          'Rastreamento ativo em grupos de risco',
          'Testagem periódica em áreas de transmissão',
          'Estratégia digital integrada em tempo real',
        ],
        dica: 'Rúbrica — estratégias para identificar casos assintomáticos.',
      },
      {
        numero: 93,
        titulo: 'Pesquisas epidemiológicas com IA e novas tecnologias',
        tipo: 'regua',
        niveis: [
          'Métodos tradicionais (entrevistas manuais)',
          'Formulários digitais',
          'Aplicativos móveis com integração básica',
          'Aplicativos com IA para triagem e predição',
          'Ecossistema completo (sensores, wearables, geolocalização)',
        ],
        dica: 'Rúbrica — uso de tecnologia na coleta epidemiológica.',
      },
      {
        numero: 94,
        titulo: 'Jogos e esportes para coleta/disseminação',
        tipo: 'regua',
        niveis: [
          'Nenhum uso de jogos/gamificação',
          'Iniciativas isoladas, sem continuidade',
          'Ao menos 1 jogo/app em uso regular',
          'Múltiplos jogos com integração parcial',
          'Ecossistema consolidado de gamificação com IA',
        ],
        dica: 'Rúbrica — uso de tecnologias lúdicas em saúde.',
      },
      {
        numero: 97,
        titulo: 'Inovações em saúde geradas pela cidade',
        tipo: 'faixa',
        campos: [{ id: 'inovacoes', label: 'Número de inovações em saúde registradas' }],
        faixas: [
          [0, 0],
          [3, 1],
          [10, 2],
          [20, 3],
        ],
        faixaTxt: '0 / 1–3 / 4–10 / 11–20 / >20',
        dica: 'Contagem por faixas de inovações desenvolvidas na cidade.',
      },
      {
        numero: 98,
        titulo: 'Inovações que usam tecnologias emergentes',
        tipo: 'percentual',
        campos: [
          { id: 'inovacoes_total', label: 'Total de inovações em saúde' },
          {
            id: 'inovacoes_emergentes',
            label: 'Inovações que usam IA/IoT/blockchain/biotec',
          },
        ],
        dica: 'Percentual de inovações que empregam novas tecnologias.',
      },
    ],
  },
  {
    numero: 3,
    nome: 'Comunicação, Letramento MIL e Prevenção',
    curto: 'Comunicação',
    descricao:
      'Capacitação crítica para lidar com informação e desinformação em saúde.',
    peso: 0.2,
    cor: '#12B5CE',
    central: 'Campanhas de saúde preventiva (M63)',
    metricas: [
      {
        numero: 63,
        titulo: 'Campanhas preventivas e combate a fake news',
        tipo: 'percentual',
        campos: [
          { id: 'instituicoes_total', label: 'Total de instituições de saúde' },
          { id: 'instituicoes_campanhas', label: 'Instituições com campanhas estruturadas' },
        ],
        dica: 'Percentual de instituições com campanhas de informação segura.',
      },
      {
        numero: 70,
        titulo: 'Profissionais de saúde capacitados em MIL',
        tipo: 'percentual',
        campos: [
          { id: 'prof_total', label: 'Total de profissionais de saúde' },
          { id: 'prof_mil', label: 'Profissionais capacitados em MIL (2 anos)' },
        ],
        dica: 'A nota vem da proporção de capacitados — não de uma opinião.',
      },
      {
        numero: 71,
        titulo: 'Oferta de alimentos saudáveis e diversos',
        tipo: 'regua',
        niveis: [
          'Predomínio de ultraprocessados, sem oferta saudável',
          'Oferta restrita a 1–2 pontos',
          'Oferta regular, sem incentivo público',
          'Oferta ampla com incentivo municipal',
          'Programa de segurança alimentar com rastreio e educação',
        ],
        dica: 'Rúbrica — diversidade e incentivo à alimentação saudável.',
      },
      {
        numero: 72,
        titulo: 'Sistema/IA contra desinformação em saúde',
        tipo: 'regua',
        niveis: [
          'Nenhuma ferramenta contra fake news',
          'Canal de denúncias, sem sistematização',
          'Plataforma básica de monitoramento de redes',
          'Sistema com IA para detectar padrões e responder',
          'Ecossistema com IA preditiva, verificadores e resposta rápida',
        ],
        dica: 'Rúbrica — combate tecnológico à desinformação.',
      },
      {
        numero: 83,
        titulo: 'Manuais e guias de saúde preventiva',
        tipo: 'regua',
        niveis: [
          'Nenhum manual disponível',
          'Manuais desatualizados (+2 anos)',
          'Manuais atualizados, só impresso restrito',
          'Manuais em múltiplos formatos, linguagem acessível',
          'Guias interativos com vídeo, MIL e tradução',
        ],
        dica: 'Rúbrica — disponibilidade de materiais educativos.',
      },
      {
        numero: 89,
        titulo: 'Manuais de saúde mental (teletrabalho/isolamento)',
        tipo: 'regua',
        niveis: [
          'Nenhum manual ou diretriz',
          'Materiais genéricos, desatualizados',
          'Guias específicos em formato digital',
          'Guias divulgados, com campanhas e apoio',
          'Sistema integrado com suporte remoto e apps de bem-estar',
        ],
        dica: 'Rúbrica — apoio à saúde mental da população.',
      },
      {
        numero: 95,
        titulo: 'Acesso à internet e ao sistema de saúde online',
        tipo: 'regua',
        niveis: [
          '<10% da população com acesso',
          '10%–30% com acesso',
          '30%–50% com acesso',
          '50%–75% com acesso',
          '>75% com acesso e uso ativo (telemedicina, agendamento)',
        ],
        dica: 'Rúbrica — penetração do acesso digital à saúde.',
      },
    ],
  },
  {
    numero: 4,
    nome: 'Infraestrutura, Inovação e Acesso Equitativo',
    curto: 'Infraestrutura',
    descricao: 'Condições materiais, tecnológicas e logísticas da saúde.',
    peso: 0.15,
    cor: '#39C4D8',
    central: 'Qualidade — padrão ONU (M105)',
    metricas: [
      {
        numero: 65,
        titulo: 'Espaços para prática de atividade física',
        tipo: 'densidade',
        campos: [
          { id: 'populacao', label: 'População total da cidade' },
          { id: 'espacos', label: 'Espaços de atividade física' },
        ],
        por: 10000,
        dica: 'Densidade por 10 mil habitantes, para comparar cidades.',
      },
      {
        numero: 66,
        titulo: 'Espaços esportivos gratuitos',
        tipo: 'percentual',
        campos: [
          { id: 'espacos_total', label: 'Total de espaços esportivos' },
          { id: 'espacos_gratuitos', label: 'Espaços totalmente gratuitos' },
        ],
        dica: 'Percentual de espaços oferecidos sem custo.',
      },
      {
        numero: 67,
        titulo: 'Medicamentos gratuitos disponibilizados',
        tipo: 'regua',
        niveis: [
          'Nenhum medicamento gratuito',
          'Só programa básico, estoque instável',
          'Lista básica regular + programa especial',
          'Lista ampliada (+50 itens), estoque estável',
          'Lista completa, rastreio e entrega domiciliar',
        ],
        dica: 'Rúbrica — cobertura da farmácia básica gratuita.',
      },
      {
        numero: 68,
        titulo: 'Startups focadas em saúde',
        tipo: 'faixa',
        campos: [{ id: 'startups', label: 'Número de startups de saúde' }],
        faixas: [
          [0, 0],
          [3, 1],
          [10, 2],
          [25, 3],
        ],
        faixaTxt: '0 / 1–3 / 4–10 / 11–25 / >25',
        dica: 'Contagem por faixas do ecossistema de inovação.',
      },
      {
        numero: 69,
        titulo: 'Startups de alimentação saudável',
        tipo: 'faixa',
        campos: [{ id: 'startups_alimentacao', label: 'Número de startups de alimentação saudável' }],
        faixas: [
          [0, 0],
          [2, 1],
          [5, 2],
          [10, 3],
        ],
        faixaTxt: '0 / 1–2 / 3–5 / 6–10 / >10',
        dica: 'Contagem por faixas de startups do segmento.',
      },
      {
        numero: 79,
        titulo: 'IA e blockchain no rastreio de insumos',
        tipo: 'regua',
        niveis: [
          'Nenhum uso de IA ou blockchain',
          'IA isolada para estoque (sem blockchain)',
          'Blockchain para medicamentos de alto custo',
          'IA + blockchain em toda a cadeia de insumos',
          'Rastreio total com smart contracts e transparência pública',
        ],
        dica: 'Rúbrica — tecnologia na cadeia de insumos e medicamentos.',
      },
      {
        numero: 81,
        titulo: 'Instituições de pesquisa interconectadas com IA',
        tipo: 'regua',
        niveis: [
          'Nenhuma conexão ou cooperação',
          'Conexão nacional com 1–2 instituições',
          'Conexão nacional ampla + 1 parceria internacional',
          'Múltiplas parcerias internacionais com IA',
          'Rede consolidada, centros de excelência e dados compartilhados',
        ],
        dica: 'Rúbrica — conexão da pesquisa local com redes de IA.',
      },
      {
        numero: 82,
        titulo: 'Controle da poluição do ar em fábricas',
        tipo: 'percentual',
        campos: [
          { id: 'fabricas_total', label: 'Total de fábricas na cidade' },
          { id: 'fabricas_controle', label: 'Fábricas com controle de poluição' },
        ],
        dica: 'Percentual de fábricas com sistemas de controle.',
      },
      {
        numero: 90,
        titulo: 'Gestão de resíduos sanitários',
        tipo: 'regua',
        niveis: [
          'Nenhuma gestão, descarte inadequado',
          'Coleta regular, sem segregação',
          'Segregação e coleta seletiva',
          'Tratamento interno com rastreabilidade',
          'Gestão integrada com logística reversa e IA',
        ],
        dica: 'Rúbrica — gerenciamento de resíduos de saúde.',
      },
      {
        numero: 91,
        titulo: 'Medição diária da poluição do ar',
        tipo: 'faixa',
        campos: [{ id: 'estacoes', label: 'Estações de medição da qualidade do ar' }],
        faixas: [
          [0, 0],
          [1, 1],
          [3, 2],
          [5, 3],
        ],
        faixaTxt: '0 / 1 / 2–3 / 4–5 / >5',
        dica: 'Contagem por faixas de estações de monitoramento.',
      },
      {
        numero: 92,
        titulo: 'Atenção integral a infectados (pós-epidemia)',
        tipo: 'regua',
        niveis: [
          'Nenhum plano',
          'Só cuidado agudo, sem pós-alta',
          'Protocolos de alta com orientações básicas',
          'Acompanhamento multidisciplinar por até 6 meses',
          'Plano longitudinal com telemonitoramento e suporte comunitário',
        ],
        dica: 'Rúbrica — cuidado físico e psicológico pós-infecção.',
      },
    ],
  },
  {
    numero: 5,
    nome: 'Planejamento, Monitoramento e Impacto',
    curto: 'Planejamento',
    descricao: 'Capacidade de antecipar problemas e medir resultados.',
    peso: 0.05,
    cor: '#5FD0E0',
    central: 'Integração e impacto mensurável',
    metricas: [
      {
        numero: 73,
        titulo: 'Processamento integrado de informações de saúde',
        tipo: 'regua',
        niveis: [
          'Dados em silos',
          'Integração parcial, sem padrão',
          'Dados padronizados, sem tempo real',
          'Fluxo automatizado com painéis',
          'Interoperabilidade com data lakes e análise preditiva',
        ],
        dica: 'Rúbrica — integração dos sistemas de informação.',
      },
      {
        numero: 77,
        titulo: 'Integração hospital–comunidade',
        tipo: 'regua',
        niveis: [
          'Dados totalmente separados',
          'Compartilhamento ocasional em papel',
          'Consulta cruzada limitada',
          'Integração parcial por território',
          'Data warehouse único com score de vulnerabilidade',
        ],
        dica: 'Rúbrica — integração de dados hospitalares e comunitários.',
      },
      {
        numero: 80,
        titulo: 'Planejamento epidemiológico preventivo',
        tipo: 'regua',
        niveis: [
          'Nenhum planejamento',
          'Ações reativas, sem plano formal',
          'Plano básico (combate a endemias)',
          'Plano detalhado com monitoramento contínuo',
          'Plano integrado com geotecnologia e participação cidadã',
        ],
        dica: 'Rúbrica — planejamento de prevenção epidemiológica.',
      },
      {
        numero: 88,
        titulo: 'Redes neurais aplicadas ao diagnóstico',
        tipo: 'regua',
        niveis: [
          'Nenhum estudo ou implementação',
          'Estudos preliminares teóricos',
          'Projetos piloto em andamento',
          'Piloto concluído, em ampliação',
          'IA em produção para múltiplos diagnósticos com bioética',
        ],
        dica: 'Rúbrica — maturidade da IA de apoio ao diagnóstico.',
      },
    ],
  },
]

export interface ModuloCatalogo {
  id: string
  nome: string
  icone: string
  ativo: boolean
}

/** As 13 áreas do framework. Só Saúde está ativa nesta fase. */
export const MODULOS: ModuloCatalogo[] = [
  { id: 'saude', nome: 'Saúde', icone: '✚', ativo: true },
  { id: 'educacao', nome: 'Educação', icone: '✎', ativo: false },
  { id: 'gov', nome: 'Prefeitura e Cidadania', icone: '⌂', ativo: false },
  { id: 'bibliotecas', nome: 'Bibliotecas', icone: '📚', ativo: false },
  { id: 'mobilidade', nome: 'Vias e Mobilidade', icone: '🚦', ativo: false },
  { id: 'cultura', nome: 'Cultura, Esporte e Lazer', icone: '★', ativo: false },
  { id: 'associacoes', nome: 'Associações e ONGs', icone: '⭑', ativo: false },
  { id: 'midias', nome: 'Mídias e Comunicação', icone: '📡', ativo: false },
  { id: 'ia', nome: 'IA, Startups e Digital', icone: '⚡', ativo: false },
  { id: 'seguranca', nome: 'Segurança', icone: '🛡', ativo: false },
  { id: 'ambiente', nome: 'Meio Ambiente', icone: '🌿', ativo: false },
  { id: 'vulneraveis', nome: 'Grupos Vulneráveis', icone: '☂', ativo: false },
  { id: 'integracao', nome: 'Métricas de Integração', icone: '⌘', ativo: false },
]

/** Todas as métricas do módulo, em ordem de pilar. */
export const METRICAS: Metrica[] = PILARES.flatMap((p) => p.metricas)

export const TOTAL_METRICAS = METRICAS.length
