import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { PaymentRequestService } from 'src/app/core/http/payment/payment-request.service';
import { PaymentFrequency, PriceType } from '../../models/payment.model';
import { Membership, User } from '../../models/user.model';
import { CancelSubscriptionUndoComponent } from '../modals/cancel-subscription-undo/cancel-subscription-undo.component';
import { CancelSubscriptionComponent } from '../modals/cancel-subscription/cancel-subscription.component';
import { UpdateSubscriptionComponent } from '../modals/update-subscription/update-subscription.component';

@Component({
  selector: 'pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnChanges {
  @Input() user: User | undefined;

  public yearlyToggle = true;

  constructor(
    public dialog: MatDialog,
    private paymentRequestService: PaymentRequestService,
    private userAuthService: UserAuthService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      if (this.user && this.user.paymentFrequency === PaymentFrequency.monthly) {
        this.yearlyToggle = false;
      }
    }
  }

  public cancelSubscription() {
    let dialogOptions = {
      panelClass: 'dynamic-modal',
      disableClose: true,
      data: {
        user: this.user
      },
    }

    const dialogRef = this.dialog.open(CancelSubscriptionComponent, dialogOptions);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userAuthService.refreshToken();
      }
    });
  }

  public cancelSubscriptionUndo() {
    let dialogOptions = {
      panelClass: 'dynamic-modal',
      disableClose: true,
      data: {
        user: this.user
      },
    }

    const dialogRef = this.dialog.open(CancelSubscriptionUndoComponent, dialogOptions);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userAuthService.refreshToken();
      }
    });
  }

  public checkout(membership: Membership) {
    if (membership === this.user?.membership) {
      this.updateSubscription(membership);
      return;
    }

    if (this.user?.membership !== 0) {
      this.updateSubscription(membership);
      return;
    }

    let price = PriceType.davinci_yearly;
    switch (membership) {
      case Membership.davinci:
        price = PriceType.davinci_monthly;
        if (this.yearlyToggle) {
          price = PriceType.davinci_yearly;
        }
        break;
      case Membership.pro:
        price = PriceType.pro_monthly;
        if (this.yearlyToggle) {
          price = PriceType.pro_yearly;
        }
        break;
      case Membership.free:
        price = PriceType.free;
        break
    }

    this.paymentRequestService.createCheckoutSession(price).subscribe((apiResponse) => {
      if (apiResponse.success) {
        window.location.href = apiResponse.success;
      }
    });
  }

  public isCurrentPlan() {
    if (!this.user) {
      return false;
    }
    if (this.user.paymentFrequency === 1 && !this.yearlyToggle || this.user.paymentFrequency === 2 && this.yearlyToggle) {
      return true;
    }
    else {
      return false
    }
  }

  public updateSubscription(membership: Membership) {
    let dialogOptions = {
      panelClass: 'dynamic-modal',
      disableClose: true,
      data: {
        membership,
        paymentFrequency: this.yearlyToggle ? PaymentFrequency.yearly : PaymentFrequency.monthly,
        user: this.user,
      },
    }

    const dialogRef = this.dialog.open(UpdateSubscriptionComponent, dialogOptions);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userAuthService.refreshToken();
      }
    });
  }

}
