import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appDone]'
})
export class DoneDirective {
  @Input('appDone') set done(v: boolean) {
    const el = this.el.nativeElement;
    v ? el.classList.add('', '') : el.classList.remove('', '');
  }
  constructor(private el: ElementRef) { }

}
