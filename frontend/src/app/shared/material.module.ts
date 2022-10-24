import { NgModule } from '@angular/core';

import { A11yModule } from '@angular/cdk/a11y';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatCardModule } from '@angular/material/card';
// import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatFormFieldModule } from "@angular/material/form-field"
// import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from '@angular/material/icon';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatListModule } from '@angular/material/list';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatTabsModule } from '@angular/material/tabs';
// import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

const modules = [
    A11yModule,
    // MatAutocompleteModule,
    // MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    // MatCardModule,
    // MatCheckboxModule,
    MatDialogModule,
    // MatDividerModule,
    // MatExpansionModule,
    // MatFormFieldModule,
    MatIconModule,
    // MatMenuModule,
    // MatListModule,
    // MatInputModule,
    // MatProgressBarModule,
    // MatProgressSpinnerModule,
    // MatRadioModule,
    // MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    // MatTabsModule,
    // MatToolbarModule,
    MatTooltipModule,
]

@NgModule({
    exports: [modules],
})
export class MaterialModule { }
