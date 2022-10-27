import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { first, Subject, take } from 'rxjs';
import { FileRequestService } from 'src/app/core/http/file/file-request.service';
import { WalletService } from 'src/app/shared/services/wallet.service';


@Component({
    selector: 'create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnDestroy {
    @ViewChild('attributesModal') attributesModal!: TemplateRef<any>;
    public dialogRef!: MatDialogRef<any>;
    public fileFormData = new FormData();

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
        private fileRequestService: FileRequestService,
        private formBuilder: FormBuilder,
        private walletService: WalletService,
    ) {
        // this.form = this.formBuilder.group(
        //     {
        //         inputText: ['',
        //             [
        //                 Validators.required,
        //                 Validators.minLength(10)
        //             ]
        //         ],
        //     },
        // );

        this.form = this.formBuilder.group({
            name: [null, Validators.compose([
                Validators.required,
                Validators.pattern('^([a-zA-Z\s]+)$')
            ])],
            description: [null, Validators.compose([
                Validators.required,
                Validators.pattern('^([0-9]+)$')
            ])],
            externalLink: [null, Validators.compose([
                Validators.required,
                Validators.pattern('^([0-9]+)$'),
            ])],
            burnAuth: ['2', Validators.compose([
                Validators.required,
                Validators.pattern('^([0-9]+)$'),
            ])],
            // Non-restricted
            tokenLimit: [null, Validators.compose([
                Validators.required,
                Validators.pattern("^[0-9]*$"),
                Validators.minLength(1),
                // TOOD(nocs): validator to restrict this to 10,000 and below
            ])],
            // Restricted
            issueTo: [null, Validators.compose([
                Validators.required,
                Validators.pattern('^([0-9]+)$')
            ])],
        });
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

    public async submit() {
        this.submitting = true;

        // if (this.form.invalid) {
        //     return;
        // }

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

            // Call contract
            if (!this.restricted) {
                const txn = await this.walletService.createTokenWithLimit(ipfsUri, parseInt(this.formControl['tokenLimit'].value), parseInt(this.formControl['burnAuth'].value));

                this.submitting = false;
            }
        });

    }

    public imgURL: string | undefined;
    public onImageSelected(event: Event | DragEvent) {
        // Typecasting to account for both drack and click events
        let inputElement = (event as DragEvent).dataTransfer ? (event as DragEvent).dataTransfer : (event.target as HTMLInputElement)
        console.log(event);

        this.fileFormData = new FormData();

        if (inputElement && inputElement.files) {
            const file = inputElement.files[0];

            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.imgURL = reader.result as string;
            }

            this.imgURL = URL.createObjectURL(file);

            this.fileFormData.append('uploaded-image', file);
        }
    }

}