import { tool } from "ai";
import { z } from "zod";

export const askForConfirmation = tool({
  description: "Ask the user for confirmation before executing an action.",
  parameters: z.object({
    actionType: z.enum(["swap", "bridge", "send", "stack"]).describe("Type of action being confirmed."),
    message: z.string().describe("Detailed message explaining the action. Here don't use any adress just explain the action."),
    //parameters: z.record(z.string(), z.any()).default({}).describe(`
    //  Additional parameters related to the action.

    //  For "send", you might include:
    //  {
    //    from: Sender address,
    //    to: Recipient address,
    //    tokenAddress: Contract address of the token,
    //    tokenName: Name of the token,
    //    amount: Amount to send
    //  }
    //`),

		tokenName: z.string().optional().describe("Name of the token."),
		destination: z.string().optional().describe("Destination address for the action."),
		amount: z.number().optional().describe("Amount to send."),
  }),
});