import { Component, OnInit, ElementRef, Renderer, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { API_ENDPOINTS } from '../../../helper/apiEndPoints';
import { HttpGeneralService } from '../../../app/core/http/http-general.service';
import { PlaceSuggestionsModel } from './place-suggestions.model';
/**
 * Generated class for the PlaceSearchComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-place-search',
  templateUrl: 'place-search.html',
})
export class PlaceSearchComponent implements OnInit {
  @Output() selectedPlaceAddress = new EventEmitter<any>();
  @Output() enteredPlaceName = new EventEmitter<any>();
  @Output() isInputFocus = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private httpGeneralService: HttpGeneralService,
    public element: ElementRef,
    public renderer: Renderer,
  ) {
    console.log('Hello PlaceSearchComponent Component');
    // console.log(this.searchResults);
  }

  private searchResultsAddress: Observable<any>;
  private searchAddress = new Subject<string>();
  private selectedAddressName: string;
  private placeNameModel: string;
  private maxSuggestions: number = 6;
  private selectedPlaceIcon: string = 'State_Location';
  private placeName;
  private showErrorMessage;

  @Input()
  set currentPlaceIcon(value) {
    if (value) {
      // console.log('currentPlaceIcon');
      // console.log(value);
      this.selectedPlaceIcon = value;
    }
  }
  @Input()
  set currentPlaceName(value) {
    if (value) {
      this.placeNameModel = value;
    }
  }
  @Input()
  set currentAddress(value) {
    if (value) {
      this.selectedAddressName = value;
    }
  }
  @Input()
  set errorMessage(value) {
    if (value) {
      this.showErrorMessage = value;
    }
  }
  ngOnInit() {
    this.searchResultsAddress = this.searchAddress.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.getPlaces(term)),
    );

    const placeResults = this.element.nativeElement.querySelector('.search-results');
    // this.renderer.invokeElementMethod(this.element.nativeElement, 'addEventListener', ['transitionend', (e) => {
    //   this.renderer.setElementStyle(this.element.nativeElement, 'visibility', 'hidden');
    // }, { once: true }]);
  }
  addressChange(address: string) {
    // console.log(address);
    const placeResults = this.element.nativeElement.querySelector('.search-results');
    const placeIcon = this.element.nativeElement.querySelector('#placeIcon');
    if (address.length > 0) {
      // this.renderer.setElementStyle(placeResults, 'display', 'block');
      // this.renderer.setElementStyle(placeIcon, 'position', 'absolute');
      // this.renderer.setElementStyle(placeIcon, 'top', '10px');
      this.searchAddress.next(address);
    } else {
      this.renderer.setElementStyle(placeResults, 'display', 'none');
      this.renderer.setElementStyle(placeIcon, 'position', 'initial');
      // this.searchResultsAddress = Observable.of([]);
    }
  }

  getPlaces(searchTerm: string): Observable<any> {
    // console.log('getPlaces');
    const url = `${API_ENDPOINTS.placeSeearchUrl}?f=json&text=${searchTerm}&maxSuggestions=${this.maxSuggestions}`;
    return this.http.get<PlaceSuggestionsModel>(url)
      .pipe(
      map((result: PlaceSuggestionsModel) => result.suggestions.map((value) => {
        const placeArray = value.text.split(',');
        const placeName = placeArray.slice(1);
        const placeResults = this.element.nativeElement.querySelector('.search-results');
        const placeIcon = this.element.nativeElement.querySelector('#placeIcon');
        this.renderer.setElementStyle(placeResults, 'display', 'block');
        this.renderer.setElementStyle(placeIcon, 'position', 'absolute');
        this.renderer.setElementStyle(placeIcon, 'top', '10px');
        return {
          text: value.text,
          magicKey: value.magicKey,
          placeName: placeArray.length >= 2 ? `${placeArray[0]},${placeArray[1]}` : placeArray[0],
          placeAddress: placeArray.slice(2),
        };
      })),
      // tap((result) => {
      //   // console.log(h);
      //   return result.suggestions;
      // }),
      // do(result => result.suggestions),

      catchError(this.httpGeneralService.handleError()),
    );
  }

  reSearch() {
    // console.log(this.selectedAddressName);
    if (this.selectedAddressName.length <= 0) {
      this.addressChange(this.selectedAddressName);
    }
  }

  placeNameChanged() {
    // console.log(this.selectedAddressName);
    if (this.placeNameModel.length <= 0) {
      this.enteredPlaceName.emit('');
    }
  }
  placeFocus() {
    this.enteredPlaceName.emit('');
    this.isInputFocus.emit(true);
  }
  placeFocusOut() {
    this.isInputFocus.emit(false);
  }
  addressFocusOut() {
    this.isInputFocus.emit(false);
  }
  addressFocus() {
    this.isInputFocus.emit(true);
  }

  itemSelected(item) {
    const placeResults = this.element.nativeElement.querySelector('.search-results');
    const placeIcon = this.element.nativeElement.querySelector('#placeIcon');
    this.renderer.setElementStyle(placeResults, 'display', 'none');
    this.renderer.setElementStyle(placeIcon, 'position', 'initial');
    // console.log('item magicKey');
    // console.log(item.magicKey);
    this.selectedAddressName = item.text;
    this.getLocation(item).subscribe((response) => {
      this.selectedPlaceAddress.emit(response);
    });
  }
  changePlaceName(val) {
    this.enteredPlaceName.emit(val);
  }

  getLocation(item): Observable<any> {
    const url = `${API_ENDPOINTS.findAddressCandidates}?f=json&magicKey=${item.magicKey}&SingleLine=${item.text}`;
    return this.http.get(url)
      .pipe(
        // map(result => result.suggestions.map((value) => {
        //   const placeArray = value.text.split(',');
        //   const placeName = placeArray.slice(1);
        //   return {
        //     magicKey: value.magicKey,
        //     placeName: placeArray.length >= 2 ? `${placeArray[0]},${placeArray[1]}` : placeArray[0],
        //     placeAddress: placeArray.slice(2),
        //   };
        // })),
        catchError(this.httpGeneralService.handleError()),
    );
  }

}
