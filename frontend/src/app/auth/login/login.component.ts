// TODO(nocs): tomorrow get this login working!. On the lander, when the user types in an email address, route them here with a query param
// On this page pull from that query param of their email address and hit submit!
// In that submit function, we should do one more check to see if the email input is valid.

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { catchError, of, Subject, take, takeUntil } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { AccountRequestService } from 'src/app/core/http/account/account-request.service';
import { RateLimitService } from 'src/app/core/services/rate-limit.service';
import { MagicLinkService } from 'src/app/shared/services/magic-link.service';
import Validation from 'src/app/shared/utils/validation.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  @ViewChild('emailInput') emailInput: ElementRef | undefined;

  public errorMessage: any;
  public form: FormGroup;
  public invalidEmail = false;
  public loginError = false;
  public submitting = false;


  public get formControls(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  private subscriptionKiller = new Subject();


  constructor(
    private accountRequestService: AccountRequestService,
    private formBuilder: FormBuilder,
    private magicLinkService: MagicLinkService,
    private rateLimitService: RateLimitService,
    private route: ActivatedRoute,
    private router: Router,
    private userAuthService: UserAuthService,
  ) {
    this.form = this.formBuilder.group({
      email: ['',
        [
          Validators.required,
          Validation.validateEmail,
        ]
      ],
    });
    this.rateLimitService.rateLimit = undefined;

    this.route.params.pipe(takeUntil(this.subscriptionKiller)).subscribe((params) => {
      const email = params['email'];
      if (email) {
        this.userAuthService.accessToken = undefined;
        this.userAuthService.didToken = null;

        this.formControls['email'].setValue(email);

        this.onSubmit();
      }
      else {
        const user = this.userAuthService.decodedToken;
        if (user) {
          this.formControls['email'].disable();
          this.formControls['email'].setValue(user.email);

          this.attemptLogin(user.email);
          return
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscriptionKiller.next(null);
    this.subscriptionKiller.complete();
  }

  public getErrorMessage(input: string): string {
    switch (input) {
      case 'email':

        if (!this.formControls['email'].errors) {
          return '';
        }

        if (this.formControls['email'].errors['validEmail']) {
          return 'Please enter a valid email.';
        }
        break;
    }

    return '';
  }


  public onSubmit() {
    if (this.formControls['email'].invalid) {
      this.formControls['email'].setErrors({ 'validEmail': true });
      return;
    }

    this.attemptLogin(this.formControls['email'].value);
  }

  private async attemptLogin(email: string) {
    this.loginError = false;
    this.submitting = true;

    try {
      const magicResponseToken = await this.magicLinkService.loginWithMagicLink(email, true);
      this.userAuthService.didToken = magicResponseToken;

      this.accountRequestService.login().pipe(
        take(1),
        catchError(err => of(err))
      ).subscribe((apiResponse) => {
        if (apiResponse.errorCode || apiResponse.error) {
          this.submitting = false;
          this.loginError = true;
          return;
        }

        if (apiResponse.success) {
          this.userAuthService.didToken = null;
          this.userAuthService.accessToken = apiResponse.success;

          this.router.navigate(['/']);
        }
      });
    } catch (error) {
      this.formControls['email'].enable();
      console.log('error: ', error);
      if (error instanceof RPCError) {
        switch (error.code) {
          case RPCErrorCode.UserRequestEditEmail:
            this.submitting = false;
            this.formControls['email'].setErrors({ 'incorrect': true });
            if (this.emailInput) {
              this.emailInput.nativeElement.focus();
            }
            break;
          case RPCErrorCode.MagicLinkFailedVerification:
          case RPCErrorCode.MagicLinkExpired:
          case RPCErrorCode.MagicLinkRateLimited:
          case RPCErrorCode.UserAlreadyLoggedIn:
            // TODO(nocs): Handle errors accordingly :)
            break;
        }
      }
    }
  }

}
