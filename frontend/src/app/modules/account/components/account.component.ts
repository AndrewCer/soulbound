import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { Membership, User } from 'src/app/shared/models/user.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';


@Component({
    selector: 'home',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnDestroy {
    public monthlyMaxFree = 5;
    public monthlyMaxDavinci = 50;
    public progressBar = 25;
    public renewal: Date | undefined;
    public togglePricing = false;
    public user: User | undefined;


    private subscriptionKiller = new Subject();

    constructor(
        public stringFormatterService: StringFormatterService,
        private userAuthService: UserAuthService,
    ) {
        this.user = this.userAuthService.decodedToken;
        this.userAuthService.$accessTokenChanges.pipe(takeUntil(this.subscriptionKiller)).subscribe((token) => {
            this.user = this.userAuthService.decodedToken;
        });

        if (this.user) {
            this.renewal = this.addMonths(new Date(this.user.membershipGranted), 1);
        }

        if (this.user && this.user.membership !== Membership.pro) {
            let totalMonthlyPoints = this.monthlyMaxFree;
            if (this.user.membership === Membership.davinci) {
                totalMonthlyPoints = this.monthlyMaxDavinci;
            }
            this.progressBar = Math.round(((this.user.credits + this.user.creditsBonus) / totalMonthlyPoints) * 100)
        }
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }

    public addMonths(date: Date, months: number) {
        var d = date.getDate();
        date.setMonth(date.getMonth() + +months);
        if (date.getDate() != d) {
            date.setDate(0);
        }
        return date;
    }
}
