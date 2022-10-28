import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttributesModalComponent } from 'src/app/shared/modal/attributes/attributes.modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClaimComponent } from './components/claim/claim.component';
import { CollectionComponent } from './components/collection/collection.component';
import { CreateComponent } from './components/create/create.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: 'collection',
                component: CollectionComponent,
            },
            {
                path: 'create',
                component: CreateComponent,
            },
            {
                path: 'claim',
                component: ClaimComponent,
            },
            {
                path: 'claim/:eventId',
                component: ClaimComponent,
            },
            {
                path: 'claim/issued/:eventId',
                component: ClaimComponent,
            },
            {
                path: 'claim/issued/:eventId/:code',
                component: ClaimComponent,
            },
        ]
    },
];

@NgModule({
    declarations: [
        AttributesModalComponent,
        ClaimComponent,
        CollectionComponent,
        CreateComponent,
        HomeComponent,
    ],
    imports: [
        SharedModule,

        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    entryComponents: [
        AttributesModalComponent
    ],
})
export class HomeModule { }
