import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WalletStatus } from 'src/app/shared/models/wallet.model';
import { WalletService } from 'src/app/shared/services/wallet.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy {
    private subscriptionKiller = new Subject();

    constructor(
        private walletService: WalletService
    ) {
        this.walletService.startup();
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }
}
