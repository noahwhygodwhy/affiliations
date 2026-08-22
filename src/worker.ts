
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
		ctx: ExecutionContext,
	) {
		console.log("cron processed");
		let testSecretValue:string = env.TestSecret;
		console.log("testing a fake secret access:", env.TestSecret);
	},
};