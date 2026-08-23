import { HttpClient } from "@angular/common/http";

import { SearchResult, TagResult, SingleSearchResult, SingleTagResult } from "./nhSchema"

import { Temporal } from '@js-temporal/polyfill';


function getRandomInt(max:number) :number {
  return Math.floor(Math.random() * max);
}

interface DatabaseRow
{
	indexInDay:number;
	dateUsed:string;
	sixDigis:string;
	matchIndex:number;
}

function InGoodStatusRange(statusIn:number):boolean
{
	return (statusIn >= 200) && (statusIn < 300)
}

function assert(assertion:boolean, msg:string)
{
	if(assertion != true)
	{
		console.error("Failed Assertion: ", msg);
	}
}

export default {

	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext) {
		const url = new URL(request.url);
		if (url.pathname === "/testschedule") {
		// Build a mock ScheduledController matching what the cron runtime provides
		const controller :ScheduledController= {
			cron: "59 23 LW * *",
			scheduledTime: Date.now(),
			noRetry: ()=>{return true;}
		};
		let statusString = await this.scheduled(controller, env, ctx);
		return new Response("Scheduled handler triggered successfully\n" +statusString, {
			status: 200,
			headers: { "Content-Type": "text/plain" },
		});
		}
		return new Response("Not found", { status: 404 });
	},

	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	) : Promise<string | void>{
		{ // section for the first tag request
			let tagResponse = await fetch(
				"https://nhentai.net/api/v2/tags/tag?sort=popular&page=1&per_page=25",
				{
					method:"GET",
					headers:[
						["User-Agent", "Afilliations/1.0.0 (+https://affiliations.noah.exposed) (noahwhygodwhy@pm.me)"],
						["Accept", "application/json"],
						["Authorization", "anon"],
					]
				}
			)
			let todaysDateString = Temporal.Now.plainDateISO().toString();

			if(InGoodStatusRange(tagResponse.status))
			{

				console.log("date string:", todaysDateString);
				let deleteString = "DELETE FROM daily_ids WHERE dateUsed = '"+ todaysDateString + "'";
				console.log("deleteString:", deleteString);
				// removes any existing entries for today, this is more just for testing,
				// on the scheduled cron job this should never remove anything (TODO: should i add a test for that?)
				let deletionPromise =  env.daily_ids.prepare(deleteString).run();

				let fourTagNames :string[] = [];
				{
					let data = await tagResponse.json() as TagResult;

					// ok so we have an arrya of tag results
					let numTagsReturned = data.result.length;
					let topNumTagsToPickFrom = Math.min(100, numTagsReturned);

					let fourTagIndices :number[] = []; // these are indices in the returned array, not the IDs
					for(let i = 0; i < 4; i++)
					{
						let newIndex:number;
						do
						{
							newIndex = getRandomInt(topNumTagsToPickFrom);
						} while(fourTagIndices.find((val:number) => {val = newIndex}) != undefined);
						fourTagIndices.push(newIndex);
						fourTagNames.push(data.result[newIndex].name);
					}
					console.log("fourTagNames:", fourTagNames);
				}

				// example https://nhentai.net/api/v2/search?query=tag:"big breasts" -tag:"sole male" -tag:"nakadashi" -tag:"stockings" &sort=date&page=1

				// let searchResultPromises: Promise<SearchResult>[] = [];

				// let readyToBeFormattedSearchString:string = 'https://nhentai.net/api/v2/search?query=tag:"${0}" -tag:"{1]}" -tag:"{2}" -tag:"{3}" &sort=popular-month&page=1';

				let searchStrings:string[] = [
					`https://nhentai.net/api/v2/search?query=tag:"${fourTagNames[0]}" -tag:"${fourTagNames[1]}" -tag:"${fourTagNames[2]}" -tag:"${fourTagNames[3]}" &sort=popular-month&page=1`,
					`https://nhentai.net/api/v2/search?query=tag:"${fourTagNames[1]}" -tag:"${fourTagNames[0]}" -tag:"${fourTagNames[2]}" -tag:"${fourTagNames[3]}" &sort=popular-month&page=1`,
					`https://nhentai.net/api/v2/search?query=tag:"${fourTagNames[2]}" -tag:"${fourTagNames[0]}" -tag:"${fourTagNames[1]}" -tag:"${fourTagNames[3]}" &sort=popular-month&page=1`,
					`https://nhentai.net/api/v2/search?query=tag:"${fourTagNames[3]}" -tag:"${fourTagNames[0]}" -tag:"${fourTagNames[1]}" -tag:"${fourTagNames[2]}" &sort=popular-month&page=1`
				];

				// let searchPromises:Promise<Response|void>[] = [];
				let fetchInfo :RequestInit<RequestInitCfProperties> = {
					method:"GET",
					headers:[
						["User-Agent", "Afilliations/1.0.0 (+https://affiliations.noah.exposed) (noahwhygodwhy@pm.me)"],
						["Accept", "application/json"],
						["Authorization", "anon"],
					]
				};

				console.log("conducting fetch");
				let searchResults:SearchResult[] = await Promise.all([
					fetch(searchStrings[0], fetchInfo).then(res => res.json<SearchResult>()),
					fetch(searchStrings[1], fetchInfo).then(res => res.json<SearchResult>()),
					fetch(searchStrings[2], fetchInfo).then(res => res.json<SearchResult>()),
					fetch(searchStrings[3], fetchInfo).then(res => res.json<SearchResult>()),
				]);

				console.log("searchResults.length", searchResults.length);
				// 4x4 array of match sets
				let chosenSearchResults:SingleSearchResult[][] = [];

				searchResults.forEach((data:SearchResult, index:number) => {
					let numResultsReturned = data.result.length;
					let topNumResultsToPickFrom = Math.min(100, numResultsReturned);

					let fourResultIndices :number[] = []; // these are indices in the returned array, not the IDs
					chosenSearchResults.push([])
					for(let i = 0; i < 4; i++)
					{
						let newIndex:number;
						do
						{
							newIndex = getRandomInt(topNumResultsToPickFrom);
						} while(fourResultIndices.find((val:number) => {val = newIndex}) != undefined);
						fourResultIndices.push(newIndex);
						chosenSearchResults[index].push(data.result[newIndex]);
					}
				});

				let insertString = "INSERT INTO daily_ids VALUES"
				let insertionValueArray: any[] = [];
				for(let matchIndex = 0; matchIndex < 4; matchIndex++)
				{
					for(let indexInMatch = 0; indexInMatch < 4; indexInMatch++)
					{
						let indexOutOf16 = (matchIndex*4) + indexInMatch;
						let singleData = chosenSearchResults[matchIndex][indexInMatch];
						let tagIdArrayString:string = JSON.stringify(singleData.tag_ids);

						// 7 columsn of data, 7 ?s
						insertString += " (?, ?, ?, ?, ?, ?, ?)" + (indexOutOf16<15 ? "," : "");// last one gets no ,;
						insertionValueArray.push(indexOutOf16)
						insertionValueArray.push(todaysDateString)
						insertionValueArray.push(singleData.id)
						insertionValueArray.push(matchIndex)
						insertionValueArray.push(tagIdArrayString)
						insertionValueArray.push(singleData.thumbnail)
						insertionValueArray.push(singleData.english_title)
					}
				}

				console.log(insertString);
				await deletionPromise;
				await env.daily_ids.prepare(insertString).bind(...insertionValueArray).run();
			}
			else if(tagResponse.status == 429)
			{
				console.log("429 received")
			}
			else
			{
				console.log("Bad Response from ")
			}
		}

		console.log("cron processed");
		let testSecretValue:string = await env.TestSecret.get();
		console.log("testing a fake secret access:", testSecretValue);
	},
};