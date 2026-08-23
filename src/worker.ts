import { HttpClient } from "@angular/common/http";

import { SearchResult } from "./nhSchema"


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
		await this.scheduled(controller, env, ctx);
		return new Response("Scheduled handler triggered successfully", {
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
	) {
		{ // section for the first tag request
			let requestInitInfo : RequestInit = {
				method:"GET",
				headers:[["User-Agent", "Afilliations/1.0.0 (+https://affiliations.noah.exposed) (noahwhygodwhy@pm.me)"]],
			}
			let tagRequest : Request = new Request("https://nhentai.net/api/v2/tags/tag?sort=popular&page=1&per_page=25", requestInitInfo);
			let tagResponse:Response = await this.fetch(tagRequest, env, ctx)
			console.log("tagrepsonse.status", tagResponse.status)
			// if((tagResponse.status >= 200) && (tagResponse.status < 300))
			// {
			// 	let data = await tagResponse.json() as SearchResult;
			// 	console.log(data);
			// }
			// else if(tagResponse.status == 429)
			// {
			// 	console.log("429 received")
			// }
			// else
			// {
			// 	console.log("Bad Response from ")
			// }
		}

		console.log("cron processed");
		let testSecretValue:string = await env.TestSecret.get();
		console.log("testing a fake secret access:", testSecretValue);
	},
};