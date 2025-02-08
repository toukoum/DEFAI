
import { tool } from "ai";
import { z } from "zod";

export const getAvaxBalance = tool({
	description:
		"Get the balance of AVAX in your wallet. You don't need any confirmation to execute this tool.",
	parameters: z.object({}),
});