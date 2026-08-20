import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Grid, GridRow, GridCell, GridCellWidget} from '@angular/aria/grid';
import { CommonModule } from '@angular/common';


import {MatCardModule} from '@angular/material/card';

function shuffle(array : DataEntry[]) : DataEntry[] {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

export interface MatchEntry
{
  index : number;
  name : string;
  description : string;
  color : string; // todo: is this right?
}
export interface DataEntry
{
  title : string;
  description : string;
  tags :string[];
  image: string;
  matchGroupIndex : number;
  selected : boolean;
  matched : number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Grid, GridRow, GridCell, GridCellWidget, MatCardModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('affiliations');


  // affiliationEntries = [
  // ];

  // selectedEntries : DataEntry[] = [];

  dataEntries : DataEntry[] = [
    {title:"titlea1", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:-1},
    {title:"titleb1", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:-1},
    {title:"titlec1", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:-1},
    {title:"titled1", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:-1},
    {title:"titlea2", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:-1},
    {title:"titleb2", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:-1},
    {title:"titlec2", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:-1},
    {title:"titled2", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:-1},
    {title:"titlea3", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:-1},
    {title:"titleb3", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:-1},
    {title:"titlec3", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:-1},
    {title:"titled3", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:-1},
    {title:"titlea4", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:-1},
    {title:"titleb4", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:-1},
    {title:"titlec4", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:-1},
    {title:"titled4", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:-1},
  ];
  has4ButtonsSelected:boolean = false;
  mistakesRemaining:number = 4;

  shuffleEntries()
  {
    console.log("shuffling");
    this.dataEntries = shuffle(this.dataEntries);
  }

  ngOnInit()
  {
    this.shuffleEntries();
  }


  countSelected():number
  {
    let count : number = 0;

    this.dataEntries.forEach((data:DataEntry)=> {
      if(data.selected){count++;}
    });
    return count;
  }

  trySelect(index:number) : void
  {
    let numselected:number = this.countSelected();

    let isAlreadySelected : boolean = this.dataEntries[index].selected;

    if(isAlreadySelected)
    {
      this.dataEntries[index].selected = false;
      numselected--;
      this.has4ButtonsSelected = false;
    }
    else if (numselected < 4)
    {
      this.dataEntries[index].selected = true;
      numselected++;
      if(numselected == 4)
      {
        this.has4ButtonsSelected = true;
      }
    }
  }

  deselectAll():void
  {

    this.dataEntries.forEach((data:DataEntry)=> {
      data.selected = false;
    });
    this.has4ButtonsSelected = false;
  }

  trySubmit()
  {

  }

  getx44ButtonClass(index:number):string
  {
    if(this.dataEntries[index].selected)
    {
      return "selectedx44Button";
    }
    else
    {
      return "inactivex44Button";
    }
  }

}


