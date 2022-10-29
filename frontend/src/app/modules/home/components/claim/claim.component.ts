import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, ParamMap, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { EventData } from 'src/app/shared/models/event.model';
import { SBT } from 'src/app/shared/models/token.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';
import { WalletService } from 'src/app/shared/services/wallet.service';

@Component({
    selector: 'claim',
    templateUrl: './claim.component.html',
    styleUrls: ['./claim.component.scss'],
})
export class ClaimComponent implements OnDestroy {
    public currentRoute: string = '';
    public eventData: EventData | undefined;
    public eventId: string | null = null;
    public invalidClaimAttempt = false;
    public metaData: SBT | undefined;
    public submitting = false;
    public uniqueCode: string | null = null;

    public claimSuccess = false;

    private subscriptionKiller = new Subject();

    constructor(
        public stringFormatterService: StringFormatterService,
        public walletService: WalletService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this.subscriptionKiller),
        ).subscribe((params: ParamMap) => {
            this.eventId = params.get('eventId');
            this.uniqueCode = params.get('code');

            if (this.eventId && this.eventId.length === 21) {
                this.getEventData(this.eventId);
            }
        });

        this.router.events.pipe(
            takeUntil(this.subscriptionKiller),
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        ).subscribe(async event => {
            console.log(event);
            
            this.currentRoute = event.url;

            if (this.currentRoute.includes('/issued/')) {
                // URL hit with unique code - used when code is linked to some data offchain, i.e. email address.
                if (this.uniqueCode) {


                    const eventId = await this.walletService.checkCodeForIssuedToken(this.uniqueCode);                    

                    // No such eventId exists
                    if (!eventId) {
                        this.invalidClaimAttempt = true;
                        return;
                    }

                    // Current eventId doesn't match the returned eventId
                    if (this.eventId && eventId !== this.walletService.createHash(this.eventId)) {
                        this.invalidClaimAttempt = true;
                        return;
                    }
                }
                // URL hit withOUT unique code - used when wallet address is linked to the token.
                if (!this.uniqueCode && this.eventId) {
                    const canClaim = await this.walletService.checkWalletForIssuedToken(this.eventId);
                    if (!canClaim) {
                        this.invalidClaimAttempt = true;
                        return;
                    }

                }

                this.invalidClaimAttempt = false;
            }
        });

    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }


    public async getEventData(eventId: string) {
        this.eventData = await this.walletService.getEventData(eventId);

        if (!this.eventData) {
            return;
        }

        this.fetchMetadata(this.eventData);
    }

    public async fetchMetadata(eventData: EventData) {
        let tokenURI = eventData.uri;
        console.log(tokenURI);

        if (tokenURI.includes('ipfs://')) {
            tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        console.log(tokenURI);

        this.metaData = await fetch(tokenURI)
            .then((response) => response.json())
            .then((data) => {
                return data;
            });



        if (this.metaData) {
            if (this.metaData.image.includes('ipfs://')) {
                this.metaData.image = this.metaData.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            console.log(this.metaData);
            console.log(this.eventData);
        }
    }

    public async claim() {
        if (!this.eventId) {
            return;
        }
        if (!this.eventData) {
            return;
        }

        if (this.eventData.limit && this.eventData.count >= this.eventData.limit) {
            return;
        }

        this.submitting = true;

        await this.walletService.claimTokenWithLimit(this.eventId);

        this.submitting = false;
        this.claimSuccess = true;
    }

    // Used for both code or address claims
    public async claimIssuedToken() {
        if (!this.eventId) {
            return;
        }

        this.submitting = true;

        if (this.uniqueCode) {
            await this.walletService.claimIssuedTokenFromCode(this.eventId, this.uniqueCode);

            this.submitting = false;
            this.claimSuccess = true;
        }
        else {
            await this.walletService.claimIssuedToken(this.eventId);

            this.submitting = false;
            this.claimSuccess = true;
        }

    }

}