
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(
        private http: HttpClient,
    ) { }

    /**
    * Sends a request to the PI, returning the data as a basic object
    * @param method The HTTP method to use. Ex: 'get', 'post', 'put', 'delete'
    * @param path The relative path from the object's base endpoint. Ex: 'v1/news'
    * @param params The parameters to pass to the endpoint.
    */
    public request(method: string, path: string, params?: any): Observable<any> {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        const options: any = { headers };
        const url = environment.apiUrl + path;

        if (params && (method === 'get' || method === 'delete')) {
            let httpParams = new HttpParams();
            Object.entries(params).forEach(([key, val]) => {
                httpParams = httpParams.set(`${key}`, `${val}`);
            });
            options.params = httpParams;
        }

        switch (method.toLocaleLowerCase()) {
            case 'get':
                return this.http.get(url, options);
            case 'post':
                return this.http.post(url, params ? params : undefined, options);
            case 'patch':
                return this.http.patch(url, params ? params : undefined, options);
            case 'put':
                return this.http.put(url, params ? params : undefined, options);
            case 'delete':
                return this.http.delete(url, options);
            default:
                throw new Error('Unsupported HTTP verb.')
        }
    }

    public requestMultipart(method: string, path: string, body: any): Observable<any> {
        const url = environment.apiUrl + path;

        switch (method.toLocaleLowerCase()) {
            case 'post':
                return this.http.post(url, body);
            case 'patch':
                return this.http.patch(url, body);
            case 'put':
                return this.http.put(url, body);
            default:
                throw new Error('Unsupported HTTP verb.')
        }
    }

}