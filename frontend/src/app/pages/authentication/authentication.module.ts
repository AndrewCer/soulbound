import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { UnderConstructionComponent } from './under-construction/under-construction.component';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { Error501Component } from './error501/error501.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    ResetPasswordComponent,
    LockscreenComponent,
    UnderConstructionComponent,
    Error404Component,
    Error500Component,
    Error501Component
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    SharedModule,
    NgbModule
  ]
})
export class AuthenticationModule { }
