import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UnderConstructionComponent } from './under-construction/under-construction.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error-404',
        component: Error404Component
      },
      {
        path: 'error-500',
        component: Error500Component
      },
      {
        path: 'error-501',
        component: Error501Component
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
      {
        path: 'lockscreen',
        component: LockscreenComponent
      },
      {
        path: 'under-construction',
        component: UnderConstructionComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
