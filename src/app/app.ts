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
}

async function LoadTodaysEntry()
{
    let resp = await fetch("/fetchtodaysids",
        {
            method:"GET",
            headers:[
                ["Accept", "application/json"],
                ["Access-Control-Allow-Origin", "https://affiliations.noah.exposed"]
            ]
        }
    )
    let data: DatabaseRow[] = await resp.json<DatabaseRow[]>();

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
        }
    });
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

    // layer of indirection makes the animation hopefully easy
    dataIndices : number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
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

            let tempA = this.dataIndices[currentIndex];
            let tempB = this.dataIndices[randomIndex];

            this.dataIndices[currentIndex] = tempB;
            this.dataIndices[randomIndex] = tempA;
        }
    }

    shuffleEntries()
    {
        this.recordPositions()
        this.shuffle();
        this.tentativeAnimationThing();

    }

    dateString:string = "";
    async ngOnInit()
    {
        this.overlayModalData = undefined;
        this.dateString = new Date().toISOString().split("T")[0]
        LoadTodaysEntry().then((data)=> {
            this.dataEntries = data;
            this.ready = true;
            this.shuffle();
            this.ref.detectChanges();

            this.recordInitialPositions(); });
    }

    ngAfterViewInit()
    {
    }

    recordInitialPositions()
    {
        for(let elementIndex = 0; elementIndex < this.dataEntries.length; elementIndex++)
            {
            let boxI:HTMLElement|null = document.getElementById("square"+elementIndex);
            if(boxI != null)
                {
                let d : DOMRect = boxI.getBoundingClientRect();
                this.dataEntries[this.dataIndices[elementIndex]].oldX = d.left;
                this.dataEntries[this.dataIndices[elementIndex]].oldY = d.top;
            }
            else
                {
                console.error("square"+elementIndex, "is null")
            }
        }
    }

    recordPositions()
    {
        for(let elementIndex = 0; elementIndex < this.dataEntries.length; elementIndex++)
        {
            let boxI:HTMLElement|null = document.getElementById("square"+elementIndex);
            if(boxI != null)
                {
                let d : DOMRect = boxI.getBoundingClientRect();
                this.dataEntries[this.dataIndices[elementIndex]].oldX = d.left;
                this.dataEntries[this.dataIndices[elementIndex]].oldY = d.top;
            }
            else
                {
                console.error("square"+elementIndex, "is null")
            }
        };
    }

    tentativeAnimationThing()
    {
        requestAnimationFrame(() => {
            for(let elementIndex = 0; elementIndex < 16; elementIndex++)
            {
                let boxI:HTMLElement|null = document.getElementById("square"+elementIndex);
                if(boxI != null)
                {
                    let dataIndex = this.dataIndices[elementIndex];

                    let d = boxI.getBoundingClientRect();

                    let deltaX = this.dataEntries[dataIndex].oldX - d.left;
                    let deltaY = this.dataEntries[dataIndex].oldY - d.top;

                    boxI.style.transition = "none";
                    boxI.style.transform =
                        `translate(${deltaX}px, ${deltaY}px)`;

                    requestAnimationFrame(()=> {
                        let boxJ:HTMLElement|null = document.getElementById("square"+elementIndex);
                        if(boxJ != null)
                        {
                            boxJ.style.transition = "transform 300ms ease";
                            boxJ.style.transform = "";
                        }
                        else
                        {
                            console.error("square"+elementIndex, "is null")
                        }
                    });

                }
                else
                {
                    console.error("square"+elementIndex, "is null")
                }
            };
        });
    }

    ngOnChanges()
    {
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
        for(let elementIndex = 0; elementIndex < this.dataEntries.length; elementIndex++)
        {
            if(this.dataEntries[this.dataIndices[elementIndex]].selected)
            {
                let boxI:HTMLElement|null = document.getElementById("square"+elementIndex);
                if(boxI != null)
                {
                    // this done here instead of a timeout after setting the class is because SetTimeout doesn't seem to work on mobile? idk
                    boxI.className = boxI.className.replace(" wigglyButtonCauseYoureDum","");
                }
                else
                    {
                    console.error("square"+elementIndex, "is null")
                }
            }
        }

        let numselected:number = this.countSelected();

        if(this.dataEntries[this.dataIndices[index]].matched)
        {
            return;
        }

        let isAlreadySelected : boolean = this.dataEntries[this.dataIndices[index]].selected;

        if(isAlreadySelected)
        {
            this.dataEntries[this.dataIndices[index]].selected = false;
            numselected--;
            this.has4ButtonsSelected = false;
        }
        else if (numselected < 4)
        {
            this.dataEntries[this.dataIndices[index]].selected = true;
            numselected++;
            if(numselected == 4)
                {
                this.has4ButtonsSelected = true;
            }
        }
    }

    deselectAll():void
    {

        this.dataEntries.forEach((data:DataEntry) => {
            data.selected = false;
        });
        this.has4ButtonsSelected = false;
    }



    sortUpMatched()
    {
        this.dataIndices.sort((dataIndexA:number, dataIndexB:number) => {
            let dataA = this.dataEntries[dataIndexA];
            let dataB = this.dataEntries[dataIndexB];
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
    }

    setUpYouLost()
    {
        this.won = false;
        this.dataEntries.forEach((d)=>
        {
            d.selected = false;
            d.currentlyPressed = false;
            d.matched = true;
        })

        this.recordPositions()


        this.sortUpMatched();

        this.ref.detectChanges();
        // this.ref.detectChanges();

        this.tentativeAnimationThing();
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
        if(this.mistakesRemaining == 0)
        {
            this.setUpYouLost()
            return;
        }

        if(currMatchPick == -1)
        {
            this.justTriedBadMatch = true;
            for(let i = 0; i < this.dataEntries.length; i++)
                {
                if(this.dataEntries[this.dataIndices[i]].selected)
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


        this.sortUpMatched();

        this.ref.detectChanges();
        // this.ref.detectChanges();

        this.tentativeAnimationThing();

        // must increment after swaps
        this.numMatchesMade +=1;

        if(this.numMatchesMade == 4)
        {
            this.won = true;
        }
    }

    getx44ButtonClass(elementIndex:number):string
    {
        let retVal = ""

        if(this.dataEntries[this.dataIndices[elementIndex]].matched)
        {
            retVal += "matchedx44ButtonGroup" + this.dataEntries[this.dataIndices[elementIndex]].matchGroupIndex;
        }
        else
        {
            if(this.dataEntries[this.dataIndices[elementIndex]].selected)
            {
                retVal += "selectedx44Button";
            }
            else
            {
                retVal += "inactivex44Button";
            }
            if(this.dataEntries[this.dataIndices[elementIndex]].currentlyPressed)
            {
                retVal += " pressedx44Button";
            }
        }

        return retVal;
    }

    timeoutId:number = -1;

    pointerDown(elementIndex:number)
    {
        this.startModalCountdown(elementIndex);
        this.dataEntries[this.dataIndices[elementIndex]].currentlyPressed = true;
    }

    pointerUp(elementIndex:number)
    {
        this.stopModalCountdown();
        this.dataEntries[this.dataIndices[elementIndex]].currentlyPressed = false;
    }

    startModalCountdown(elementIndex:number)
    {
        this.stopModalCountdown();
        let milisecondsToWaitForModal:number = 500;
        this.timeoutId = setTimeout(()=>{
                this.overlayModalData = this.dataEntries[this.dataIndices[elementIndex]];
                this.ref.detectChanges()},
            milisecondsToWaitForModal);
    }
    stopModalCountdown()
    {
        if(this.timeoutId === -1)
        {
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


