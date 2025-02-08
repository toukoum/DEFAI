import { tool } from "ai";
import { z } from "zod";

export const getLocation = tool({
	description:
		"Get a random city. Make sure to ask for confirmation before using this tool.",
	parameters: z.object({}),
	execute: async () => {
		const cities = [
			"Paris",
			"Montpellier",
			"Toulouse",
			"Marseille",
			"Bordeaux",
		];
		const randomCity =
			cities[Math.floor(Math.random() * cities.length)];
		return `La ville générée est : ${randomCity}`;
	},
});