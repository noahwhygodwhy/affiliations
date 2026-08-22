import { Component, signal, OnInit, AfterViewInit, afterNextRender, OnChanges, DoCheck} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Temporal } from '@js-temporal/polyfill';

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
  matched : boolean;
  oldX : number;
  oldY : number;
}

function shuffle(array : DataEntry[], minimumIndexToTouch:number) : DataEntry[]
{
  let currentIndex = array.length;

  while (currentIndex != minimumIndexToTouch)
  {
    let lengthOfRange = currentIndex - minimumIndexToTouch;

    let randomIndex = Math.floor(Math.random() * lengthOfRange) + minimumIndexToTouch;
    currentIndex--;

    let tempA = array[currentIndex];
    let tempB = array[randomIndex];


    // make it realize there's a change?
    array[currentIndex] = {...tempB};
    array[randomIndex] = {...tempA};
  }
  return array;
}


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit{
  protected readonly title = signal('affiliations');


  // affiliationEntries = [
  // ];

  // selectedEntries : DataEntry[] = [];

  dataEntries : DataEntry[] = [
    {title:"titlea1", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titleb1", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlec1", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titled1", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 1, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlea2", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titleb2", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlec2", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titled2", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 2, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlea3", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titleb3", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlec3", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titled3", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 3, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlea4", description: "description a1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titleb4", description: "description b1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titlec4", description: "description c1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:false, oldX:0, oldY:0},
    {title:"titled4", description: "description d1", tags: ["a", "b", "c", "d"], image: "www.ahhhh.com", matchGroupIndex: 4, selected:false, matched:false, oldX:0, oldY:0},
  ];

  has4ButtonsSelected:boolean = false;
  mistakesRemaining:number = 4;
  numMatchesMade:number = 0;
  won = false;
  constructor()
  {
  }

  shuffleEntries()
  {
    // console.log("shuffling");
    this.dataEntries = shuffle(this.dataEntries, this.numMatchesMade*4);
    this.tentativeAnimationThing();

  }

  dateString:string = "";
  ngOnInit()
  {
    this.dateString = Temporal.Now.plainDateISO().toString();
    // speicifically not calling shuffleEntries as that has animation tthing
    this.dataEntries = shuffle(this.dataEntries, this.numMatchesMade*4);
  }


  ngAfterViewInit()
  {
    console.log("ngAfterViewInit");
    for(let i = 0; i < 16; i++)
    {
      let boxI:Element|null = document.getElementById("square"+i);
      if(boxI != null)
      {
        let d : DOMRect = boxI.getBoundingClientRect();
        this.dataEntries[i].oldX = d.left;
        this.dataEntries[i].oldY = d.top;
        // console.log(i, d.top, d.left);
      }
      else
      {
       console.error("square"+i, "is null")
      }
    }
  }

  tentativeAnimationThing()
  {
    for(let i = 0; i < 16; i++)
    {
      let boxI:HTMLElement|null = document.getElementById("square"+i);
      if(boxI != null)
      {
        let d : DOMRect = boxI.getBoundingClientRect();

        let deltaX = this.dataEntries[i].oldX -  d.left;
        let deltaY =  this.dataEntries[i].oldY - d.top;

        boxI.style.transition = 'none';
        boxI.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
        this.dataEntries[i].oldX = d.left;
        this.dataEntries[i].oldY = d.top;

        // console.log(i, d.top, d.left);
      }
      else
      {
       console.error("square"+i, "is null")
      }
    };

    requestAnimationFrame(() => {
    for(let i = 0; i < 16; i++)
    {
        let boxI:HTMLElement|null = document.getElementById("square"+i);
        if(boxI != null)
        {
          boxI.style.transition = 'transform 300ms ease';
          boxI.style.transform = '';
        }
        else
        {
          console.error("square"+i, "is null")
        }
      };
    });

  }



  ngOnChanges()
  {
    console.log("ngOnChanges");
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

    if(this.dataEntries[index].matched)
    {
      return;
    }

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
    // this.tentativeAnimationThing();
  }

  deselectAll():void
  {

    this.dataEntries.forEach((data:DataEntry)=> {
      data.selected = false;
    });
    this.has4ButtonsSelected = false;
  }

  trySubmit() : void
  {
    let currMatchPick:number = -1;


    for(let i = 0; i < this.dataEntries.length; i++)
    {
      if(this.dataEntries[i].selected)
      {
        if(currMatchPick==-1)
        {
          currMatchPick = this.dataEntries[i].matchGroupIndex;
        }
        else
        {
          if(this.dataEntries[i].matchGroupIndex != currMatchPick) // TODO: refactor to allow for a "close guess" hint?
          {
            currMatchPick=-1;
            this.mistakesRemaining--;
            break;
          }
        }
      }
    }

    if(currMatchPick == -1)
    {
      for(let i = 0; i < this.dataEntries.length; i++)
      {
        if(this.dataEntries[i].selected)
        {
          let boxI:HTMLElement|null = document.getElementById("square"+i);
          if(boxI != null)
          {
            boxI.className = boxI.className + " wigglyButtonCauseYoureDum";
          }
          else
          {
            console.error("square"+i, "is null")
          }
        }
      }
      setTimeout(()=>{
        for(let i = 0; i < this.dataEntries.length; i++)
        {
          if(this.dataEntries[i].selected)
          {
            let boxI:HTMLElement|null = document.getElementById("square"+i);
            if(boxI != null)
            {
              boxI.className = boxI.className.replace(" wigglyButtonCauseYoureDum","");
            }
            else
            {
              console.error("square"+i, "is null")
            }
          }
        }
      }, 300)
      console.log("Bad Match")
      return;
    }
    // if we get here, then we know we have a mtach, and the match index is currMatchPick


    let indexesOfJustMatchedEntries : number[] = [];

    this.dataEntries.forEach((data:DataEntry, index:number) => {
      if(data.matchGroupIndex == currMatchPick)
      {
        // indexesOfJustMatchedEntries.push(index);
        data.matched = true;
        data.selected = false;
      }
    });

    this.has4ButtonsSelected = false;




    this.dataEntries.sort((dataA:DataEntry, dataB:DataEntry) => {
      // console.log("comparing", dataA, dataB);
      if(dataA.matched != dataB.matched)
      {
        return dataA.matched < dataB.matched ? 1 : -1;
      }
      if(dataA.matched && dataB.matched)
      {
        if(dataA.matchGroupIndex == dataB.matchGroupIndex)
        {
          return dataA.title < dataB.title ? 1 : -1;
        }
        else
        {
          return dataA.matchGroupIndex < dataB.matchGroupIndex ? 1 : -1;
        }
      }
      return 0;
    });


    // let indexOfFirstUnmatched = this.numMatchesMade * 4;
    // indexesOfJustMatchedEntries.forEach((indexOfJustMatched:number) =>
    // {

    // });




    // this.bubbleSortUpMatched()

    // must increment after swaps
    this.numMatchesMade +=1;

    if(this.numMatchesMade == 4)
    {
      // todo; handle win?
      this.won = true;
      console.log("win omg yoou did it wooooooooooo?");
    }

    this.tentativeAnimationThing();
  }

  getx44ButtonClass(index:number):string
  {

    if(this.dataEntries[index].matched)
    {
      return "matchedx44ButtonGroup" + this.dataEntries[index].matchGroupIndex;
    }
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


