import { tool } from "ai";
import { z } from "zod";

export const convert = tool({
	description:
		"Convert an amount of money from one currency to another.",
	parameters: z.object({
		amount: z.number().positive().describe("Amount of money to convert."),
		fromCurrency: z.string().describe("Currency code to convert from."),
		toCurrency: z.string().describe("Currency code to convert to."),
	}),
	execute: async ({ amount, fromCurrency, toCurrency }) => {
		try {
			//const response = await fetch(
			//	`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
			//);
			//const data = await response.json();
			//const rate = data.rates[toCurrency];
			//const convertedAmount = amount * rate;
			//return `${amount} ${fromCurrency} is equal to ${convertedAmount} ${toCurrency}.`;

			// hardcode the conversion rate for now
			return `${amount} ${fromCurrency} is equal to ${amount * 0.85} ${toCurrency}.`;
		} catch (error) {
			console.error("Conversion error:", error);
			if (error instanceof Error) {
				return `Conversion failed: ${error.message}`;
			} else {
				return "Conversion failed: Unknown error";
			}
		}
	},
});