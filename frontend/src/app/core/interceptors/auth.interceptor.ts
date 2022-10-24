import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAuthService } from '../auth/user/user-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private userAuthService: UserAuthService) {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();

        // Request
        //
        // If the access token is stored, add the Authorization header.
        // We won't add the Authorization header if the access token isn't stored.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and we can handle however we see fit. 
        if (this.userAuthService.accessToken) {
            newReq = req.clone({
                headers: req.headers.set('x-access-token', this.userAuthService.accessToken)
            });
        }
        if (this.userAuthService.didToken) {
            newReq = req.clone({
                headers: req.headers.set('x-did-token', this.userAuthService.didToken)
            });
        }

        // Response
        return next.handle(newReq);
    }
}
