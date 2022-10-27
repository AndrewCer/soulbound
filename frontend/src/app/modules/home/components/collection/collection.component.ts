import { Component, OnDestroy } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { TokenRequestService } from 'src/app/core/http/token/token-request.service';
import { SBT } from 'src/app/shared/models/token.model';
import { WalletStatus } from 'src/app/shared/models/wallet.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';
import { WalletService } from 'src/app/shared/services/wallet.service';

@Component({
    selector: 'collection',
    templateUrl: './collection.component.html',
    styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnDestroy {
    private subscriptionKiller = new Subject();

    public tokens: SBT[] = [];

    constructor(
        public stringFormatterService: StringFormatterService,
        private tokenRequestService: TokenRequestService,
        private walletService: WalletService,
    ) {
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

    private async handleWalletChanges(walletStatus: WalletStatus) {
        switch (walletStatus) {
            case WalletStatus.connected:
                const tokenURIs = await this.walletService.getTokenURIs(await this.walletService.getAddress());
                console.log('URIs: ', tokenURIs);

                tokenURIs.forEach(async (tokenURI) => {
                    if (!tokenURI.includes('https://')) {
                        tokenURI = `https://ipfs.io/ipfs/${tokenURI}/metadata.json`;
                    }
                    if (tokenURI.includes('ipfs://')) {
                        tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    }
                    const metaData = await fetch(tokenURI)
                        .then((response) => response.json())
                        .then((data) => {
                            return data;
                        });

                    if (metaData.image.includes('ipfs://')) {
                        metaData.image = metaData.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    }

                    this.tokens.push(metaData)
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