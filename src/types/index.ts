export type TipoEstudo = 'narrativa' | 'expositiva' | 'tematica' | 'textual' | 'devocional' | 'biblico';

export interface BiblioVersao {
  id: string;
  nome: string;
  abreviacao: string;
}

export interface Livro {
  nome: string;
  abreviacao: string;
  testamento: 'AT' | 'NT';
  numCapitulos: number;
}

export interface Versiculo {
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
}

export interface EsbocoResponse {
  id: string;
  livro: string;
  capitulo: number;
  versiculo: number;
  tipo: TipoEstudo;
  titulo: string;
  publicoAlvo: string;
  conteudo: {
    fundacao: {
      contexto: string;
      analiseTextual: string;
      palavrasOriginais: string;
    };
    analise: {
      teologia: string;
      referencias: string;
    };
    aplicacao: {
      pratica: string;
      sermao: {
        introducao: string;
        divisoes: string[];
        conclusao: string;
        apelo: string;
      };
    };
  };
  criadoEm: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}
