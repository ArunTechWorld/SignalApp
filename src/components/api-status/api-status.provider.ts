import { Injectable } from '@angular/core';
import * as _ from 'lodash';

/*
  Generated class for the Api Status provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiStatusProvider {
  public statusRequests = {
    submit: [],
    success: [],
    failure: [],
  };
  public requestCount: number = 0;
  constructor() {
    console.log('Hello ApiStatus Provider');
  }

  addRequest(id, request, type, message) {
    this.removeAllRequests();
    this.statusRequests.submit[0] = { id, request, type, message };
    this.updateRequestCount();
  }

  updateRequest(id, request, type, message, status) {
    this.removeAllRequests();
    if (status === 'success') {
      this.statusRequests.success[0] = { id, request, type, message };
    } else {
      this.statusRequests.failure[0] = { id, request, type, message };
    }
    this.updateRequestCount();
  }

  removeFailureRequest(apiRequest) {
    this.statusRequests.failure = [];
    this.updateRequestCount();
  }

  removeSuccessRequest(apiRequest) {
    this.statusRequests.success = [];
    this.updateRequestCount();
  }

  removeAllRequests() {
    this.statusRequests.submit = [];
    this.statusRequests.success = [];
    this.statusRequests.failure = [];
    this.requestCount = 0;
  }

  updateRequestCount() {
    this.requestCount = this.statusRequests.submit.length + this.statusRequests.success.length + this.statusRequests.failure.length;
  }

  getRequests() {
    return {
      statusRequests: this.statusRequests,
      requestCount: this.requestCount,
    };
  }
}
