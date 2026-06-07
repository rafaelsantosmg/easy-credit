export type CreditStep = 'simulacao' | 'analise' | 'cadastro' | 'formalizacao';

export interface SimulationInput {
  valor: number;
  parcelas: number;
  rendaMensal: number;
}

export interface SimulationResult {
  valorParcela: number;
  taxaMensal: number;
  cetAnual: number;
  totalPago: number;
  comprometimentoRenda: number;
}

export interface CustomerData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cep: string;
  endereco: string;
  numero: string;
  cidade: string;
  uf: string;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'approved' | 'rejected';

export interface AnalysisFactor {
  label: string;
  impacto: 'positivo' | 'negativo' | 'neutro';
  descricao: string;
}

export interface CreditAnalysis {
  status: AnalysisStatus;
  score: number;
  limiteAprovado: number;
  motivo?: string;
  fatores: AnalysisFactor[];
}

export interface FormalizationResult {
  biometriaValidada: boolean;
  contratoAssinado: boolean;
  protocolo: string;
  dataFormalizacao: Date;
}

export const CREDIT_STEPS: { id: CreditStep; label: string; route: string }[] = [
  { id: 'simulacao', label: 'Simulação', route: '/simulacao' },
  { id: 'analise', label: 'Análise de Crédito', route: '/analise' },
  { id: 'cadastro', label: 'Cadastro', route: '/cadastro' },
  { id: 'formalizacao', label: 'Formalização', route: '/formalizacao' },
];
