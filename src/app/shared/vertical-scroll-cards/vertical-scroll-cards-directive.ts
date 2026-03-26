import { Directive, ElementRef } from "@angular/core";

/*
  Marker directive used to identify elements
  that should behave as scrollable snap items.

  The parent VerticalSnapScrollComponent
  retrieves all elements decorated with this directive
  using @ContentChildren.

  This allows full flexibility in projected content
  without enforcing a fixed DOM structure.
*/

@Directive({
  selector: "[verticalScrollCard]",
  standalone: true
})
export class VerticalScrollCardsDirective {
  /*
    Reference to the actual DOM element.

    Required to:
    - measure offsetTop
    - measure offsetHeight
    - compute scroll snapping
    - update indicator position
  */
  constructor(public elementRef: ElementRef<HTMLElement>) { }
}
