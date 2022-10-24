import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { UserAuthService } from 'src/app/core/auth/user/user-auth.service';
import { AccountRequestService } from 'src/app/core/http/account/account-request.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    public router: Router,
    private accountRequestService: AccountRequestService,
    private userAuthService: UserAuthService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise(res => {
      // this.accountRequestService.refreshToken().pipe(take(1)).subscribe((apiResponse) => {
      //   if (apiResponse.success) {
      //     this.userAuthService.accessToken = apiResponse.success;
      //     res(true);
      //   }
      //   else {
      //     this.userAuthService.accessToken = undefined;
      //     this.userAuthService.didToken = null;
  
      //     this.router.navigate(['/auth/login']);
      //     res(false);
      //   }
      // });

      res(true);
    });

    // // Check if user is logged in or not. 
    // let user = this.userAuthService.decodedToken;
    // if (!user || user === null) {
    //   this.router.navigate(['/auth/login']);
    //   return true
    // }
    // else if (user) {
    //   if (!Object.keys(user).length) {
    //     this.router.navigate(['/auth/login']);
    //     return true
    //   }
    // }
    // return true
  }

}
