import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
    selector: 'create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss'],
})
export class CreateComponent implements OnDestroy {
    public form: FormGroup;
    public submitting: boolean = false;

    private subscriptionKiller = new Subject();

    // Two types of creation: 1) with existing uri - given by user. 2) without a uri - we build out the metadata

    public get formControl(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }

    constructor(
        private formBuilder: FormBuilder,
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
              Validators.pattern('^([0-9]+)$')
            ])]
          })
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }

    public submit() {

    }

    public onImgSelected(event: Event | DragEvent) {
        console.log(event);
        
    }

}