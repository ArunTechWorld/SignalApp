import { Injectable } from '@angular/core';
import {
  Http, ConnectionBackend, RequestOptions, Request, Response, RequestOptionsArgs, RequestMethod, ResponseOptions,
} from '@angular/http';
import { extend } from 'lodash';
import { Observable } from 'rxjs/Rx';
import { Subscriber } from 'rxjs/Subscriber';
import { Logger } from '../logger.service';


const log = new Logger('HttpService');

import { ENV } from '../../../environments/environment';

@Injectable()
export class HttpService {

  authToken: string;
  constructor(
    private http: Http,
  ) { }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, extend({}, options, { method: RequestMethod.Get }));
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, extend({}, options, {
      body,
      method: RequestMethod.Post,
    }));
  }

  request(request: string, options?: RequestOptionsArgs): Observable<any> {
    const requestOptions = options || {};
    const url: string = request;
    const params: URLSearchParams = new URLSearchParams();
    if (this.authToken) {
      params.set('token_auth', this.authToken);
    }

    // var options = new RequestOptions();
    // options.search = params;
    return this.http.request(url, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    // console.log(res);
    const body = res.json();
    // if(body.result === 'error') {
    //     console.log(body);
    //    return Observable.throw(body);
    // }
    // console.log(body);
    return body || {};
  }
  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    // console.error(errMsg);
    log.error('Request error', error);
    return Observable.throw(errMsg);
  }

}
