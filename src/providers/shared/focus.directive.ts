import { Directive, Renderer, ElementRef } from '@angular/core';
@Directive({
  selector: '[focusinput]'
})
export class focusinput {
  constructor(public renderer: Renderer, public elementRef: ElementRef) { }

  ngOnInit() {
  //  const searchInput = this.elementRef.nativeElement.querySelector('input');
    setTimeout(() => {
    //  this.renderer.invokeElementMethod(searchInput, 'focus', []);
    },         0);
  }
}
