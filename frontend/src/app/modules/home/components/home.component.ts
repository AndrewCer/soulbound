import { animate, style, transition, trigger } from '@angular/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, Subject, Subscription, switchMap, take, takeUntil } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { AiRequestService } from 'src/app/core/http/ai/ai-request.service';
import { FeedbackRequestService } from 'src/app/core/http/feedback/feedback-request.service';
import { RateLimitService } from 'src/app/core/services/rate-limit.service';
import { SnackBarFeedbackComponent } from 'src/app/shared/components/snack-bars/feedback/snack-bar-feedback.component';
import { ContentFilterLabel } from 'src/app/shared/models/content-filter.model';
import { Document, FeedbackRank } from 'src/app/shared/models/document.model';
import { ErrorCode } from 'src/app/shared/models/error-code.model';
import { Membership, User } from 'src/app/shared/models/user.model';
import { StringFormatterService } from 'src/app/shared/services/string-formatter.service';

export enum SummaryType {
    doc = 'doc',
    text = 'text',
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [
        trigger('fadeAnimation', [
            transition('void => *', []),
            transition('* => void', []),
            transition('*=>*', [
                style({ opacity: 0 }),
                // Animation fades in over 1000ms and starts after 150ms
                animate('1000ms 150ms', style({ opacity: 1 }))
            ]),
        ])
    ]
})
export class HomeComponent implements OnDestroy {
    @ViewChild('negativeFeedbackTextarea') negativeFeedbackTextarea: ElementRef | undefined;

    public bulletedListTldr: string[] | undefined;
    public contentFilterLable: ContentFilterLabel | undefined;
    public document: Document | undefined; // The currently viewed document
    public documentSummary = true;
    public feedbackGiven = false;
    public mobileScreen = false; // Triggered at or below 550px
    public form: FormGroup; // NOTE(nocs): for used for input text
    public headerTitle = 'Home';
    public negativeFeedback = {
        displayTextBox: false,
        submitting: false,
    }
    public negativeFeedbackControl = new FormControl('');
    public outputForm: FormGroup; // NOTE(nocs): for used for output text. Only needed if AI doesn't return bullet point list.
    public pointCost: number = 0;
    public submitting = false;
    public summaryTypeControl = new FormControl('');
    public scrollBottomOnSubmit = false;
    public user: User | undefined;
    public wordCount = 0;
    public yesterday = Date.now() - (24 * 60 * 60 * 1000);

    // File upload
    public imgSrc: string | undefined;
    public loadingTextToggle = false;
    public pdfSrc: string | undefined;
    public requestChainSubscription: Subscription | undefined;
    public uploadProgress: number = 0;
    public uploadProgressText = '';
    public uploadSub: Subscription | undefined;
    public viewingSummary = false;

    public get formControls(): { [key: string]: AbstractControl } {
        return this.form.controls;
    }
    public get outputFormControls(): { [key: string]: AbstractControl } {
        return this.outputForm.controls;
    }

    public get ContentFilterLabelType() {
        return ContentFilterLabel;
    }

    private body: any = document.querySelector('body');
    private onePoint = 500; // 500 words = 1 point.
    private subscriptionKiller = new Subject();

    constructor(
        public stringFormatterService: StringFormatterService,
        public rateLimitService: RateLimitService,
        private aiRequestService: AiRequestService,
        private breakpointObserver: BreakpointObserver,
        private feedbackRequestService: FeedbackRequestService,
        private formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private userAuthService: UserAuthService,
        private viewportScroller: ViewportScroller,
    ) {
        // Detect screen size changes
        this.breakpointObserver.observe([
            '(max-width: 1200px)'
        ]).pipe(takeUntil(this.subscriptionKiller)).subscribe((result: BreakpointState) => {
            this.scrollBottomOnSubmit = result.matches
        });
        this.breakpointObserver.observe([
            '(max-width: 550px)'
        ]).pipe(takeUntil(this.subscriptionKiller)).subscribe((result: BreakpointState) => {
            this.mobileScreen = result.matches;
        });

        this.user = this.userAuthService.decodedToken;
        this.userAuthService.$accessTokenChanges.pipe(takeUntil(this.subscriptionKiller)).subscribe((token) => {
            this.user = this.userAuthService.decodedToken;
        });

        this.summaryTypeControl.valueChanges.pipe(takeUntil(this.subscriptionKiller)).subscribe((changes) => {
            if (changes === SummaryType.doc) {
                this.documentSummary = true;
            }
            else {
                this.documentSummary = false;
            }
        });

        this.outputForm = this.formBuilder.group(
            {
                outputText: [''],
            }
        );
        this.form = this.formBuilder.group(
            {
                inputText: ['',
                    [
                        Validators.required,
                        Validators.minLength(10)
                    ]
                ],
            },
        );
        this.form.valueChanges.pipe(takeUntil(this.subscriptionKiller)).subscribe(changes => {
            if (changes.inputText || changes.inputText === '') {
                this.wordCount = this.getWordCount(this.formControls['inputText'].value);
                if (this.wordCount <= this.onePoint && this.wordCount !== 0) {
                    this.pointCost = 1;
                }
                else {
                    this.pointCost = Math.ceil(this.wordCount / this.onePoint);
                }

                if (!this.user) {
                    return;
                }

                // if (this.wordCount > 1000) {
                //     this.formControls['inputText'].setErrors({ 'tooManyWords': true });
                // }
                if (this.wordCount < 50) {
                    this.formControls['inputText'].setErrors({ 'tooLittleWords': true });
                }

                if (this.user.membership !== Membership.pro && this.pointCost > this.user.credits + this.user.creditsBonus) {
                    this.formControls['inputText'].setErrors({ 'notEnoughPoints': true });
                }
            }
        });
    }

    ngOnDestroy() {
        this.subscriptionKiller.next(null);
        this.subscriptionKiller.complete();
    }

    public getErrorMessage(input: string): string {
        if (!this.user) {
            return ''
        }

        switch (input) {
            case 'inputText':
                if (!this.formControls['inputText'].errors || this.formControls['inputText'].errors['dupe']) {
                    return '';
                }

                if (this.formControls['inputText'].errors['invalidText']) {
                    return 'Please input text.';
                }

                if (this.formControls['inputText'].errors['tooLittleWords']) {
                    return 'Text must be at least 50 words long.';
                }

                if (this.formControls['inputText'].errors['tooManyWords']) {
                    // return 'During Beta, you are limited to summarizing 1,000 words at a time. Only the first 1000 words of this text will be summarized.';
                }

                if (this.formControls['inputText'].errors['tooManyRequests']) {
                    return 'You have made too many requests recently. Please wait 60 seconds and then try again.';
                }

                if (this.formControls['inputText'].errors['noDataReturned']) {
                    return `Sorry, the AI wasn't able to create a summary. Your points have been refunded. This can sometimes happen if your input text already has a summary or TL;DR at the top of it. Please check and try again.`;
                }

                if (this.formControls['inputText'].errors['somethingWrong']) {
                    return 'Something went wrong, please wait a few minutes, modify the text box and then try again.';
                }
                break;
        }

        return '';
    }

    public onBreadcrumbClick(breadcrumb: string) {
        // Reset everything
        if (breadcrumb === 'Home') {
            this.feedbackGiven = false;
            this.document = undefined;
            this.headerTitle = 'Home';
            this.viewingSummary = false;
            this.submitting = false;
            this.pdfSrc = undefined;
            this.imgSrc = undefined;
            this.outputFormControls['outputText'].reset();
            this.bulletedListTldr = undefined;

            // Remove the subscription so when data returns it doesn't bork up the UI
            if (this.requestChainSubscription && !this.requestChainSubscription.closed) {
                this.requestChainSubscription.unsubscribe();
            }
        }
    }

    public onFeedbackClick(feedback: FeedbackRank) {
        if (this.document && this.document.feedbackRank === feedback) {
            return;
        }

        if (!feedback) {
            this.negativeFeedback.displayTextBox = true;

            // Scroll to top and focus element
            setTimeout(() => {
                if (this.negativeFeedbackTextarea) {
                    this.negativeFeedbackTextarea.nativeElement.focus();
                }
                this.viewportScroller.scrollToPosition([0, 0]);
            }, 200);
        }
        else {
            this.feedbackGiven = true;

            this.displayFeedbackSnackBar();
        }

        this.submitFeedback(feedback, true);
    }

    public onFileSelected(event: Event | DragEvent) {
        // Typecasting to account for both drack and click events
        let inputElement = (event as DragEvent).dataTransfer ? (event as DragEvent).dataTransfer : (event.target as HTMLInputElement)

        // Collapse side nav for move viewing space - but not on smaller devices
        if (!this.body.classList.contains('sidenav-toggled') && !this.scrollBottomOnSubmit) {
            this.body.classList.toggle('sidenav-toggled');
        }

        this.headerTitle = 'Back';

        this.outputFormControls['outputText'].reset();
        this.bulletedListTldr = undefined;

        if (inputElement && inputElement.files) {
            const file = inputElement.files[0];

            if (file.type.toLowerCase().includes('pdf')) {
                this.pdfSrc = URL.createObjectURL(file);
            }
            if (file.type.toLowerCase().includes('tiff')) {
                this.imgSrc = URL.createObjectURL(file);
            }

            const formData = new FormData();

            formData.append('uploaded-document', file);

            this.submitting = true;
            this.viewingSummary = true;
            this.uploadProgressText = 'Uploading document';

            if (this.scrollBottomOnSubmit) {
                setTimeout(() => {
                    this.viewportScroller.scrollToPosition([0, 1000]);
                }, 500);
            }

            this.runDocumentUploadChain(formData);
        }
    }

    public async onSubmit() {
        if (this.formControls['inputText'].invalid) {
            this.formControls['inputText'].setErrors({ 'invalidText': true });
            return;
        }

        if (!this.user) {
            return;
        }
        const totalPoints = this.user.credits + this.user.creditsBonus;
        if (this.user.membership !== Membership.pro && totalPoints - this.pointCost < 0) {
            this.formControls['inputText'].setErrors({ 'notEnoughPoints': true });
            return;
        }

        // Rate limiter
        const rateLimit = this.rateLimitService.rateLimit;
        if (rateLimit && rateLimit.totalRequests >= 60) {
            this.formControls['inputText'].setErrors({ 'tooManyRequests': true });
            this.rateLimitService.startThrottleTimer();
            return
        }
        if (!rateLimit) {
            this.rateLimitService.rateLimit = {
                totalRequests: 1,
            }
        }
        else {
            this.rateLimitService.rateLimit = {
                totalRequests: rateLimit.totalRequests++
            }
        }

        this.outputFormControls['outputText'].reset();
        this.bulletedListTldr = undefined;

        this.submitting = true;
        this.uploadProgressText = 'Summarizing';

        if (this.scrollBottomOnSubmit) {
            setTimeout(() => {
                this.viewportScroller.scrollToPosition([0, 1000]);
            }, 500);
        }

        this.feedbackGiven = false;
        this.headerTitle = 'Back';

        this.aiRequestService.postText(this.formControls['inputText'].value).pipe(take(1)).subscribe((apiResponse) => {
            if (apiResponse.errorCode || !apiResponse.success) {
                this.submitting = false;

                if (apiResponse.errorCode === ErrorCode.noDataReturned) {
                    this.formControls['inputText'].setErrors({ 'noDataReturned': true });
                    return;
                }

                this.formControls['inputText'].setErrors({ 'somethingWrong': true });
                return;
            }

            const tldrReturn = apiResponse.success;
            this.contentFilterLable = tldrReturn.contentFilterLabel;
            this.document = tldrReturn.document;
            this.viewingSummary = true;

            if (this.user) {
                let pointCost = this.pointCost;

                if (this.user.credits - pointCost < 0) {
                    pointCost = pointCost - this.user.credits;
                    this.user.credits = 0;
                    this.user.creditsBonus = this.user.creditsBonus - pointCost;
                }
                else {
                    this.user.credits = this.user.credits - pointCost;
                }

                this.userAuthService.refreshToken();
            }

            this.submitting = false;

            this.formControls['inputText'].setErrors({ 'dupePrevention': true });
            this.form.markAsDirty();

            // Update output box with results
            this.outputFormControls['outputText'].setValue(apiResponse.success);
            const splitReponse = tldrReturn.text.split('\n-');
            if (splitReponse?.length) {
                this.bulletedListTldr = splitReponse.filter((bulletPoint) => {
                    if (!bulletPoint.length) {
                        return;
                    }

                    return bulletPoint.trim();
                });
            }
        });
    }

    public submitFeedback(feedbackRank: FeedbackRank, triggeredFromComponent: boolean) {
        if (this.document) {
            this.negativeFeedback.submitting = true;

            this.feedbackRequestService.postFeedback(this.document.id, feedbackRank, this.negativeFeedbackControl.value).pipe(takeUntil(this.subscriptionKiller)).subscribe((apiResponse) => {
                this.negativeFeedback.submitting = false;

                if (apiResponse.success) {
                    // We record thumb down even immediatly but also dont want to reset form.
                    // submitFeedback is also triggered from the template when the text feedback form is submitted.
                    if (triggeredFromComponent && feedbackRank === FeedbackRank.thumbDown) {
                        return;
                    }

                    this.document = apiResponse.success.document;

                    if (feedbackRank === FeedbackRank.thumbDown) {
                        this.displayFeedbackSnackBar();
                    }

                    this.negativeFeedback.displayTextBox = false;
                    this.feedbackGiven = true;

                    this.negativeFeedbackControl.reset();
                }


            });

        }
    }

    private displayFeedbackSnackBar() {
        this.snackBar.openFromComponent(SnackBarFeedbackComponent, {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: this.mobileScreen ? 'bottom' : 'top'
        });
    }

    private getWordCount(string: string) {
        if (!string) {
            return 0;
        }
        return string.split(' ').length;
    }

    private resetUpload() {
        this.uploadProgress = 0;
        this.uploadSub = undefined;
        this.uploadProgressText = '';
    }

    private runDocumentUploadChain(formData: FormData) {
        this.requestChainSubscription = this.aiRequestService.uploadDocument(formData).pipe(
            take(1),
            switchMap((uploadDocApiResponse) => {
                if (uploadDocApiResponse.success) {
                    this.document = uploadDocApiResponse.success.document;

                    this.uploadProgressText = 'Extracting document text';
                    return this.aiRequestService.extractDocumentText(uploadDocApiResponse.success.document.id);
                }
                else {
                    throw new Error(uploadDocApiResponse.error);
                }
            }),
            switchMap((extractDocApiResponse) => {
                if (extractDocApiResponse.success) {
                    this.uploadProgressText = 'Summarizing';
                    // TODO(nocs): after x seconds, start cycling uploadProgressText with creative/fun strings
                    return this.aiRequestService.documentSummarization(extractDocApiResponse.success.documentId);
                }
                else {
                    throw new Error(extractDocApiResponse.error);
                }
            }),
            finalize(() => this.resetUpload()),
            catchError((error) => {
                // TODO(nocs): handle errors
                this.submitting = false;
                throw new Error(`ERROR with document upload: ${error}`);
            })
        ).subscribe((apiResponse) => {
            if (!apiResponse.success) {
                // TODO(nocs): handle errors
                return;
            }

            const tldrReturn = apiResponse.success;

            this.submitting = false;

            this.formControls['inputText'].setErrors({ 'dupePrevention': true });
            this.form.markAsDirty();

            // Update output box with results
            this.outputFormControls['outputText'].setValue(apiResponse.success);
            const splitReponse = tldrReturn.text.split('\n-');
            if (splitReponse?.length) {
                this.bulletedListTldr = splitReponse.filter((bulletPoint) => {
                    if (!bulletPoint.length) {
                        return;
                    }

                    return bulletPoint.trim();
                });
            }
        });
    }
}
