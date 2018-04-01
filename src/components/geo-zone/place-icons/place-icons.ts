import { Component, EventEmitter, Output } from '@angular/core';

/**
 * Generated class for the PlaceIconsComponent component.
 *
 * This is Placeicons List component
 */
@Component({
  selector: 'app-place-icons',
  templateUrl: 'place-icons.html',
})
export class PlaceIconsComponent {

  @Output() selectedPlaceIcon = new EventEmitter<string>();

  iconList = [
    {
      icon: 'State_Location',
      name: 'Location',
      isSelected: false,
    },
    {
      icon: 'State_Home',
      name: 'Home',
      isSelected: false,
    },
    {
      icon: 'State_Work',
      name: 'Work',
      isSelected: false,
    },
    {
      icon: 'State_School',
      name: 'School',
      isSelected: false,
    },
    {
      icon: 'State_People',
      name: 'People',
      isSelected: false,
    },
    {
      icon: 'State_Grocery',
      name: 'Grocery',
      isSelected: false,
    },
    {
      icon: 'State_Gym',
      name: 'Gym',
      isSelected: false,
    },
    {
      icon: 'State_Shopping',
      name: 'Shopping',
      isSelected: false,
    },
  ];
  constructor() {
    console.log('Hello PlaceIconsComponent Component');
  }

  private iconsPath: string = 'assets/svg/places_icons';

  itemSelected(item) {
    // console.log('item');
    // console.log(item);
    const datesGroupLen = this.iconList.length;
    for (let i = 0; i < datesGroupLen; i += 1) {
      if (item === this.iconList[i]) {
        this.iconList[i].isSelected = true;
        this.selectedPlaceIcon.emit(this.iconList[i].icon);
      } else {
        this.iconList[i].isSelected = false;
      }
    }
  }

}
