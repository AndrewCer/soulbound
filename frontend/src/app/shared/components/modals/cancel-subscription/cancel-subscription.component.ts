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
    selector: 'cancel-subscription',
    templateUrl: './cancel-subscription.component.html',
    styleUrls: ['./cancel-subscription.component.scss'],
})
export class CancelSubscriptionComponent {
    public user: User;

    public submitting = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public parentData: DialogData,
        public stringFormatterService: StringFormatterService,
        private dialogRef: MatDialogRef<CancelSubscriptionComponent>,
        private paymentRequestService: PaymentRequestService,
    ) {
        this.user = parentData.user;
    }

    public confirmCancel() {
        if (this.user.subscriptionId) {
            this.submitting = true;
            this.paymentRequestService.cancelSubscription(this.user.subscriptionId).pipe(take(1)).subscribe((apiResponse) => {
                if (apiResponse.success && apiResponse.success.membershipExpires && this.user) {
                    this.user.membershipExpires = apiResponse.success.membershipExpires;
                    this.dialogRef.close(true);
                }
                else {
                    this.submitting = false;
                }
            });
        }
    }
}
