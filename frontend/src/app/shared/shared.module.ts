import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout-components/header/header.component';
import { FooterComponent } from './layout-components/footer/footer.component';
import { LoaderComponent } from './layout-components/loader/loader.component';
import { PageHeaderComponent } from './layout-components/page-header/page-header.component';
import { SidebarComponent } from './layout-components/sidebar/sidebar.component';
import { TabToTopComponent } from './layout-components/tab-to-top/tab-to-top.component';
import { ContentLayoutComponent } from './layout-components/layout/content-layout/content-layout.component';
import { ErrorLayoutComponent } from './layout-components/layout/error-layout/error-layout.component';
import { FullLayoutComponent } from './layout-components/layout/full-layout/full-layout.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image'; 
import { RightSidebarComponent } from './layout-components/right-sidebar/right-sidebar.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FullscreenDirective } from './directives/fullscreen-toggle.directive';
import { HoverEffectSidebarDirective } from './directives/hover-effect-sidebar.directive';
import { ToggleThemeDirective } from './directives/toggle-theme.directive';
import { SidemenuToggleDirective } from './directives/sidemenuToggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { PricingComponent } from './components/pricing/pricing.component';
import { CancelSubscriptionComponent } from './components/modals/cancel-subscription/cancel-subscription.component';
import { CancelSubscriptionUndoComponent } from './components/modals/cancel-subscription-undo/cancel-subscription-undo.component';
import { UpdateSubscriptionComponent } from './components/modals/update-subscription/update-subscription.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { SnackBarFeedbackComponent } from './components/snack-bars/feedback/snack-bar-feedback.component';
import { TokenComponent } from './components/token/token.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: true
};

const components: any[] = [
  HeaderComponent,
  FooterComponent,
  LoaderComponent,
  PageHeaderComponent,
  SidebarComponent,
  TabToTopComponent,
  TokenComponent,
  ContentLayoutComponent,
  ErrorLayoutComponent,
  FileUploadComponent,
  FullLayoutComponent,
  RightSidebarComponent,

  CancelSubscriptionComponent,
  CancelSubscriptionUndoComponent,
  PricingComponent,
  SnackBarFeedbackComponent,
  UpdateSubscriptionComponent,
];

const directives: any[] = [
  FullscreenDirective,
  HoverEffectSidebarDirective,
  ToggleThemeDirective,
  SidemenuToggleDirective,
];

const pipes: any[] = [
];

const modules = [
  CommonModule,
  FormsModule,
  MaterialModule,
  NgbModule,
  PdfViewerModule,
  PerfectScrollbarModule,
  ReactiveFormsModule,
  RouterModule,
  LazyLoadImageModule,
];


@NgModule({
  declarations: [
    ...components,
    ...directives,
    ...pipes,
  ],
  imports: modules,
  exports: [
    ...components,
    ...directives,
    ...pipes,
    ...modules
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
