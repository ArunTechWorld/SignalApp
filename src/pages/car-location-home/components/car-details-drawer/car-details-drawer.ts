import { Component, Input, ElementRef, Renderer, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Platform, DomController } from 'ionic-angular';

/**
 * Generated class for the ContentDrawerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-car-details-drawer-comp',
  templateUrl: 'car-details-drawer.html',
})
export class CarDetailsDrawerComponent {

  @Output() isScrollEnd = new EventEmitter<boolean>();

  handleHeight: number = 0;
  bounceBack: boolean = true;
  thresholdTop: number = 0;
  thresholdBottom: number = 0;
  isSlideTap: boolean = false;
  isDrawerClose: boolean = false;

  constructor(
    public element: ElementRef,
    public renderer: Renderer,
    public domCtrl: DomController,
    public platform: Platform,
  ) {
  }

  // get drawerHeight(): any {
  //   // transform value for display
  //   return this.drawerHeight;
  // }
  @Input()
  set drawerValues(drawerValues: any) {
    // console.log('got name: ', drawerValues);
    this.handleHeight = drawerValues.drawerHeightValue;
    this.isSlideTap = drawerValues.isSlideTap || false;
    this.isDrawerClose = drawerValues.isDrawerClose || false;
    if (this.isSlideTap) {
      this.setToTop();
      this.isSlideTap = false;
    } else if (this.isDrawerClose) {
      this.isDrawerClose = false;
      // this.renderSlider();
      this.setToBottom();
    } else {
      // this.renderSlider();
    }
    // this.renderSlider();
  }

  contentScroll(event) {
    if (event.target.scrollTop <= 0) {
      this.isScrollEnd.emit(true);
    }
    // console.log(this.content.scrollTop);
  }

  // ngAfterViewInit() {
  // renderSlider() {
  //   console.log('Enter renderSlider');
  //   // if (this.options.handleHeight) {
  //   //   this.handleHeight = this.options.handleHeight;
  //   // }

  //   // if (this.options.bounceBack) {
  //   //   this.bounceBack = this.options.bounceBack;
  //   // }

  //   // if (this.options.thresholdFromBottom) {
  //   //   this.thresholdBottom = this.options.thresholdFromBottom;
  //   // }

  //   // if (this.options.thresholdFromTop) {
  //   //   this.thresholdTop = this.options.thresholdFromTop;
  //   // }

  //   this.renderer.setElementStyle(this.element.nativeElement, 'top', this.platform.height() - this.handleHeight + 'px');
  //   // this.renderer.setElementStyle(this.element.nativeElement, 'padding-top', this.handleHeight + 'px');

  //   // const hammer = new window['Hammer'](this.element.nativeElement);
  //   // hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_VERTICAL });

  //   // hammer.on('pan', (ev) => {
  //   //   console.log('pan');
  //   //   // console.log(ev);
  //   //   this.handlePan(ev);
  //   // });
  //   // hammer.on('tap', (ev) => {
  //   //   console.log('tap');
  //   //   // console.log(ev);
  //   //   this.handlePan(ev);
  //   // });
  // }
  // handlePan(ev) {
  //   const platformHeight = this.platform.height();
  //   console.log(ev.additionalEvent);
  //   if (ev.additionalEvent === 'panup') {
  //     this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'all 0.3s ease 0s');
  //     this.renderer.setElementStyle(this.element.nativeElement, 'top', '90px');
  //     const hammer = new window['Hammer'](this.element.nativeElement);
  //     hammer.get('pan').set({ direction: null });
  //   }
  //   if (ev.additionalEvent === 'pandown') {
  //     console.log('pandown 11');
  //     // console.log(ev.center.y);
  //     // this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'all 0.3s ease 0s');
  //     // this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight / 3 + 'px');
  //     // const hammer = new window['Hammer'](this.element.nativeElement);
  //     // hammer.get('pan').set({ direction: null });
  //   }
  //   // this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'top 0.3s');
  //   // this.renderer.setElementStyle(this.element.nativeElement, 'top', '90px');
  // }

  // handlePan1(ev) {
  //   // console.log(ev);
  //   const newTop = ev.center.y;
  //   const platformHeight = this.platform.height();

  //   console.log(newTop);
  //   // console.log(platformHeight);
  //   // console.log(this.thresholdTop);
  //   let bounceToBottom = false;
  //   let bounceToTop = false;

  //   if (this.bounceBack && ev.isFinal) {
  //     //  console.log('11');
  //     const topDiff = newTop - this.thresholdTop;
  //     const bottomDiff = (platformHeight - this.thresholdBottom) - newTop;
  //     topDiff >= bottomDiff ? bounceToBottom = true : bounceToTop = true;
  //   }
  //   //  console.log(ev.additionalEvent);
  //   console.log(bounceToTop);
  //   console.log(bounceToBottom);
  //   if (bounceToTop) {
  //     return true;
  //   }
  //   if ((newTop < this.thresholdTop && ev.additionalEvent === 'panup') || bounceToTop) {
  //     console.log('11');
  //     this.domCtrl.write(() => {
  //       this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'top 0.3s');
  //       // this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight / 3 + 'px');
  //       this.renderer.setElementStyle(this.element.nativeElement, 'top', '0');
  //       // this.setToTop();
  //     });
  //   } else if (((platformHeight - newTop) < this.thresholdBottom && ev.additionalEvent === 'pandown') || bounceToBottom) {
  //     console.log('22');
  //     this.domCtrl.write(() => {
  //       this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'top 0.3s');
  //       // this.renderer.setElementStyle(this.element.nativeElement, 'bottom', '20px');
  //       const openingSlider = this.element.nativeElement.querySelector('.car-card-content.slider-full-width');
  //       // const swiperSlide = this.element.nativeElement.querySelector('.swiper-slide.swiper-slide-active');
  //       // console.log(swiperSlide);
  //       this.renderer.setElementStyle(openingSlider, 'transition', 'width 0.3s');
  //       this.renderer.setElementStyle(openingSlider, 'width', '98%');
  //       this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight - this.handleHeight + 'px');
  //       this.renderer.setElementStyle(this.element.nativeElement, 'visibility', 'hidden');
  //       this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight + 'px');
  //       // this.setToBottom();
  //     });
  //   } else {
  //     console.log('333');
  //     this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'none');
  //     if (newTop > 0 && newTop < (platformHeight - this.handleHeight)) {
  //       console.log('333 11');
  //       if (ev.additionalEvent === 'panup' || ev.additionalEvent === 'pandown') {
  //         console.log('333 22');
  //         this.domCtrl.write(() => {
  //           console.log('tttttttt');
  //           // this.renderer.setElementStyle(this.element.nativeElement, 'top', '0');
  //           // this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop - 18 + 'px');
  //           this.renderer.setElementStyle(this.element.nativeElement, 'top', newTop + 'px');
  //         });
  //       }
  //     }
  //   }
  // }

  setToTop() {
    // console.log('setToTop');
    const platformHeight = this.platform.height();

    const openingSlider = this.element.nativeElement.querySelector('.car-card-content.slider-full-width');
    this.renderer.setElementStyle(openingSlider, 'transition', 'width 0.3s');
    this.renderer.setElementStyle(openingSlider, 'width', '100%');

    // this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight - this.handleHeight + 'px');
    this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'top 0.3s');
    this.renderer.setElementStyle(this.element.nativeElement, 'top', '90px');
    // this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight / 3 + 'px');
  }

  setToBottom() {
    console.log('setToBottom');
    const platformHeight = this.platform.height();
    const carDetailsSpace = this.element.nativeElement.querySelector('app-car-details-drawer-comp .car-details-space');
    const closeTopPos = platformHeight - this.handleHeight - carDetailsSpace.offsetHeight;
    this.renderer.setElementStyle(this.element.nativeElement, 'transition', 'top 0.3s');
    // this.renderer.setElementStyle(this.element.nativeElement, 'bottom', '20px');
    const openingSlider = this.element.nativeElement.querySelector('.car-card-content.slider-full-width');
    // const swiperSlide = this.element.nativeElement.querySelector('.swiper-slide.swiper-slide-active');
    // console.log(swiperSlide);
    this.renderer.setElementStyle(openingSlider, 'transition', 'width 0.3s');
    this.renderer.setElementStyle(openingSlider, 'width', '98%');
    // this.renderer.setElementStyle(this.element.nativeElement, 'top', platformHeight - this.handleHeight + 59 + 'px');
    this.renderer.setElementStyle(this.element.nativeElement, 'top', closeTopPos + 'px');
    this.renderer.setElementStyle(this.element.nativeElement, 'visibility', 'hidden');
    this.renderer.invokeElementMethod(this.element.nativeElement, 'addEventListener', ['transitionend', (e) => {
      // this.renderer.setElementStyle(this.element.nativeElement, 'visibility', 'hidden');
    }, { once: true }]);
  }
}
