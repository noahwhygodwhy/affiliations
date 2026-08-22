
interface Env {
	TestSecret:string; // todo; is this the right thing?
}
export default {
	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext,
	) {
		console.log("cron processed");
		console.log("testing a fake secret access:", env.TestSecret);
	},
};