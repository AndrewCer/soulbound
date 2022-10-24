import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { PaymentRequestService } from 'src/app/core/http/payment/payment-request.service';
import { PaymentFrequency, PriceType } from 'src/app/shared/models/payment.model';
import { Membership, User } from 'src/app/shared/models/user.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';

interface DialogData {
    membership: Membership,
    paymentFrequency: PaymentFrequency,
    user: User,
}

@Component({
    selector: 'update-subscription',
    templateUrl: './update-subscription.component.html',
    styleUrls: ['./update-subscription.component.scss'],
})
export class UpdateSubscriptionComponent {
    public currentDate = Date.now();
    public user: User;
    public submitting = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) public parentData: DialogData,
        public stringFormatterService: StringFormatterService,
        private dialogRef: MatDialogRef<UpdateSubscriptionComponent>,
        private paymentRequestService: PaymentRequestService,
    ) {
        this.user = parentData.user;
    }

    public confirm() {
        let priceType = PriceType.free;
        if (this.parentData.membership === Membership.davinci) {
            if (this.parentData.paymentFrequency === PaymentFrequency.monthly) {
                priceType = PriceType.davinci_monthly;
            }
            if (this.parentData.paymentFrequency === PaymentFrequency.yearly) {
                priceType = PriceType.davinci_yearly;
            }
        }
        if (this.parentData.membership === Membership.pro) {
            if (this.parentData.paymentFrequency === PaymentFrequency.monthly) {
                priceType = PriceType.pro_monthly;
            }
            if (this.parentData.paymentFrequency === PaymentFrequency.yearly) {
                priceType = PriceType.pro_yearly;
            }
        }

        if (priceType === PriceType.free) {
            return;
        }


        if (this.user.subscriptionId) {
            this.submitting = true;
            this.paymentRequestService.updateSubscription(this.user.subscriptionId, priceType).pipe(take(1)).subscribe((apiResponse) => {
                if (apiResponse.errorCode) {
                    this.submitting = false;
                    return;
                }

                this.dialogRef.close(true);
            });
        }
    }

    public getPrice(membership: Membership, paymentFrequency: PaymentFrequency): string {
        if (membership === Membership.davinci) {
            if (paymentFrequency === PaymentFrequency.monthly) {
                return '18';
            }
            if (paymentFrequency === PaymentFrequency.yearly) {
                return '108';
            }
        }

        if (membership === Membership.pro) {
            if (paymentFrequency === PaymentFrequency.monthly) {
                return '49';
            }
            if (paymentFrequency === PaymentFrequency.yearly) {
                return '420';
            }
        }

        return '';
    }
}
