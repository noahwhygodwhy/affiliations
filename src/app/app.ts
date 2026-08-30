import { Component, signal, OnInit, AfterViewInit, Output, ChangeDetectorRef, afterNextRender} from '@angular/core';
import { Data, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DatabaseRow } from '../nhSchema';

import { Thumbnailmodal } from './thumbnailmodal/thumbnailmodal';


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
    sixDigits: string;
    tags :string[];
    image: string;
    matchGroupIndex : number;
    selected : boolean;
    matched : boolean;
    oldX : number;
    oldY : number;
    currentlyPressed:boolean;
    oldIDForAnimation : number;
}

async function LoadTodaysEntry()
{
    console.log("top of LoadTodaysEntry");
    let resp = await fetch("/fetchtodaysids",
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

    let fetchedDataEntries: DataEntry[] = data.map((d:DatabaseRow, index:number):DataEntry => {
        return {
            title: d.title,
            sixDigits:d.sixDigits,
            tags: JSON.parse(d.tagIdList),
            image:"https://affiliations.noah.exposed/proxyCDN/" + d.thumnailUrlSuffix,
            matchGroupIndex:d.matchIndex,
            selected:false,
            matched:false,
            oldX:0,
            oldY:0,
            currentlyPressed:false,
            oldIDForAnimation:index
        }
    });
    console.log("prepared data entries");
    console.log(fetchedDataEntries);
    return fetchedDataEntries;
}


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, Thumbnailmodal],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit{
    protected readonly title = signal('affiliations');


    @Output() overlayModalData:DataEntry|undefined = undefined;

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


    shuffle()
    {
        let minimumIndexToTouch = this.numMatchesMade*4;
        let currentIndex = this.dataEntries.length;

        while (currentIndex != minimumIndexToTouch)
            {
            let lengthOfRange = currentIndex - minimumIndexToTouch;

            let randomIndex = Math.floor(Math.random() * lengthOfRange) + minimumIndexToTouch;
            currentIndex--;

            let tempA = this.dataEntries[currentIndex];
            let tempB = this.dataEntries[randomIndex];

            this.dataEntries[currentIndex] = {...tempB};
            this.dataEntries[randomIndex] = {...tempA};
        }
    }

    shuffleEntries()
    {
        console.log("shuffling");
        this.shuffle();
        this.recordPositions()
        this.tentativeAnimationThing();

    }

    dateString:string = "";
    async ngOnInit()
    {
        this.overlayModalData = undefined;
        console.log("user agent?:", navigator.userAgent);
        console.log("ngoninit");
        this.dateString = new Date().toISOString().split("T")[0]
        console.log("doing the load");
        LoadTodaysEntry().then((data)=> {
            this.dataEntries = data;
            this.ready = true;
            console.log("ready:", this.ready);
            this.shuffle();
            // this.tentativeAnimationThing();
            // this.ref.markForCheck();
            this.ref.detectChanges();

            this.recordInitialPositions(); });

        console.log("ready:", this.ready);
    }

    ngAfterViewInit()
    {
        console.log("ngafterviewinit")
    }

    recordInitialPositions()
    {
        console.log("record initial positions");
        for(let i = 0; i < this.dataEntries.length; i++)
            {
            let boxI:HTMLElement|null = document.getElementById("square"+i);
            if(boxI != null)
                {
                let d : DOMRect = boxI.getBoundingClientRect();
                this.dataEntries[i].oldX = d.left;
                this.dataEntries[i].oldY = d.top;
            }
            else
                {
                console.error("square"+i, "is null")
            }
        };
    }

    recordPositions()
    {
        console.log("record positions");
        for(let i = 0; i < this.dataEntries.length; i++)
        {
            this.dataEntries[i].oldIDForAnimation=i;
            let boxI:HTMLElement|null = document.getElementById("square"+i);
            if(boxI != null)
                {
                let d : DOMRect = boxI.getBoundingClientRect();

                let deltaX = this.dataEntries[i].oldX -  d.left;
                let deltaY =  this.dataEntries[i].oldY - d.top;

                boxI.style.transition = 'none';
                boxI.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";

                this.ref.detectChanges();
                // void boxI.offsetWidth;

                this.dataEntries[i].oldX = d.left;
                this.dataEntries[i].oldY = d.top;
            }
            else
                {
                console.error("square"+i, "is null")
            }
        };
    }

    tentativeAnimationThing()
    {
        console.log("tentativeAnimationThing");
        requestAnimationFrame(() => {
            for(let i = 0; i < 16; i++)
            {
                let oldId = this.dataEntries[i].oldIDForAnimation;
                let boxI:HTMLElement|null = document.getElementById("square"+oldId);
                if(boxI != null)
                    {
                    boxI.style.transition = 'transform 300ms ease';
                    boxI.style.transform = '';
                }
                else
                    {
                    console.error("square"+oldId, "is null")
                }
                this.dataEntries[i].oldIDForAnimation = i;
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
            return;
        }
        // if we get here, then we know we have a mtach, and the match index is currMatchPick

        this.dataEntries.forEach((data:DataEntry, index:number) => {
            if(data.matchGroupIndex == currMatchPick)
                {
                data.matched = true;
                data.selected = false;
            }
        });

        this.has4ButtonsSelected = false;

        this.recordPositions()

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

        this.ref.detectChanges();
        // this.ref.detectChanges();

        this.tentativeAnimationThing();

        // must increment after swaps
        this.numMatchesMade +=1;

        if(this.numMatchesMade == 4)
            {
            // todo; handle win?
            this.won = true;
            console.log("win omg yoou did it wooooooooooo?");
        }
    }

    getx44ButtonClass(index:number):string
    {
        let retVal = ""

        if(this.dataEntries[index].matched)
            {
            retVal += "matchedx44ButtonGroup" + this.dataEntries[index].matchGroupIndex;
        }
        else
        {
            if(this.dataEntries[index].selected)
            {
                retVal += "selectedx44Button";
            }
            else
            {
                retVal += "inactivex44Button";
            }
            if(this.dataEntries[index].currentlyPressed)
            {
                retVal += " pressedx44Button";
            }
        }

        return retVal;
    }

    timeoutId:number = -1;

    pointerDown(valueIndex:number)
    {
        this.startModalCountdown(valueIndex);
        this.dataEntries[valueIndex].currentlyPressed = true;
        console.log("setting currentlyPressed on button ", valueIndex, "to true");
    }

    pointerUp(valueIndex:number)
    {
        this.stopModalCountdown();
        console.log("setting currentlyPressed on button ", valueIndex, "to false");
        this.dataEntries[valueIndex].currentlyPressed = false;
    }

    startModalCountdown(valueIndex:number)
    {
        this.stopModalCountdown();
        let milisecondsToWaitForModal:number = 500;
        console.log("starting modal countdown")
        this.timeoutId = setTimeout(()=>{console.log("setting modal data"); this.overlayModalData = this.dataEntries[valueIndex]; this.ref.detectChanges()}, milisecondsToWaitForModal);
    }
    stopModalCountdown()
    {
        console.log("ending modal countdown")
        if(this.timeoutId === -1)
        {

            console.log("except it's -1")
            return;
        }
        clearTimeout(this.timeoutId);
        this.timeoutId = -1;

    }

    clearOutModalData(eventstuff:any)
    {
        this.dataEntries.forEach((x)=>{x.currentlyPressed = false});
        this.overlayModalData = undefined;
    }
}


