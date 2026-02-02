import { Script, ScriptSection } from '../types';

export type TemplateKey = 
  | 'ALL_NOTHING_R1' 
  | 'ALL_NOTHING_R2' 
  | 'PRATICAS_ENGANOSAS' 
  | 'VERIFICACAO_PF_NOVO' 
  | 'VERIFICACAO_PJ_NOVO'
  | 'VERIFICACAO_PF_ANTIGO'
  | 'VERIFICACAO_PJ_ANTIGO'
  | 'EM_BRANCO';

export interface ScriptTemplate {
  name: string;
  category: Script['category'];
  tipoScript: Script['tipoScript'];
  sections: Omit<ScriptSection, 'id'>[];
  defaultContent: string;
}

export const SCRIPT_TEMPLATES: Record<TemplateKey, ScriptTemplate> = {
  ALL_NOTHING_R1: {
    name: 'ALL NOTHING R1 - FRAUDE SISTEMAS',
    category: 'FRAUDE',
    tipoScript: 'FRAUDE_SISTEMA',
    defaultContent: `// PIXEL R1`,
    sections: [
      {
        title: 'CONTESTAÇÃO R1',
        fields: [
          { id: 'r1-f1', label: 'QUAIS MUDANÇAS VOCÊ FEZ NA SUA CONTA OU NOS PAGAMENTOS DESDE A ÚLTIMA CONTESTAÇÃO?', type: 'textarea', value: '', width: 'full' },
          { id: 'r1-f2', label: 'VOCÊ QUER INCLUIR OUTRAS INFORMAÇÕES QUE NÃO ESTAVAM NA CONTESTAÇÃO ANTERIOR?', type: 'textarea', value: '', width: 'full' }
        ]
      }
    ]
  },
  ALL_NOTHING_R2: {
    name: 'ALL NOTHING R2 FRAUD SISTEMA - 4 ETAPAS',
    category: 'FRAUDE',
    tipoScript: 'FRAUDE_SISTEMA',
    defaultContent: `// PIXEL R2`,
    sections: [
      {
        title: 'ETAPA 1: ORGANIZAÇÃO',
        fields: [
          { id: 'r2-f1', label: 'EM QUAL PAÍS A EMPRESA VAI VEICULAR ANÚNCIOS?', type: 'text', value: 'Brasil', width: 'full' },
          { id: 'r2-f2', label: 'O QUE SUA ORGANIZAÇÃO FAZ?', type: 'textarea', value: 'Empresa de marketing digital especializada em tráfego pago e publicidade online.', width: 'full' },
          { id: 'r2-f3', label: 'VOCÊ É PROPRIETÁRIO OU FUNCIONÁRIO DIRETO DA ORGANIZAÇÃO?', type: 'text', value: 'Sim', width: 'half' },
          { id: 'r2-f4', label: 'QUAL É O SITE DA SUA ORGANIZAÇÃO?', type: 'text', value: '', width: 'half' }
        ]
      },
      {
        title: 'ETAPA 2: OPERAÇÃO',
        fields: [
          { id: 'r2-f5', label: 'SUA ORGANIZAÇÃO MUDOU NOS ÚLTIMOS 3 DIAS?', type: 'text', value: 'Não', width: 'half' },
          { id: 'r2-f6', label: 'SUA ORGANIZAÇÃO FAZ PARTE DE UM PROGRAMA DE AFILIADOS?', type: 'text', value: 'Não', width: 'half' },
          { id: 'r2-f7', label: 'VOCÊ TEM VÁRIAS CONTAS DO GOOGLE?', type: 'text', value: 'Não', width: 'full' }
        ]
      },
      {
        title: 'ETAPA 3: FINANCEIRO',
        fields: [
          { id: 'r2-f8', label: 'QUEM PAGA POR ESSA CONTA?', type: 'text', value: 'Eu mesmo sou responsável pelos pagamentos', width: 'full' },
          { id: 'r2-f9', label: 'COMO VOCÊ PAGA PELO GOOGLE ADS?', type: 'text', value: 'Cartão de crédito', width: 'full' }
        ]
      },
      {
        title: 'ETAPA 4: CAMPANHAS',
        fields: [
          { id: 'r2-f10', label: 'DÊ ALGUNS EXEMPLOS DE PALAVRAS-CHAVE DAS SUAS CAMPANHAS.', type: 'textarea', value: '', width: 'full' },
          { id: 'r2-f11', label: 'O SITE PERTENCE À SUA ORGANIZAÇÃO?', type: 'text', value: 'Sim', width: 'half' },
          { id: 'r2-f12', label: 'SUA EMPRESA TEM RELAÇÃO COM OUTRAS MARCAS?', type: 'text', value: 'Não', width: 'half' },
          { id: 'r2-f13', label: 'PRECISAMOS SABER ALGO MAIS SOBRE VOCÊ OU SUA ORGANIZAÇÃO?', type: 'textarea', value: '', width: 'full' }
        ]
      }
    ]
  },
  PRATICAS_ENGANOSAS: {
    name: 'PRATICAS COMERCIAIS INCAITÁVEIS',
    category: 'OUTROS',
    tipoScript: 'PRATICAS_COMERCIAIS',
    defaultContent: ``,
    sections: [
      {
        title: 'DETALHES DA OPERAÇÃO',
        fields: [
          { id: 'pe-f1', label: 'SITE', type: 'text', value: '', width: 'full' },
          { id: 'pe-f2', label: 'EXEMPLOS DE PALAVRAS-CHAVE', type: 'text', value: 'Não usamos', width: 'half' },
          { id: 'pe-f3', label: 'PAÍS DE FATURAMENTO', type: 'text', value: 'Brasil', width: 'half' },
          { id: 'pe-f4', label: 'VOCÊ TEM UMA OU VÁRIAS CONTAS?', type: 'text', value: 'Uma', width: 'half' },
          { id: 'pe-f5', label: 'VOCÊ ESTÁ ANUNCIANDO SUA PRÓPRIA EMPRESA?', type: 'text', value: 'Sim', width: 'half' },
          { id: 'pe-f6', label: 'QUEM PAGA?', type: 'text', value: 'Eu mesmo pago', width: 'half' },
          { id: 'pe-f7', label: 'FORMA DE PAGAMENTO', type: 'text', value: 'Cartão de crédito', width: 'half' },
          { id: 'pe-f8', label: 'DESCREVA SUA EMPRESA', type: 'textarea', value: 'Empresa de marketing digital focada em tráfego pago', width: 'full' }
        ]
      }
    ]
  },
  VERIFICACAO_PF_NOVO: {
    name: 'VERIFICAÇÃO COMERCIA PF- NOVO',
    category: 'VERIFICACAO',
    tipoScript: 'VERIFICACAO_PF',
    defaultContent: ``,
    sections: [
      {
        title: 'DADOS DO ANUNCIANTE (PF)',
        fields: [
          { id: 'vpf-f1', label: 'NOME COMPLETO', type: 'text', value: '', width: 'full' },
          { id: 'vpf-f2', label: 'ENDEREÇO COMPLETO', type: 'textarea', value: '', width: 'full' },
          { id: 'vpf-f3', label: 'E-MAIL DE CONTATO', type: 'text', value: '', width: 'full' }
        ]
      },
      {
        title: 'MODELO DE NEGÓCIO',
        fields: [
          { id: 'vpf-f4', label: 'DESCRIÇÃO DO NEGÓCIO', type: 'textarea', value: 'Eu gerencio meus próprios anúncios e sou responsável por toda operação.', width: 'full' },
          { id: 'vpf-f5', label: 'MODELO DE MARKETING', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável por toda operação.', width: 'full' },
          { id: 'vpf-f6', label: 'RESPONSÁVEL PELOS ANÚNCIOS', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável por t', width: 'half' },
          { id: 'vpf-f7', label: 'QUEM PAGA PELOS ANÚNCIOS?', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável por t', width: 'half' }
        ]
      },
      {
        title: 'POLÍTICAS E DADOS',
        fields: [
          { id: 'vpf-f8', label: 'PROTEÇÃO DE DADOS', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável por toda operação.', width: 'full' },
          { id: 'vpf-f9', label: 'POLÍTICA LGPD', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável por toda operação.', width: 'full' }
        ]
      }
    ]
  },
  VERIFICACAO_PJ_NOVO: {
    name: 'VERIFICAÇÃO COMERCIAL PJ-NOVO',
    category: 'VERIFICACAO',
    tipoScript: 'VERIFICACAO_PJ',
    defaultContent: ``,
    sections: [
      {
        title: 'DADOS DA EMPRESA (PJ)',
        fields: [
          { id: 'vpj-f1', label: 'RAZÃO SOCIAL / NOME FANTASIA', type: 'text', value: '', width: 'full' },
          { id: 'vpj-f2', label: 'CNPJ', type: 'text', value: '', width: 'half' },
          { id: 'vpj-f3', label: 'ENDEREÇO COMERCIAL', type: 'textarea', value: '', width: 'full' }
        ]
      },
      {
        title: 'ESTRUTURA COMERCIAL',
        fields: [
          { id: 'vpj-f4', label: 'MODELO COMERCIAL', type: 'textarea', value: 'Somos uma empresa de marketing digital que promove produtos de parceiros via mídia paga.', width: 'full' },
          { id: 'vpj-f5', label: 'RELAÇÃO COM PARCEIROS', type: 'textarea', value: 'Somos uma empresa de marketing digital que promove produtos de parceiros via mídia paga.', width: 'full' },
          { id: 'vpj-f6', label: 'QUEM PAGA PELOS ANÚNCIOS?', type: 'text', value: 'Somos uma empresa de marketing digital que promove prodi', width: 'half' },
          { id: 'vpj-f7', label: 'CRIAÇÃO DE CONTEÚDO', type: 'text', value: 'Somos uma empresa de marketing digital que promove prodi', width: 'half' }
        ]
      },
      {
        title: 'CONFORMIDADE',
        fields: [
          { id: 'vpj-f8', label: 'POLÍTICA DE PRIVACIDADE', type: 'text', value: 'Somos uma empresa de marketing digital que promove produtos de parceiros via mídia paga.', width: 'full' }
        ]
      }
    ]
  },
  VERIFICACAO_PF_ANTIGO: {
    name: 'VERIFICAÇÃO ANUNCIANTE PF-ANTIGO',
    category: 'VERIFICACAO',
    tipoScript: 'VERIFICACAO_PF',
    defaultContent: ``,
    sections: [
      {
        title: 'IDENTIFICAÇÃO',
        fields: [
          { id: 'pfa-f1', label: 'ID CONTA', type: 'text', value: '', width: 'half' },
          { id: 'pfa-f2', label: 'SITE', type: 'text', value: '', width: 'half' }
        ]
      },
      {
        title: 'USO E GESTÃO',
        fields: [
          { id: 'pfa-f3', label: 'USO DA CONTA', type: 'textarea', value: 'Eu gerencio meus próprios anúncios e sou responsável integral pela operação.', width: 'full' },
          { id: 'pfa-f4', label: 'QUEM GERENCIA', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável integral pela operação.', width: 'full' }
        ]
      },
      {
        title: 'DADOS E OPERAÇÃO',
        fields: [
          { id: 'pfa-f5', label: 'DADOS PESSOAIS', type: 'textarea', value: '', width: 'full' },
          { id: 'pfa-f6', label: 'DESCRIÇÃO DO TRABALHO', type: 'textarea', value: 'Eu gerencio meus próprios anúncios e sou responsável integral pela operação.', width: 'full' },
          { id: 'pfa-f7', label: 'MODELO DE MARKETING', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável integral pela operação.', width: 'full' },
          { id: 'pfa-f8', label: 'QUEM PAGA', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável integ', width: 'half' },
          { id: 'pfa-f9', label: 'PROTEÇÃO DE DADOS', type: 'text', value: 'Eu gerencio meus próprios anúncios e sou responsável integ', width: 'half' }
        ]
      }
    ]
  },
  VERIFICACAO_PJ_ANTIGO: {
    name: 'VERIFICAÇÃO ANUNCIANTE PJ-ANTIGO',
    category: 'VERIFICACAO',
    tipoScript: 'VERIFICACAO_PJ',
    defaultContent: ``,
    sections: [
      {
        title: 'DADOS EMPRESARIAIS',
        fields: [
          { id: 'pja-f1', label: 'DADOS EMPRESA', type: 'textarea', value: '', width: 'full' },
          { id: 'pja-f2', label: 'CNPJ', type: 'text', value: '', width: 'full' },
          { id: 'pja-f3', label: 'ENDEREÇO', type: 'textarea', value: '', width: 'full' },
          { id: 'pja-f4', label: 'SITE', type: 'text', value: '', width: 'full' }
        ]
      },
      {
        title: 'MODELO COMERCIAL',
        fields: [
          { id: 'pja-f5', label: 'TIPO DE NEGÓCIO', type: 'text', value: 'Somos uma empresa de marketing digital responsável pela criação e gestão de campanhas próprias.', width: 'full' },
          { id: 'pja-f6', label: 'MODELO COMERCIAL', type: 'textarea', value: 'Somos uma empresa de marketing digital responsável pela criação e gestão de campanhas próprias.', width: 'full' },
          { id: 'pja-f7', label: 'PARCEIROS', type: 'text', value: 'Somos uma empresa de marketing digital responsável pela criação e gestão de campanhas próprias.', width: 'full' }
        ]
      },
      {
        title: 'EXECUÇÃO E PAGAMENTO',
        fields: [
          { id: 'pja-f8', label: 'QUEM CRIA ANÚNCIOS', type: 'text', value: 'Somos uma empresa de marketing digital responsável pela criação e gestão de campanhas próprias.', width: 'full' },
          { id: 'pja-f9', label: 'QUEM PAGA', type: 'text', value: 'Somos uma empresa de marketing digital responsável pela c', width: 'half' },
          { id: 'pja-f10', label: 'POLÍTICA PRIVACIDADE', type: 'text', value: 'Somos uma empresa de marketing digital responsável pela c', width: 'half' }
        ]
      }
    ]
  },
  EM_BRANCO: {
    name: 'PERSONALIZADO',
    category: 'OUTROS',
    tipoScript: 'PERSONALIZADO',
    defaultContent: '',
    sections: [
      { title: 'NOVA SEÇÃO', fields: [] }
    ]
  }
};