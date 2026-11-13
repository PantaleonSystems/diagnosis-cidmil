export interface FonteDado { id: string; nome: string; frase: string; x: number; y: number }

/** Fontes de exemplo; x e y em % do quadro do mapa da cidade. */
export const FONTES: FonteDado[] = [
  { id: 'saude', nome: 'Secretaria de Saúde', frase: 'Os atendimentos e as equipes que a Secretaria já registra todos os dias.', x: 30, y: 24 },
  { id: 'cadastro', nome: 'Cadastro municipal', frase: 'O cadastro de famílias e imóveis que a prefeitura já mantém.', x: 74, y: 32 },
  { id: 'escolas', nome: 'Escolas', frase: 'Matrículas e acesso à internet nas escolas da rede municipal.', x: 18, y: 62 },
  { id: 'assistencia', nome: 'Assistência social', frase: 'Os atendimentos dos CRAS e o que o Cadastro Único já mostra.', x: 70, y: 74 },
  { id: 'biblioteca', nome: 'Biblioteca', frase: 'Visitas, acervo e atividades de leitura e de acesso à informação.', x: 44, y: 82 },
]
