import { tool } from "ai";
import { z } from "zod";

export const askForConfirmation = tool({
	description: "Ask the user for confirmation before executing an action.",
	parameters: z.object({
		actionType: z.enum(["swap", "bridge", "transfer"]).describe("Type of action being confirmed."),
		message: z.string().describe("Detailed message explaining the action."),
		parameters: z.record(z.string(), z.any()).default({}).describe("Additional parameters related to the action."),
	}),
});