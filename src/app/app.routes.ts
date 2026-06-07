import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'simulacao', pathMatch: 'full' },
  {
    path: 'simulacao',
    loadComponent: () =>
      import('./pages/simulation/simulation.component').then((m) => m.SimulationComponent),
  },
  {
    path: 'analise',
    loadComponent: () =>
      import('./pages/analysis/analysis.component').then((m) => m.AnalysisComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./pages/registration/registration.component').then((m) => m.RegistrationComponent),
  },
  {
    path: 'formalizacao',
    loadComponent: () =>
      import('./pages/formalization/formalization.component').then((m) => m.FormalizationComponent),
  },
  { path: '**', redirectTo: 'simulacao' },
];
