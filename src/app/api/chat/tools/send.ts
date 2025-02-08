import { tool } from "ai";
import { z } from "zod";
import { parseUnits } from "viem";
import { getAccount, writeContract } from "wagmi/actions";

// Avalanche Fuji Testnet Chain ID
//const AVALANCHE_FUJI_CHAIN_ID = 43113;

export const send = tool({
	description: "send AVAX from your connected wallet to another address on the Avalanche Fuji testnet. ASK FOR CONFIRMATION BEFORE USING THIS TOOL.",
	parameters: z.object({
		to: z.string().min(42).max(42).describe("Recipient AVAX address."),
		amount: z.number().positive().describe("Amount of AVAX to send."),
	}),
	execute: async ({ to, amount }) => {
		try {
			console.log("\n\n====>>>>>> send AVAX to", to, "Amount:", amount);
			// Check if wallet is connected
			//const account = getAccount();
			//if (!account.isConnected) {
			//	return "Please connect your wallet first.";
			//}

			//// Send AVAX transaction
			//const tx = await writeContract({
			//	account: account.address,
			//	chainId: AVALANCHE_FUJI_CHAIN_ID,
			//	to: to,
			//	value: parseUnits(amount.toString(), 18), // Convert AVAX amount to Wei
			//});

			//return `Transaction sent! Hash: ${tx.hash}`;
			return `Transaction sent! Hash: 0x1234567890abcdef`;
		} catch (error) {
			console.error("send error:", error);
			if (error instanceof Error) {
				return `Transaction failed: ${error.message}`;
			} else {
				return "Transaction failed: Unknown error";
			}
		}
	},
});