import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, ModalController } from 'ionic-angular';
import { MaploaderComponent } from '../../components/maploader/maploader';
/*
  Generated class for the MapLoaderProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MapLoaderProvider {
  public mapLoadIndicator;
  public loaderState = false;
  constructor(public http: HttpClient, public modalCtrl: ModalController) {
    console.log('Hello MapLoaderProvider Provider');
  }

  showMapLoader(textInfo?: string){
    const showMsg = (textInfo) ? 'UPDATING LOCATION' : 'LOADING';
    if (!this.loaderState) {
      this.mapLoadIndicator = this.modalCtrl.create(MaploaderComponent, { messageInfo : showMsg },
                                                    { cssClass: 'pushnotifications-popup'});
      this.mapLoadIndicator.present();
      this.loaderState = true;
    }
  }
  hideMapLoader() {
    if (this.loaderState) {
      console.log('hideMapLoader Provider');
      this.mapLoadIndicator.dismiss();
      this.loaderState = false;
    }
  }
}
