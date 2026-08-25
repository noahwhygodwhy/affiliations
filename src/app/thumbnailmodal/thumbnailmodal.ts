import { Component, Input } from '@angular/core';

import { DataEntry } from '../app';

@Component({
  selector: 'app-thumbnailmodal',
  imports: [],
  templateUrl: './thumbnailmodal.html',
  styleUrl: './thumbnailmodal.css',
})
export class Thumbnailmodal {

  @Input() dataPoint:DataEntry|undefined = undefined;

}
