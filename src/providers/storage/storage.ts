import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {

  constructor(public platform: Platform, private secureStorage: SecureStorage) {
    console.log('Hello StorageProvider Provider');
    this.isMobileApp = false; // ((this.platform.is('core') || this.platform.is('mobileweb'))) ? false : true;
    if (this.isMobileApp) {
      this.init();
    }
  }
  private storage;
  private isMobileApp;
  init() {
    console.log('initializing storage');
    // this.secureStorage.create('lojackStorage')
    //   .then((storage: SecureStorageObject) => {
    //     this.storage = storage;
    //     console.log('initializing storage successfull');
    //   },
    //         (error) => {
    //           console.log(error);
    //         });
  }

  get(key) {
  //  return new Promise<void>((resolve, reject) => {
    if (this.isMobileApp) {
      this.storage.get(key)
        .then(
        ((data) => {
          console.log(data);
          return data;
        }),
        ((error) => {
          console.log(error);
        }),
      );
    } else {
      const val = localStorage.getItem(key);
      return val;
    }
    // });
  }

  set(key, value) {
    if (this.isMobileApp) {
      this.storage.set(key, value)
        .then(
        ((data) => {
          console.log(data);
          // return data;
        }),
        ((error) => {
          console.log(error);
        }),
      );
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  remove(key) {
    if (this.isMobileApp) {
      this.storage.remove(key)
        .then(
        ((data) => {
          console.log(data);
         // return data;
        }),
        ((error) => {
          console.log(error);
        }),
      );
    } else {
      localStorage.removeItem(key);
    }
  }

}
