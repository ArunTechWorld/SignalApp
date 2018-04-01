import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { CarLocationHomePageComponent } from '../../pages/car-location-home/car-location-home';
import { CollisionDetailsComponent } from '../collision-support/collision-details/collision-details';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
import { lojackPhone, lojackEmail, leftAnimationOptions, rightAnimationOptions, EmergencyPhone } from '../../helper/utils';


/**
 * Generated class for the CollisionSupportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collision-support',
  templateUrl: 'collision-support.html',
})
export class CollisionSupportPage {
  @ViewChild(Slides) slides: Slides;
  public preferedserviceshow = false;
  public collisiondata;
  public crashDetails = [{
    date: '',
    level: '',
    address: '',
    latlong: [],
    time: '',
    carename: '',
    stepcolorid: '',
  }];
  public crashdetailsdata = this.crashDetails[0];
  public authToken: '';
  public dealership: '';
  public preferredServiceCenter: '';
  public lojackPhone;
  public lojackEmail;
  public EmergencyPhone;
  public collisionassetid;
  public preferredServiceCenterName: '';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public sharedAPIProvider: SharedAPIProvider,
    private launchNavigator: LaunchNavigator,
  ) {
    this.lojackPhone = lojackPhone;
    this.lojackEmail = lojackEmail;
    this.EmergencyPhone = EmergencyPhone;
    this.collisiondata = navParams.get('data');
    this.collisionassetid = navParams.get('dataasset');
    if (this.collisiondata !== undefined) {
      this.crashdetailsdata.date =  this.collisiondata.date;
      this.crashdetailsdata.level = this.collisiondata.level;
      this.crashdetailsdata.address = this.collisiondata.address;
      this.crashdetailsdata.latlong = this.collisiondata.latlong;
      this.crashdetailsdata.time = this.collisiondata.time;
      this.crashdetailsdata.carename = this.collisiondata.carename;
    }
    this.getAssetById();

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CollisionSupportPage');
  }

  goToSlide() {
    this.slides.slideTo(2, 500);
  }

  slideChanged() {
    const currentIndex = this.slides.getActiveIndex();
    if (currentIndex === 0) {
      this.slides.lockSwipeToPrev(true);
    } else {
      this.slides.lockSwipeToPrev(false);
    }
    if (currentIndex === 3) {
      this.slides.lockSwipeToNext(true);
    } else {
      this.slides.lockSwipeToNext(false);
    }
  }

  backtohomepage() {
    this.navCtrl.setRoot(CarLocationHomePageComponent);

  }
  collisiondetails(crashdetailsdata) {
    this.navCtrl.push(CollisionDetailsComponent, { datadtails: crashdetailsdata });
  }

  preferedservice() {
  }
  getAssetById() {
    this.authToken = this.sharedAPIProvider.getUserInfo().response.authToken;
    this.sharedAPIProvider.getAssetsById(this.authToken, this.collisionassetid).then((res) => {
      if (res) {
        this.setdealerInfo(res);
      }
    },
   );
  }
  setdealerInfo(res) {
    console.log(res);
    this.dealership = (res.response.results[0].asset.dealership) ? res.response.results[0].asset.dealership : '';
    this.preferredServiceCenter = (this.dealership) ? res.response.results[0].asset.dealership.phone : '';
    this.preferredServiceCenterName = (this.dealership) ? res.response.results[0].asset.dealership.name : '';
    console.log('dealership');
    console.log(this.dealership);
    if (this.dealership) {
      this.preferedserviceshow = true;
    }
  }

  openUber() {
    console.log('openUber');
    const uberOptions: LaunchNavigatorOptions = {
      // start: 'London, ON',
      app: 'uber',
    };
    this.launchNavigator.navigate('Irvine, CA, USA', uberOptions)
      .then(
      success => console.log('Launched navigator'),
      error => console.log('Error launching navigator', error),
    );
  }

  openLyft() {
    console.log('openLyft');
    const uberOptions: LaunchNavigatorOptions = {
      // start: 'London, ON',
      app: 'lyft',
    };
    this.launchNavigator.navigate('Irvine, CA, USA', uberOptions)
      .then(
      success => console.log('Launched navigator'),
      error => console.log('Error launching navigator', error),
    );
  }
}
