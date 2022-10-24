import { Routes } from '@angular/router';


export const content: Routes = [
  {
    path: '',
    loadChildren: () => import('../../modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'account',
    loadChildren: () => import('../../modules/account/account.module').then(m => m.AccountModule)
  },
];
