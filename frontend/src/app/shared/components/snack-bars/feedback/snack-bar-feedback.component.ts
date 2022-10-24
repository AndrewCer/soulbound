import { Component } from "@angular/core";
import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
    selector: 'snack-bar',
    templateUrl: 'snack-bar-feedback.component.html',
    styleUrls: ['./snack-bar-feedback.component.scss'],
  })
  export class SnackBarFeedbackComponent {

    constructor(
      private snackBarRef: MatSnackBarRef<SnackBarFeedbackComponent>
    ){}

    public close() {
      this.snackBarRef.dismiss();
    }

  }
