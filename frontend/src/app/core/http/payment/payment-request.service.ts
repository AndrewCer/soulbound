import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from 'src/app/core/http/api/api.service';
import { ApiResponse, RequestMethod } from 'src/app/shared/models/api.model';
import { PriceType } from 'src/app/shared/models/payment.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentRequestService {
    private basePath = 'payment';
    private versionPath = `/v1/${this.basePath}`

    constructor(private apiService: ApiService) { }

    public cancelSubscriptionUndo(subscriptionId: string): Observable<ApiResponse<any>> {
        const path = `${this.versionPath}/cancel-subscription-undo/${subscriptionId}`;
        return this.apiService.request(RequestMethod.patch, path);
    }

    public cancelSubscription(subscriptionId: string): Observable<ApiResponse<any>> {
        const path = `${this.versionPath}/cancel-subscription/${subscriptionId}`;
        return this.apiService.request(RequestMethod.delete, path);
    }

    public createCheckoutSession(price: string): Observable<ApiResponse<string>> {
        const path = `${this.versionPath}/create-checkout-session`;
        return this.apiService.request(RequestMethod.post, path, { price });
    }

    public updateSubscription(subscriptionId: string, newPriceType: PriceType): Observable<ApiResponse<any>> {
        const path = `${this.versionPath}/update-subscription/${subscriptionId}`;
        return this.apiService.request(RequestMethod.patch, path, { newPriceType });
    }
}
