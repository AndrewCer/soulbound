import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
            }
        ]
    },
];

@NgModule({
    declarations: [
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
})
export class HomeModule { }
