-- ============================================================================
-- Seed do catálogo — GERADO por scripts/gen-seed.ts. Não edite à mão.
-- Módulo Saúde: 5 pilares, 43 métricas (63–105).
-- Idempotente: pode ser reaplicado sem duplicar.
-- ============================================================================

-- Módulos do framework
insert into public.modulos (id, nome, icone, ativo, ordem) values
  ('saude', 'Saúde', '✚', true, 0),
  ('educacao', 'Educação', '✎', false, 1),
  ('gov', 'Prefeitura e Cidadania', '⌂', false, 2),
  ('bibliotecas', 'Bibliotecas', '📚', false, 3),
  ('mobilidade', 'Vias e Mobilidade', '🚦', false, 4),
  ('cultura', 'Cultura, Esporte e Lazer', '★', false, 5),
  ('associacoes', 'Associações e ONGs', '⭑', false, 6),
  ('midias', 'Mídias e Comunicação', '📡', false, 7),
  ('ia', 'IA, Startups e Digital', '⚡', false, 8),
  ('seguranca', 'Segurança', '🛡', false, 9),
  ('ambiente', 'Meio Ambiente', '🌿', false, 10),
  ('vulneraveis', 'Grupos Vulneráveis', '☂', false, 11),
  ('integracao', 'Métricas de Integração', '⌘', false, 12)
on conflict (id) do update set
  nome = excluded.nome, icone = excluded.icone,
  ativo = excluded.ativo, ordem = excluded.ordem;

-- Pilares do módulo Saúde
insert into public.pilares (modulo_id, numero, nome, descricao, peso, cor, central) values
  ('saude', 1, 'Governança Participativa e Transparência', 'Como as decisões são tomadas e como o cidadão influencia a gestão da saúde.', 0.35, '#0A7C93', 'Participação na tomada de decisões (M101)'),
  ('saude', 2, 'Engajamento Comunitário e Cocriação', 'Participação ativa da população em ações e na coleta de dados.', 0.25, '#0CA5C0', 'Participação de cidadãos e associações (M96)'),
  ('saude', 3, 'Comunicação, Letramento MIL e Prevenção', 'Capacitação crítica para lidar com informação e desinformação em saúde.', 0.2, '#12B5CE', 'Campanhas de saúde preventiva (M63)'),
  ('saude', 4, 'Infraestrutura, Inovação e Acesso Equitativo', 'Condições materiais, tecnológicas e logísticas da saúde.', 0.15, '#39C4D8', 'Qualidade — padrão ONU (M105)'),
  ('saude', 5, 'Planejamento, Monitoramento e Impacto', 'Capacidade de antecipar problemas e medir resultados.', 0.05, '#5FD0E0', 'Integração e impacto mensurável')
on conflict (modulo_id, numero) do update set
  nome = excluded.nome, descricao = excluded.descricao,
  peso = excluded.peso, cor = excluded.cor, central = excluded.central;

-- Métricas
-- Pilar 1 — Governança Participativa e Transparência (12)
insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)
select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem
from public.pilares p, (values
  (101, 'Participação da população nas decisões de saúde', 'percentual', '{"campos":[{"id":"reunioes_total","label":"Reuniões do Conselho de Saúde no ano"},{"id":"reunioes_comunidade","label":"Reuniões com pauta vinda da comunidade"}]}'::jsonb, 'Percepção vira dado: percentual de pautas de origem comunitária.', 0),
  (99, 'Comitês de bioética ativos', 'faixa', '{"campos":[{"id":"comites","label":"Número de comitês de bioética ativos"}],"faixas":[[0,0],[1,1],[3,2],[6,3]],"faixaTxt":"0 / 1 / 2–3 / 4–6 / >6"}'::jsonb, 'Contagem por faixas objetivas de comitês em atuação.', 1),
  (100, 'Registro seguro e integrado de dados do cidadão', 'regua', '{"niveis":["Dados dispersos, sem registro integrado","Registros em papel ou sistemas desconectados","Sistema eletrônico básico, sem integração sociodemográfica","Sistema integrado com governança e anonimização","Interoperabilidade total, blockchain, consentimento e análise em tempo real"]}'::jsonb, 'Rúbrica de maturidade — do dado disperso ao registro seguro e inteligente.', 2),
  (75, 'Plano anticrise para epidemias e pandemias', 'regua', '{"niveis":["Nenhum plano anticrise","Plano genérico, desatualizado (+2 anos)","Plano atualizado, com fluxos, mas sem simulações","Plano detalhado por cenário, com recursos e testes","Plano integrado a redes, comitê ativo, IA e comunicação MIL"]}'::jsonb, 'Rúbrica — existência e detalhamento do plano de contingência.', 3),
  (76, 'Canal unificado entre instituições de saúde', 'regua', '{"niveis":["Nenhum canal formal","Comunicação por e-mail/telefone, sem padrão","Plataforma básica, adesão parcial","Plataforma oficial, adesão total, fluxos definidos","Plataforma integrada com dados e inteligência analítica"]}'::jsonb, 'Rúbrica — grau de integração da comunicação institucional.', 4),
  (78, 'Mapa de doações e responsabilidade social em saúde', 'regua', '{"niveis":["Nenhum mapeamento","Lista informal de parceiros conhecidos","Cadastro anual, sem critérios claros","Mapa georreferenciado com histórico de contribuições","Plataforma que conecta demandas a doadores, com transparência"]}'::jsonb, 'Rúbrica — mapeamento de parceiros para ações sociais.', 5),
  (84, 'Canal oficial exclusivo entre instituições vinculadas', 'regua', '{"niveis":["Nenhum canal específico","Canais informais sem governança","Canal institucional definido, baixa adesão","Canal com adesão obrigatória e fluxos","Canal integrado com dados e apoio à decisão"]}'::jsonb, 'Rúbrica — canal padronizado entre instituições de saúde.', 6),
  (85, 'Canal unificado entre saúde e população', 'regua', '{"niveis":["Nenhum canal com a população","Canais tradicionais com alta espera","Canais digitais básicos, resposta em 48h","Plataforma unificada, resposta em 24h","Omnichannel com IA, acompanhamento e satisfação"]}'::jsonb, 'Rúbrica — comunicação de mão dupla com o cidadão.', 7),
  (102, 'Disponibilidade — cobertura de UBS por bairro (ONU)', 'percentual', '{"campos":[{"id":"bairros_total","label":"Número total de bairros/distritos"},{"id":"bairros_cobertos","label":"Bairros com cobertura de UBS/hospital"}]}'::jsonb, 'Percentual de bairros com cobertura mínima de saúde.', 8),
  (103, 'Acessibilidade — barreiras física, econômica e informacional (ONU)', 'regua', '{"niveis":["Barreiras graves, serviços concentrados, sem gratuidade","Acessibilidade física e econômica parciais","Acessibilidade física (NBR 9050) e econômica (SUS), barreira de informação","Acessibilidade plena para a maioria, transporte adequado","Acesso garantido a todos os grupos, com tradução, intérpretes e MIL"]}'::jsonb, 'Rúbrica — eliminação de barreiras de acesso.', 9),
  (104, 'Aceitabilidade — respeito cultural e ético (ONU)', 'regua', '{"niveis":["Serviços padronizados, denúncias de discriminação","Atenção a algumas diversidades em casos isolados","Protocolos de humanização em algumas unidades","Protocolos em todas as unidades, com treinamento","Modelo que integra saberes tradicionais, com respeito pleno"]}'::jsonb, 'Rúbrica — respeito à cultura, religião e tradições.', 10),
  (105, 'Qualidade — pessoal, insumos e saneamento (ONU)', 'regua', '{"niveis":["Falta crônica de insumos e qualificação","Medicamentos básicos, desabastecimento frequente","Insumos essenciais regulares, saneamento com falhas","Insumos completos, equipes especializadas, água 100%","Certificação (ONA/JCI), prontuário eletrônico, rastreio e MIL"]}'::jsonb, 'Rúbrica — padrões, certificações e condições sanitárias.', 11)
) as v(numero, titulo, tipo, config, dica, ordem)
where p.modulo_id = 'saude' and p.numero = 1
on conflict (numero) do update set
  pilar_id = excluded.pilar_id, titulo = excluded.titulo,
  tipo = excluded.tipo, config = excluded.config,
  dica = excluded.dica, ordem = excluded.ordem;

-- Pilar 2 — Engajamento Comunitário e Cocriação (9)
insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)
select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem
from public.pilares p, (values
  (96, 'Associações participando da coleta de dados', 'percentual', '{"campos":[{"id":"bairros_total","label":"Número total de bairros"},{"id":"bairros_associacoes","label":"Bairros com associações ativas na coleta"}]}'::jsonb, 'Percentual de bairros com associações ativas na vigilância.', 0),
  (64, 'Responsabilidade social com populações vulneráveis', 'percentual', '{"campos":[{"id":"instituicoes_total","label":"Total de instituições de saúde"},{"id":"instituicoes_projetos","label":"Instituições com projetos p/ grupos vulneráveis"}]}'::jsonb, 'Percentual de instituições com projetos sociais estruturados.', 1),
  (74, 'Pesquisa epidemiológica sistemática', 'regua', '{"niveis":["Sem pesquisa sistemática","Coleta anual básica, defasagem +1 ano","Coleta semestral, com tabulação","Coleta trimestral, georreferenciada","Coleta contínua em tempo real, com IA e painéis públicos"]}'::jsonb, 'Rúbrica — regularidade e abrangência da coleta epidemiológica.', 2),
  (86, 'Medicina preventiva com a comunidade', 'regua', '{"niveis":["Nenhuma ação preventiva comunitária","Ações pontuais (1–2 por ano)","Ações trimestrais regulares","Ações mensais por demanda comunitária","Programa contínuo com equipe dedicada e MIL"]}'::jsonb, 'Rúbrica — frequência das ações de medicina preventiva.', 3),
  (87, 'Controle de assintomáticos em epidemias', 'regua', '{"niveis":["Nenhum programa para assintomáticos","Testagem aleatória, sem rastreamento","Rastreamento ativo em grupos de risco","Testagem periódica em áreas de transmissão","Estratégia digital integrada em tempo real"]}'::jsonb, 'Rúbrica — estratégias para identificar casos assintomáticos.', 4),
  (93, 'Pesquisas epidemiológicas com IA e novas tecnologias', 'regua', '{"niveis":["Métodos tradicionais (entrevistas manuais)","Formulários digitais","Aplicativos móveis com integração básica","Aplicativos com IA para triagem e predição","Ecossistema completo (sensores, wearables, geolocalização)"]}'::jsonb, 'Rúbrica — uso de tecnologia na coleta epidemiológica.', 5),
  (94, 'Jogos e esportes para coleta/disseminação', 'regua', '{"niveis":["Nenhum uso de jogos/gamificação","Iniciativas isoladas, sem continuidade","Ao menos 1 jogo/app em uso regular","Múltiplos jogos com integração parcial","Ecossistema consolidado de gamificação com IA"]}'::jsonb, 'Rúbrica — uso de tecnologias lúdicas em saúde.', 6),
  (97, 'Inovações em saúde geradas pela cidade', 'faixa', '{"campos":[{"id":"inovacoes","label":"Número de inovações em saúde registradas"}],"faixas":[[0,0],[3,1],[10,2],[20,3]],"faixaTxt":"0 / 1–3 / 4–10 / 11–20 / >20"}'::jsonb, 'Contagem por faixas de inovações desenvolvidas na cidade.', 7),
  (98, 'Inovações que usam tecnologias emergentes', 'percentual', '{"campos":[{"id":"inovacoes_total","label":"Total de inovações em saúde"},{"id":"inovacoes_emergentes","label":"Inovações que usam IA/IoT/blockchain/biotec"}]}'::jsonb, 'Percentual de inovações que empregam novas tecnologias.', 8)
) as v(numero, titulo, tipo, config, dica, ordem)
where p.modulo_id = 'saude' and p.numero = 2
on conflict (numero) do update set
  pilar_id = excluded.pilar_id, titulo = excluded.titulo,
  tipo = excluded.tipo, config = excluded.config,
  dica = excluded.dica, ordem = excluded.ordem;

-- Pilar 3 — Comunicação, Letramento MIL e Prevenção (7)
insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)
select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem
from public.pilares p, (values
  (63, 'Campanhas preventivas e combate a fake news', 'percentual', '{"campos":[{"id":"instituicoes_total","label":"Total de instituições de saúde"},{"id":"instituicoes_campanhas","label":"Instituições com campanhas estruturadas"}]}'::jsonb, 'Percentual de instituições com campanhas de informação segura.', 0),
  (70, 'Profissionais de saúde capacitados em MIL', 'percentual', '{"campos":[{"id":"prof_total","label":"Total de profissionais de saúde"},{"id":"prof_mil","label":"Profissionais capacitados em MIL (2 anos)"}]}'::jsonb, 'A nota vem da proporção de capacitados — não de uma opinião.', 1),
  (71, 'Oferta de alimentos saudáveis e diversos', 'regua', '{"niveis":["Predomínio de ultraprocessados, sem oferta saudável","Oferta restrita a 1–2 pontos","Oferta regular, sem incentivo público","Oferta ampla com incentivo municipal","Programa de segurança alimentar com rastreio e educação"]}'::jsonb, 'Rúbrica — diversidade e incentivo à alimentação saudável.', 2),
  (72, 'Sistema/IA contra desinformação em saúde', 'regua', '{"niveis":["Nenhuma ferramenta contra fake news","Canal de denúncias, sem sistematização","Plataforma básica de monitoramento de redes","Sistema com IA para detectar padrões e responder","Ecossistema com IA preditiva, verificadores e resposta rápida"]}'::jsonb, 'Rúbrica — combate tecnológico à desinformação.', 3),
  (83, 'Manuais e guias de saúde preventiva', 'regua', '{"niveis":["Nenhum manual disponível","Manuais desatualizados (+2 anos)","Manuais atualizados, só impresso restrito","Manuais em múltiplos formatos, linguagem acessível","Guias interativos com vídeo, MIL e tradução"]}'::jsonb, 'Rúbrica — disponibilidade de materiais educativos.', 4),
  (89, 'Manuais de saúde mental (teletrabalho/isolamento)', 'regua', '{"niveis":["Nenhum manual ou diretriz","Materiais genéricos, desatualizados","Guias específicos em formato digital","Guias divulgados, com campanhas e apoio","Sistema integrado com suporte remoto e apps de bem-estar"]}'::jsonb, 'Rúbrica — apoio à saúde mental da população.', 5),
  (95, 'Acesso à internet e ao sistema de saúde online', 'regua', '{"niveis":["<10% da população com acesso","10%–30% com acesso","30%–50% com acesso","50%–75% com acesso",">75% com acesso e uso ativo (telemedicina, agendamento)"]}'::jsonb, 'Rúbrica — penetração do acesso digital à saúde.', 6)
) as v(numero, titulo, tipo, config, dica, ordem)
where p.modulo_id = 'saude' and p.numero = 3
on conflict (numero) do update set
  pilar_id = excluded.pilar_id, titulo = excluded.titulo,
  tipo = excluded.tipo, config = excluded.config,
  dica = excluded.dica, ordem = excluded.ordem;

-- Pilar 4 — Infraestrutura, Inovação e Acesso Equitativo (11)
insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)
select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem
from public.pilares p, (values
  (65, 'Espaços para prática de atividade física', 'densidade', '{"campos":[{"id":"populacao","label":"População total da cidade"},{"id":"espacos","label":"Espaços de atividade física"}],"por":10000}'::jsonb, 'Densidade por 10 mil habitantes, para comparar cidades.', 0),
  (66, 'Espaços esportivos gratuitos', 'percentual', '{"campos":[{"id":"espacos_total","label":"Total de espaços esportivos"},{"id":"espacos_gratuitos","label":"Espaços totalmente gratuitos"}]}'::jsonb, 'Percentual de espaços oferecidos sem custo.', 1),
  (67, 'Medicamentos gratuitos disponibilizados', 'regua', '{"niveis":["Nenhum medicamento gratuito","Só programa básico, estoque instável","Lista básica regular + programa especial","Lista ampliada (+50 itens), estoque estável","Lista completa, rastreio e entrega domiciliar"]}'::jsonb, 'Rúbrica — cobertura da farmácia básica gratuita.', 2),
  (68, 'Startups focadas em saúde', 'faixa', '{"campos":[{"id":"startups","label":"Número de startups de saúde"}],"faixas":[[0,0],[3,1],[10,2],[25,3]],"faixaTxt":"0 / 1–3 / 4–10 / 11–25 / >25"}'::jsonb, 'Contagem por faixas do ecossistema de inovação.', 3),
  (69, 'Startups de alimentação saudável', 'faixa', '{"campos":[{"id":"startups_alimentacao","label":"Número de startups de alimentação saudável"}],"faixas":[[0,0],[2,1],[5,2],[10,3]],"faixaTxt":"0 / 1–2 / 3–5 / 6–10 / >10"}'::jsonb, 'Contagem por faixas de startups do segmento.', 4),
  (79, 'IA e blockchain no rastreio de insumos', 'regua', '{"niveis":["Nenhum uso de IA ou blockchain","IA isolada para estoque (sem blockchain)","Blockchain para medicamentos de alto custo","IA + blockchain em toda a cadeia de insumos","Rastreio total com smart contracts e transparência pública"]}'::jsonb, 'Rúbrica — tecnologia na cadeia de insumos e medicamentos.', 5),
  (81, 'Instituições de pesquisa interconectadas com IA', 'regua', '{"niveis":["Nenhuma conexão ou cooperação","Conexão nacional com 1–2 instituições","Conexão nacional ampla + 1 parceria internacional","Múltiplas parcerias internacionais com IA","Rede consolidada, centros de excelência e dados compartilhados"]}'::jsonb, 'Rúbrica — conexão da pesquisa local com redes de IA.', 6),
  (82, 'Controle da poluição do ar em fábricas', 'percentual', '{"campos":[{"id":"fabricas_total","label":"Total de fábricas na cidade"},{"id":"fabricas_controle","label":"Fábricas com controle de poluição"}]}'::jsonb, 'Percentual de fábricas com sistemas de controle.', 7),
  (90, 'Gestão de resíduos sanitários', 'regua', '{"niveis":["Nenhuma gestão, descarte inadequado","Coleta regular, sem segregação","Segregação e coleta seletiva","Tratamento interno com rastreabilidade","Gestão integrada com logística reversa e IA"]}'::jsonb, 'Rúbrica — gerenciamento de resíduos de saúde.', 8),
  (91, 'Medição diária da poluição do ar', 'faixa', '{"campos":[{"id":"estacoes","label":"Estações de medição da qualidade do ar"}],"faixas":[[0,0],[1,1],[3,2],[5,3]],"faixaTxt":"0 / 1 / 2–3 / 4–5 / >5"}'::jsonb, 'Contagem por faixas de estações de monitoramento.', 9),
  (92, 'Atenção integral a infectados (pós-epidemia)', 'regua', '{"niveis":["Nenhum plano","Só cuidado agudo, sem pós-alta","Protocolos de alta com orientações básicas","Acompanhamento multidisciplinar por até 6 meses","Plano longitudinal com telemonitoramento e suporte comunitário"]}'::jsonb, 'Rúbrica — cuidado físico e psicológico pós-infecção.', 10)
) as v(numero, titulo, tipo, config, dica, ordem)
where p.modulo_id = 'saude' and p.numero = 4
on conflict (numero) do update set
  pilar_id = excluded.pilar_id, titulo = excluded.titulo,
  tipo = excluded.tipo, config = excluded.config,
  dica = excluded.dica, ordem = excluded.ordem;

-- Pilar 5 — Planejamento, Monitoramento e Impacto (4)
insert into public.metricas (pilar_id, numero, titulo, tipo, config, dica, ordem)
select p.id, v.numero, v.titulo, v.tipo, v.config, v.dica, v.ordem
from public.pilares p, (values
  (73, 'Processamento integrado de informações de saúde', 'regua', '{"niveis":["Dados em silos","Integração parcial, sem padrão","Dados padronizados, sem tempo real","Fluxo automatizado com painéis","Interoperabilidade com data lakes e análise preditiva"]}'::jsonb, 'Rúbrica — integração dos sistemas de informação.', 0),
  (77, 'Integração hospital–comunidade', 'regua', '{"niveis":["Dados totalmente separados","Compartilhamento ocasional em papel","Consulta cruzada limitada","Integração parcial por território","Data warehouse único com score de vulnerabilidade"]}'::jsonb, 'Rúbrica — integração de dados hospitalares e comunitários.', 1),
  (80, 'Planejamento epidemiológico preventivo', 'regua', '{"niveis":["Nenhum planejamento","Ações reativas, sem plano formal","Plano básico (combate a endemias)","Plano detalhado com monitoramento contínuo","Plano integrado com geotecnologia e participação cidadã"]}'::jsonb, 'Rúbrica — planejamento de prevenção epidemiológica.', 2),
  (88, 'Redes neurais aplicadas ao diagnóstico', 'regua', '{"niveis":["Nenhum estudo ou implementação","Estudos preliminares teóricos","Projetos piloto em andamento","Piloto concluído, em ampliação","IA em produção para múltiplos diagnósticos com bioética"]}'::jsonb, 'Rúbrica — maturidade da IA de apoio ao diagnóstico.', 3)
) as v(numero, titulo, tipo, config, dica, ordem)
where p.modulo_id = 'saude' and p.numero = 5
on conflict (numero) do update set
  pilar_id = excluded.pilar_id, titulo = excluded.titulo,
  tipo = excluded.tipo, config = excluded.config,
  dica = excluded.dica, ordem = excluded.ordem;

