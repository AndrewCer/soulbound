import { Component, OnDestroy } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TokenRequestService } from 'src/app/core/http/token/token-request.service';
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
        private tokenRequestService: TokenRequestService,
        private walletService: WalletService,
    ) {
        this.walletService.startup();

        this.walletService.$walletConnectionChanges.pipe(
            takeUntil(this.subscriptionKiller)
        )
            .subscribe((walletStatus: WalletStatus | undefined) => {
                if (walletStatus === undefined) {
                    return;
                }

                this.handleWalletChanges(walletStatus);
            });
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }

    public tokens: any[] = [];
    private async handleWalletChanges(walletStatus: WalletStatus) {
        switch (walletStatus) {
            case WalletStatus.connected:
                const tokenURIs = await this.walletService.getTokenURIs(await this.walletService.getAddress());
                console.log('urls: ', tokenURIs);

                tokenURIs.forEach((tokenURI) => {
                    this.tokenRequestService.get(tokenURI).pipe(
                        take(1)
                    ).subscribe((data) => {
                        console.log(data);
                        this.tokens.push(data);
                    });
                });
                break;
            case WalletStatus.disconnected:
                break;
            case WalletStatus.switched:
                break;
            case WalletStatus.error:
                break;

            default:
                break;
        }
    }
}
