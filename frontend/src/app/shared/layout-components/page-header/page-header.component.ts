import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnChanges {
  @Input() title!: string;
  @Input() items!: any[];
  @Input() active_item!: string;

  @Output() breadcrumbClick? = new EventEmitter<string>();

  public backButton = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.backButton = false;

    if (changes['title'] && changes['title'].currentValue === 'Back') {
      this.backButton = true;
    }
  }

  public breadcrumbClicked(item: string) {
    if (this.breadcrumbClick) {
      this.breadcrumbClick.emit(item);
    }
  }

}
