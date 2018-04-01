// http.interceptor.ts
import { Injectable, InjectionToken } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Pro } from '@ionic/pro';
import { AlertController, Events } from 'ionic-angular';

const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');
const defaultTimeout = 30000;
const sessionType2 = ['trips']; // 502 status
const sessionAvoidUrls = ['login', 'tripwire', 'speed', 'geozone'];

@Injectable()
export class MyHttpLogInterceptor implements HttpInterceptor {
  constructor(
    private events: Events,
    private alertCtrl: AlertController) { }
  private sessionStatus = true;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const timeout = Number(request.headers.get('timeout')) || defaultTimeout;

    Pro.getApp().monitoring.log('HttpRequest' + '-' + request.body, { level: 'info' });
    return next.handle(request)
    .do((ev: HttpEvent<any>) => {
      if (ev instanceof HttpResponse) {
       // console.log(ev);
        Pro.getApp().monitoring.log('HttpResponse' + '-' + ev.body, { level: 'info' });
      }
    })
    // .timeout(timeout)
    .catch((response) => {
      if (response instanceof HttpErrorResponse) {
        console.log(response);
        const requestUrl = this.checkUrl(response, sessionAvoidUrls);
        // console.log(response);
        if (requestUrl && response.status === 401) {
          this.sessionTimeout();
        }
        // const isResponseType2 = this.checkUrl(response, sessionType2);
        // if (isResponseType2 && (response.status === 500 || response.status === 501 || response.status === 502 || response.status === 503))  {
        //   this.sessionTimeout();
        // }
        Pro.getApp().monitoring.log('HttpErrorResponse' + '-' + response.error + '-' + response.message, { level: 'error' });
      }

      return Observable.throw(response);
    });
  }

  sessionTimeout() {
    if (this.sessionStatus) {
      this.sessionStatus = false;
      /* const alert = this.alertCtrl.create({
        title: 'Session Timeout',
        subTitle: 'Your session expired <br> Please click OK to continue session.',
        enableBackdropDismiss: false,
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.events.publish('user:relogin');
              setTimeout(() => {
                this.sessionStatus = true;
              },         4000);
            },
          },
        ],
      });
      alert.present(); */
      this.events.publish('user:relogin');
      setTimeout(() => {
        this.sessionStatus = true;
      },         4000);
    }
  }

  checkUrl(response, arrayEle) {
    const url = response.url;
    if  (url  ===  null) {
      return  false;
    }
    for (let i = 0; i < arrayEle.length; i += 1) {
      const urlText = arrayEle[i];
      if (url.indexOf(urlText) > -1) {
        return false;
      }
    }
    return true;
  }
}
