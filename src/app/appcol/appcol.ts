import { Component } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';




export interface DataEntry
{
  title : string;
  description : string;
  tags :string[];
  image: string;

}


@Component({
  selector: 'appcol',
  imports: [MatCardModule, MatGridListModule,
      Grid, GridRow, GridCell, GridCellWidget
  ],
  templateUrl: './appcol.html',
  styleUrl: './appcol.css',
})

export class Appcol {

  dataEntries : DataEntry[] = [
    {title:"titlea1", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titleb1", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlec1", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titled1", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlea2", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titleb2", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlec2", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titled2", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlea3", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titleb3", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlec3", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titled3", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlea4", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titleb4", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titlec4", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
    {title:"titled4", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com"},
  ]
}
