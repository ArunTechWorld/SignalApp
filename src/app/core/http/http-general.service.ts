import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
/*
  Common http servive to Fetch the Data from third party server, without any SureDrive Auth Token.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpGeneralService {

  constructor(public http: HttpClient) {
    console.log('Hello HttpgeneralProvider Provider');
  }

  get(url: string): Observable<any> {
    return this.http.get<any>(url)
      .pipe(
      tap((h) => {
        console.log(h);
      }),
      catchError(this.handleError<any>()),
      // catchError(this.handleError),
    );
  }

  public handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
