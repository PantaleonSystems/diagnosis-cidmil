export interface FonteDado { id: string; nome: string; frase: string }

/** Lugares de onde a informação da cidade vem (exemplos do que será conectado). */
export const FONTES: FonteDado[] = [
  { id: 'portais', nome: 'Portais de transparência', frase: 'Gastos, contratos e programas que a prefeitura já publica.' },
  { id: 'cadastros', nome: 'Cadastros públicos', frase: 'Famílias, imóveis e serviços registrados pelo poder público.' },
  { id: 'projetos', nome: 'Projetos e programas', frase: 'O que a cidade já faz: ações, convênios e iniciativas.' },
  { id: 'plataformas', nome: 'Plataformas da rede', frase: 'Sistemas de outras cidades e órgãos que trabalham juntos.' },
  { id: 'abertos', nome: 'Portais de dados abertos', frase: 'Informação nacional aberta, como a do IBGE e do SUS.' },
  { id: 'valores', nome: 'Valores da cidade', frase: 'O que a população valoriza: escutas, pesquisas e relatos.' },
]
