import { tool } from "ai";
import { z } from "zod";


export const swap = tool({
	description: "Swap USDC to AVAX from your connected wallet. Ensure you ask for confirmation before using this tool to prevent unauthorized transactions.",
	parameters: z.object({
		amount: z.number().positive().describe("Amount of USDC to swap."),
	}),
});