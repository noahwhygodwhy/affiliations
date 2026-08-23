import { HttpClient } from "@angular/common/http";

import { SearchResult, TagResult, SingleSearchResult, SingleTagResult } from "./nhSchema"

import { Temporal } from '@js-temporal/polyfill';


interface DatabaseRow
{
	indexInDay:number;
	dateUsed:string;
	sixDigis:string;
	matchIndex:number;
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

			if((tagResponse.status >= 200) && (tagResponse.status < 300))
			{
				let todaysDateString = Temporal.Now.plainDateISO().toString();
				env.daily_ids.prepare("DELETE * FROM daily_ids WHERE dateUsed = " + todaysDateString).run()

				let data = await tagResponse.json() as TagResult;

				let insertString = "INSERT INTO daily_ids VALUES"
				for(let i = 0; i < 16; i++)
				{
					let singleData:SingleTagResult = data.result[i];

					insertString += " ("
					insertString += i + ", "
					insertString += todaysDateString + ", "
					insertString += singleData.id + ", "
					insertString += i/4 + "), "
				}
				await env.daily_ids.prepare(insertString).run();

				console.log(data);
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