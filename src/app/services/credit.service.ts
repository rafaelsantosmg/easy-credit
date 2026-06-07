import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

import {
  CreditAnalysis,
  CustomerData,
  FormalizationResult,
  SimulationInput,
  SimulationResult,
} from '../models/credit.models';

@Injectable({ providedIn: 'root' })
export class CreditService {
  simulate(input: SimulationInput): SimulationResult {
    const taxaMensal = this.resolveMonthlyRate(input);
    const valorParcela = this.calculateInstallment(input.valor, taxaMensal, input.parcelas);
    const totalPago = valorParcela * input.parcelas;
    const comprometimentoRenda = (valorParcela / input.rendaMensal) * 100;

    return {
      valorParcela,
      taxaMensal: taxaMensal * 100,
      cetAnual: (Math.pow(1 + taxaMensal, 12) - 1) * 100,
      totalPago,
      comprometimentoRenda,
    };
  }

  analyze(
    simulation: SimulationInput,
    result: SimulationResult,
    customer?: CustomerData,
  ): Observable<CreditAnalysis> {
    const score = this.calculateScore(simulation, result, customer);
    const approved = score >= 550 && result.comprometimentoRenda <= 35;

    const analysis: CreditAnalysis = {
      status: approved ? 'approved' : 'rejected',
      score,
      limiteAprovado: approved ? simulation.valor : 0,
      motivo: approved
        ? undefined
        : result.comprometimentoRenda > 35
          ? 'Comprometimento de renda acima do limite permitido (35%).'
          : 'Score de crédito insuficiente para o valor solicitado.',
      fatores: this.buildFactors(simulation, result, customer, score),
    };

    return of(analysis).pipe(delay(2200));
  }

  formalize(): Observable<FormalizationResult> {
    const result: FormalizationResult = {
      biometriaValidada: true,
      contratoAssinado: true,
      protocolo: `CRD-${Date.now().toString(36).toUpperCase()}`,
      dataFormalizacao: new Date(),
    };

    return of(result).pipe(delay(1500));
  }

  private resolveMonthlyRate(input: SimulationInput): number {
    const baseRate = 0.019;
    const amountFactor = input.valor > 50000 ? 0.003 : 0;
    const termFactor = input.parcelas > 48 ? 0.004 : 0;
    const incomeFactor = input.rendaMensal < 3000 ? 0.005 : -0.002;

    return Math.max(0.012, baseRate + amountFactor + termFactor + incomeFactor);
  }

  private calculateInstallment(principal: number, rate: number, installments: number): number {
    if (rate === 0) {
      return principal / installments;
    }

    const factor = Math.pow(1 + rate, installments);
    return (principal * rate * factor) / (factor - 1);
  }

  private calculateScore(
    simulation: SimulationInput,
    result: SimulationResult,
    customer?: CustomerData,
  ): number {
    let score = 720;

    if (result.comprometimentoRenda > 30) score -= 80;
    else if (result.comprometimentoRenda > 20) score -= 30;

    if (simulation.parcelas > 60) score -= 40;
    if (simulation.valor > 100000) score -= 50;

    if (customer) {
      const age = this.calculateAge(customer.dataNascimento);
      if (age < 21 || age > 70) score -= 60;
      if (customer.email.includes('@')) score += 10;
    }

    return Math.max(300, Math.min(900, score));
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  private buildFactors(
    simulation: SimulationInput,
    result: SimulationResult,
    customer: CustomerData | undefined,
    score: number,
  ) {
    const factors = [
      {
        label: 'Comprometimento de renda',
        impacto: result.comprometimentoRenda <= 30 ? ('positivo' as const) : ('negativo' as const),
        descricao: `${result.comprometimentoRenda.toFixed(1)}% da renda mensal`,
      },
      {
        label: 'Prazo solicitado',
        impacto: simulation.parcelas <= 48 ? ('positivo' as const) : ('neutro' as const),
        descricao: `${simulation.parcelas} parcelas`,
      },
      {
        label: 'Score simulado',
        impacto: score >= 600 ? ('positivo' as const) : ('negativo' as const),
        descricao: `Pontuação ${score}`,
      },
    ];

    if (customer) {
      factors.push({
        label: 'Dados cadastrais',
        impacto: 'positivo' as const,
        descricao: 'Cadastro completo e validado',
      });
    }

    return factors;
  }
}
