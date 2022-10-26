import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<Event>();

  imgURL: string | undefined;

  public onDropSuccess(event: DragEvent) {
    event.preventDefault();

    this.fileSelected.emit(event);
  }

  public onFileSelected(event: Event) {
console.log(event);

    this.fileSelected.emit(event);
  }

}
