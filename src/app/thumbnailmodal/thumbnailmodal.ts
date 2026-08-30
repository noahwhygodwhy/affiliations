import { Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import { DataEntry } from '../app';

@Component({
  selector: 'app-thumbnailmodal',
  imports: [],
  templateUrl: './thumbnailmodal.html',
  styleUrl: './thumbnailmodal.css',
})
export class Thumbnailmodal {

  @Input() dataPoint:DataEntry|undefined = undefined;
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter();

  ngOnInit()
  {
    console.log("datapoint: OWEEE", this.dataPoint);
  }


  emitCloseSignal()
  {
    console.log('button clicked');
    this.onCloseModal.emit()
  }

  getTitle()
  {
    if(this.dataPoint == undefined)
    {
      return "Title Failed To Load"
    }
    else
    {
      return this.dataPoint.title;
    }
  }

}
