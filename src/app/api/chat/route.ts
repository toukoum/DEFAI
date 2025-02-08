import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { askForConfirmation } from "./tools/askForConfirmation";
import { getLocation } from "./tools/getLocation";
import { createOllama } from "ollama-ai-provider";
import { transfer } from "./tools/transfer";
import { convert } from "./tools/convert";

export const maxDuration = 30;

const LOCAL_MODELS = {
	"llama": "llama3.1:latest",
	"mistral": "mistral:latest",
	"deepseek": "deepseek-r1:8b",
}

const selectedLocalModel = LOCAL_MODELS["llama"];

export async function POST(req: Request) {
	try {
		const { messages, isLocal } = await req.json();
		console.log("[CHAT-API] Incoming messages:", messages);
		console.log('isLocal:', isLocal);

		const tools = {
			askForConfirmation,
			getLocation,
			transfer,
			convert,
		};


		let result;

		if (!isLocal) {
			result = streamText({
				model: openai("gpt-4o-mini"),
				messages,
				tools,
				maxSteps: 5,
			});
		} else {
			const ollama = createOllama({ baseURL: process.env.OLLAMA_URL + "/api" });
			result = streamText({
				model: ollama(selectedLocalModel, { simulateStreaming: true }),
				messages,
				tools,
				maxSteps: 5,
			});
		}

		return result.toDataStreamResponse({
			getErrorMessage: (error) => {
				console.error("ERREUR AVEC LE STREAMING DE LA RESPONSE API CALL:", error);
				return "An error occurred during the API call.";
			},
		});
	} catch (err) {
		console.error("ERREUR PLUS GLOBALE", err);
		return new Response("Internal Server Error", { status: 500 });
	}
}
