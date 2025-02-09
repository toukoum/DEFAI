import { tool } from "ai";
import { z } from "zod";

// import from .env the API_KEY
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY;

export const convert = tool({
	description: "Convert an amount of cryptocurrency from one currency to another.",
	parameters: z.object({
		amount: z.number().positive().describe("Amount to convert."),
		fromCurrency: z.string().describe("Currency code to convert from (e.g. BTC)."),
		toCurrency: z.string().describe("Currency code to convert to (e.g. USD)."),
	}),
	execute: async ({ amount, fromCurrency, toCurrency }) => {
		try {
			// Ensure the currency codes are uppercase for consistency.
			const from = fromCurrency.toUpperCase();
			const to = toCurrency.toUpperCase();

			
			const response = await fetch(
				`https://min-api.cryptocompare.com/data/price?api_key=${API_KEY}&fsym=${from}&tsyms=${to}`
			);
			const data = await response.json();

			if (!data[to]) {
				throw new Error("Invalid currency conversion pair or API error.");
			}
			
			const rate = data[to];
			const convertedAmount = amount * rate;
			
			return JSON.stringify({
				amount: amount,
				convertedAmount: convertedAmount,
				fromCurrency: from,
				toCurrency: to,
			});
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