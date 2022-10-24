import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { PaymentRequestService } from 'src/app/core/http/payment/payment-request.service';
import { User } from 'src/app/shared/models/user.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';

interface DialogData {
    user: User,
}

@Component({
    selector: 'cancel-subscription-undo',
    templateUrl: './cancel-subscription-undo.component.html',
    styleUrls: ['./cancel-subscription-undo.component.scss'],
})
export class CancelSubscriptionUndoComponent {
    public user: User;

    public submitting = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public parentData: DialogData,
        public stringFormatterService: StringFormatterService,
        private dialogRef: MatDialogRef<CancelSubscriptionUndoComponent>,
        private paymentRequestService: PaymentRequestService,
    ) {
        this.user = parentData.user;
    }

    public confirm() {
        if (this.user.subscriptionId) {
            this.submitting = true;
            this.paymentRequestService.cancelSubscriptionUndo(this.user.subscriptionId).pipe(take(1)).subscribe((apiResponse) => {
                if (apiResponse.success) {
                    this.user.membershipExpires = undefined;
                    this.dialogRef.close(true);
                }
                else {
                    this.submitting = false;
                }
            });
        }
    }
}
