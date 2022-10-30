import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { nanoid } from 'nanoid'
import { first, Subject, take } from 'rxjs';

import { FileRequestService } from 'src/app/core/http/file/file-request.service';
import { EventTokenRequestService } from 'src/app/core/http/token/token-request.service';
import { ClaimStatus, IssuedTo } from 'src/app/shared/models/event-token.model';
import { EventData } from 'src/app/shared/models/event.model';
import { KeyValueString } from 'src/app/shared/models/map.model';
import { SBT } from 'src/app/shared/models/token.model';
import { WalletService } from 'src/app/shared/services/wallet.service';

interface ImportantStuff {
    claimLink?: string;
    emails?: string[];
    emailMapping?: KeyValueString;
    eventId?: string;
    limit?: number;
    wallets?: string[];
}

@Component({
    selector: 'create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnDestroy {
    @ViewChild('attributesModal') attributesModal!: TemplateRef<any>;
    public baseUrl = '';
    public dialogRef!: MatDialogRef<any>;
    public fileFormData = new FormData();
    public imgUrl: string | undefined;
    public importantStuff: ImportantStuff = {};

    public eventData: EventData | undefined;
    public metaData: SBT | undefined;

    public form: FormGroup;
    public submitting = false;
    public restricted = false;

    private subscriptionKiller = new Subject();

    // Two types of creation: 1) with existing uri - given by user. 2) without a uri - we build out the metadata

    public get formControl(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    constructor(
        public dialog: MatDialog,
        private eventTokenRequestService: EventTokenRequestService,
        private fileRequestService: FileRequestService,
        private formBuilder: FormBuilder,
        private router: Router,
        private walletService: WalletService,
        private viewScroller: ViewportScroller,
    ) {
        this.baseUrl = this.router['location']._platformLocation.location.origin;

        this.form = this.setupForm();
        this.setToggleValidators();
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();

        this.fileFormData = new FormData();
    }

    public openAttributeDialog() {
        this.dialogRef = this.dialog.open(this.attributesModal, {});

        this.dialogRef.afterClosed().pipe(
            first()
        ).subscribe(() => { });
    }

    public setToggleValidators(fromToggle?: boolean) {
        if (fromToggle) {
            this.restricted = !this.restricted;
        }

        this.form.removeControl('tokenLimit');
        this.form.removeControl('issueTo');
        
        if (this.restricted) {
            this.form.addControl('issueTo', new FormControl(null, [Validators.required]));
        }
        else {
            this.form.addControl('tokenLimit', new FormControl(null, [
                Validators.required,
                Validators.pattern("^[0-9]*$"),
                Validators.min(1),
                Validators.max(10000),
            ]));
        }
    }

    public async submit() {
        if (this.form.invalid) {
            return;
        }

        this.submitting = true;


        // construct json file and upload to ipfs
        // upload photo to ipfs
        // hit smart contract with required method. either free form or restricted.

        this.fileFormData.append('name', this.formControl['name'].value);
        this.fileFormData.append('description', this.formControl['description'].value);
        if (this.formControl['externalLink']) {
            this.fileFormData.append('external_url', this.formControl['externalLink'].value);
        }

        // Save metadata and image to IPFS
        this.fileRequestService.uploadImage(this.fileFormData).pipe(
            take(1)
        ).subscribe(async (apiResponse) => {
            if (!apiResponse.success) {
                return;
            }

            const ipfsUri = apiResponse.success;

            const eventId = nanoid();
            console.log('eventId: ', eventId);

            // Non pre-issued
            if (!this.restricted) {
                await this.walletService.createTokenWithLimit(eventId, ipfsUri, parseInt(this.formControl['tokenLimit'].value), parseInt(this.formControl['burnAuth'].value));

                const eventToken = {
                    id: eventId,
                    issuedTo: [],
                    owner: await this.walletService.getAddress(),
                    restricted: false,
                }

                this.eventTokenRequestService.create(eventToken).pipe(
                    take(1),
                ).subscribe(async (apiResponse) => {
                    if (!apiResponse.success) {
                        // TODO(nocs): handle errors
                        return;
                    }

                    await this.setupCompletionView(eventId, ipfsUri, eventToken.owner);

                    this.submitting = false;
                });
            }
            // Pre-issued
            if (this.restricted) {
                console.log(this.formControl['issueTo'].value);

                let issueToStr = this.formControl['issueTo'].value;
                // Remove trailing comma if one exists
                issueToStr = issueToStr.replace(/,*$/, '');
                // Remove all spaces
                issueToStr = issueToStr.replace(/\s+/g, '');

                console.log(issueToStr.split(','));

                // Remove duplicates
                const issueToArr = [...new Set(issueToStr.split(','))] as string[];

                const walletAddresses = issueToArr.filter((receiver) => this.walletService.isAddress(receiver as string));
                const emails = issueToArr.filter((receiver) => receiver.includes('@'));

                let emailMapping: KeyValueString = {};
                let emailCodes: string[] = [];
                emails.forEach((email) => {
                    const code = nanoid();
                    emailMapping[email] = code;

                    emailCodes.push(this.walletService.createHash(code));
                });

                // Both wallets and emails
                if (walletAddresses.length && emailCodes.length) {
                    await this.walletService.createTokenFromBoth(eventId, ipfsUri, walletAddresses, emailCodes, parseInt(this.formControl['burnAuth'].value));
                }
                // Only wallets
                if (walletAddresses.length && !emailCodes.length) {
                    await this.walletService.createTokenFromAddresses(eventId, ipfsUri, walletAddresses, parseInt(this.formControl['burnAuth'].value));
                }
                // Only emails
                if (emailCodes.length && !walletAddresses.length) {
                    await this.walletService.createTokenFromCodes(eventId, ipfsUri, emailCodes, parseInt(this.formControl['burnAuth'].value));
                }

                // Format EventToken to save in API
                let issuedTo: IssuedTo[] = [];
                walletAddresses.forEach((address) => {
                    issuedTo.push({
                        label: address,
                        status: ClaimStatus.issued
                    });
                });

                for (const email in emailMapping) {
                    if (Object.prototype.hasOwnProperty.call(emailMapping, email)) {
                        const code = emailMapping[email];
                        issuedTo.push({
                            label: email,
                            status: ClaimStatus.issued,
                            code,
                        });
                    }
                }

                const eventToken = {
                    id: eventId,
                    issuedTo,
                    owner: await this.walletService.getAddress(),
                    restricted: true,
                }

                this.eventTokenRequestService.create(eventToken).pipe(
                    take(1),
                ).subscribe(async (apiResponse) => {
                    if (!apiResponse.success) {
                        // TODO(nocs): handle errors
                        return;
                    }

                    this.importantStuff.wallets = walletAddresses;
                    this.importantStuff.emails = emails;
                    this.importantStuff.emailMapping = emailMapping;
                    await this.setupCompletionView(eventId, ipfsUri, eventToken.owner);

                    this.submitting = false;
                });

            }
        });

    }

    public onImageSelected(event: Event | DragEvent) {
        this.form.markAsDirty();

        // Typecasting to account for both drack and click events
        let inputElement = (event as DragEvent).dataTransfer ? (event as DragEvent).dataTransfer : (event.target as HTMLInputElement)
        console.log(event);

        this.fileFormData = new FormData();

        if (inputElement && inputElement.files) {
            const file = inputElement.files[0];

            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.imgUrl = reader.result as string;
            }

            this.imgUrl = URL.createObjectURL(file);

            this.fileFormData.append('uploaded-image', file);
        }
    }

    private async fetchMetadata(eventData: EventData) {
        let tokenURI = eventData.uri;
        console.log(tokenURI);

        if (tokenURI.includes('ipfs://')) {
            tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        console.log(tokenURI);

        let metaData = await fetch(tokenURI)
            .then((response) => response.json())
            .then((data) => {
                return data;
            });


        if (metaData) {
            if (metaData.image.includes('ipfs://')) {
                metaData.image = metaData.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            console.log(metaData);
            console.log(this.eventData);
        }

        this.metaData = metaData;

        return metaData;
    }

    private resetComponent() {
        this.importantStuff = {
            emailMapping: {}
        }

        this.eventData = undefined;
        this.metaData = undefined;

        this.form = this.setupForm();
        this.setToggleValidators();
    }

    private setupForm(): FormGroup {
        return this.formBuilder.group({
            name: [null, Validators.compose([
                Validators.required,
            ])],
            description: [null],
            externalLink: [null],
            burnAuth: ['2', Validators.compose([
                Validators.required,
            ])],
            // Non-restricted
            tokenLimit: [null, Validators.compose([
                Validators.required,
                Validators.pattern("^[0-9]*$"),
                Validators.min(1),
                Validators.max(10000),
            ])],
            // Restricted
            issueTo: [null, Validators.compose([
                Validators.required,
            ])],
        });
    }

    private async setupCompletionView(eventId: string, ipfsUri: string, owner: string) {
        this.eventData = {
            burnAuth: this.formControl['burnAuth'].value,
            count: 0,
            limit: this.restricted ? 0 : this.formControl['tokenLimit'].value,
            owner,
            restricted: this.restricted,
            uri: ipfsUri,
        }

        this.importantStuff.eventId = eventId;
        this.importantStuff.claimLink = `${this.baseUrl}/claim/${eventId}`;

        this.metaData = await this.fetchMetadata(this.eventData);

        this.viewScroller.scrollToPosition([0, 0]);
    }

}