import { Component, OnDestroy } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { WalletService } from 'src/app/shared/services/wallet.service';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

    constructor(
        private walletService: WalletService,
    ) {
        this.walletService.startup();
    }

}
