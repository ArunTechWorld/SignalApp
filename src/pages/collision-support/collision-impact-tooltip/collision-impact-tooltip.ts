import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

/**
 * Generated class for the CollisionImpactTooltipComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'collision-impact-tooltip',
  templateUrl: 'collision-impact-tooltip.html',
})
export class CollisionImpactTooltipComponent {


  title: string;
  message: String;
  picture: String;

  constructor(private params: NavParams,
              public viewCtrl: ViewController) {
    this.title = params.get('title');
    console.log(this.title);
    this.picture = params.get('image');
    console.log(this.picture);
  }
  onEvent(event) {
    event.stopPropagation();
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

}
