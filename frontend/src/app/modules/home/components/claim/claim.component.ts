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
    public eventData: EventData | undefined;
    public eventId: string | null = null;
    public metaData: SBT | undefined;
    public submitting = false;
    public uniqueCode: string | null = null;

    private subscriptionKiller = new Subject();

    constructor(
        public stringFormatterService: StringFormatterService,
        private activatedRoute: ActivatedRoute,
        private walletService: WalletService,
    ) {
        this.activatedRoute.paramMap.pipe(
            takeUntil(this.subscriptionKiller),
        ).subscribe((params: ParamMap) => {
            this.eventId = params.get('eventId');
            this.uniqueCode = params.get('code');

            if (this.eventId) {
                this.getEventData(this.eventId);
            }
        });
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }


    public async getEventData(eventId: string) {
        this.eventData = await this.walletService.getEventData(eventId);

        this.fetchMetadata(this.eventData);
    }

    public async fetchMetadata(eventData: EventData) {
        let tokenURI = eventData.uri;

        if (!tokenURI.includes('https://')) {
            tokenURI = `https://ipfs.io/ipfs/${tokenURI}/metadata.json`;
        }
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
        if(!this.eventData) {
            return;
        }

        if (this.eventData.limit && this.eventData.count >= this.eventData.limit) {
            return;
        }

        this.submitting = true;
        
        const txn = await this.walletService.claimTokenWithLimit(this.eventId);

        this.submitting = false;
    }

}