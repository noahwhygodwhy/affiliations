import { Component, signal, OnInit, AfterViewInit, afterNextRender, OnChanges, DoCheck, ChangeDetectorRef} from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Temporal } from '@js-temporal/polyfill';
import { DatabaseRow } from '../nhSchema';

export interface MatchEntry
{
    index : number;
    name : string;
    description : string;
    color : string; // todo: is this right?
}ChangeDetectorRef
export interface DataEntry
{
    title : string;
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

async function LoadTodaysEntry()
{
    console.log("top of LoadTodaysEntry");
    let resp = await fetch(
        "https://affiliations.noah.exposed/fetchtodaysids",
        {
            method:"GET",
            headers:[
                ["Accept", "application/json"],
                ["Access-Control-Allow-Origin", "https://affiliations.noah.exposed"]
            ]
        }
    )
    console.log(resp);
    console.log("did fetch");
    let data: DatabaseRow[] = await resp.json<DatabaseRow[]>();
    console.log("awaited on json");
    console.log(data);

    let fetchedDataEntries: DataEntry[] = data.map((d:DatabaseRow):DataEntry => {
        return {
            title: d.title,
            tags: JSON.parse(d.tagIdList),
            image:"https://affiliations.noah.exposed/proxyCDN/" + d.thumnailUrlSuffix,
            matchGroupIndex:d.matchIndex,
            selected:false,
            matched:false,
            oldX:0,
            oldY:0
        }
    });
    console.log("prepared data entries");
    console.log(fetchedDataEntries);
    return fetchedDataEntries;
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

    dataEntries : DataEntry[] = []

    has4ButtonsSelected:boolean = false;
    mistakesRemaining:number = 4;
    numMatchesMade:number = 0;
    ready = false;
    won = false;
    justTriedBadMatch = false;
    constructor(private ref: ChangeDetectorRef)
    {
    }

    shuffleEntries()
    {
        // console.log("shuffling");
        this.dataEntries = shuffle(this.dataEntries, this.numMatchesMade*4);
        this.tentativeAnimationThing();

    }

    dateString:string = "";
    async ngOnInit()
    {
        console.log("ngoninit");
        this.dateString = Temporal.Now.plainDateISO().toString();
        console.log("doing the load");
        LoadTodaysEntry().then((data)=> {this.dataEntries = data; this.ready = true; console.log("ready:", this.ready); this.ref.markForCheck()});
        console.log("ready:", this.ready);
    }

    ngAfterViewInit()
    {
        if(this.ready)
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
        this.justTriedBadMatch = false;
        for(let i = 0; i < this.dataEntries.length; i++)
            {
            if(this.dataEntries[i].selected)
                {
                let boxI:HTMLElement|null = document.getElementById("square"+i);
                if(boxI != null)
                    {
                    // this done here instead of a timeout after setting the class is because SetTimeout doesn't seem to work on mobile? idk
                    boxI.className = boxI.className.replace(" wigglyButtonCauseYoureDum","");
                }
                else
                    {
                    console.error("square"+i, "is null")
                }
            }
        }

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
        // settimeout();
        // setTimeout()/
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
            this.justTriedBadMatch = true;
            for(let i = 0; i < this.dataEntries.length; i++)
                {
                if(this.dataEntries[i].selected)
                    {
                    let boxI:HTMLElement|null = document.getElementById("square"+i);
                    if(boxI != null)
                        {
                        // does this work
                        boxI.className = boxI.className.replace(" wigglyButtonCauseYoureDum","");
                        boxI.className = boxI.className + " wigglyButtonCauseYoureDum";
                    }
                    else
                        {
                        console.error("square"+i, "is null")
                    }
                }
            }



            // after determiend loss, if mistakes left is 0, set them all to match, where does mistakesLeft-- happen
            // then in setup, access the sdata base for dataEntries instead














            // setTimeout(()=>{
            //   for(let i = 0; i < this.dataEntries.length; i++)
            //   {
            //     if(this.dataEntries[i].selected)
            //     {
            //       let boxI:HTMLElement|null = document.getElementById("square"+i);
            //       if(boxI != null)
            //       {
            //         boxI.className = boxI.className.replace(" wigglyButtonCauseYoureDum","");
            //       }
            //       else
                //       {
            //         console.error("square"+i, "is null")
            //       }
            //     }
            //   }
            // }, 300);
            // console.log("Bad Match");
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

        // if()

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


