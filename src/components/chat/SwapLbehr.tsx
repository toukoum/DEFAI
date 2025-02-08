"use client";
import { useState } from "react";
import { getTokenAvax, getBaseAvax } from "@/constants/tokenInfo";
import {
	ChainId,
	Token,
	TokenAmount,
	Percent,
} from "@traderjoe-xyz/sdk-core";
import {
	PairV2,
	RouteV2,
	TradeV2,
	TradeOptions,
	LB_ROUTER_V22_ADDRESS,
	jsonAbis,
} from "@traderjoe-xyz/sdk-v2";
import {
	createPublicClient,
	http,
	parseUnits,
	Address, parseEther 
} from "viem";
import { avalancheFuji } from "viem/chains";
import { useAccount, useWriteContract, useBalance, useSendTransaction, useWaitForTransactionReceipt  } from "wagmi";
import { abiApprouve } from "@/constants/abi";

export default function SwapComponent() {
	const { data, sendTransaction } = useSendTransaction ();
	const [selectedOption1, setSelectedOption1] = useState<string>('USDC');
	const [selectedOption2, setSelectedOption2] = useState<string>('WAVAX');
	const [amount, setAmount] = useState<string>("0");
	const { address, chainId } = useAccount();
	const { LBRouterV22ABI } = jsonAbis;
	const CHAIN_ID = 43113;
	const router = LB_ROUTER_V22_ADDRESS[CHAIN_ID];
	const BASES = [getTokenAvax("WAVAX", CHAIN_ID), getTokenAvax("USDC", CHAIN_ID), getTokenAvax("USDT", CHAIN_ID)];
	const inputToken = getTokenAvax(selectedOption1, CHAIN_ID);
	const outputToken = getTokenAvax(selectedOption2, CHAIN_ID);
	const isExactIn = true;
	const typedValueIn = amount;
	const typedValueInParsed = parseUnits(typedValueIn, inputToken.decimals);
	const amountIn = new TokenAmount(inputToken, typedValueInParsed);

	const allTokenPairs = PairV2.createAllTokenPairs(
		inputToken,
		outputToken,
		BASES
	);

	const {
		data: approvalHash,
		writeContract: writeApproval,
		error: approvalError,
		isSuccess: isApprovalSuccess,
	} = useWriteContract();

	const {
		data: swapHash,
		writeContract: writeSwap,
		error: swapError
	} = useWriteContract();

	const allPairs = PairV2.initPairs(allTokenPairs);
	const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken);

	const publicClient = createPublicClient({
		chain: avalancheFuji,
		key: address,
		transport: http(),
	});
	function send() {
		const to = "0xCeeabCa9721b0D5D7b5bDcB08a916c76AdC56AF5" as `0x${string}`;
		sendTransaction({ to, value: parseEther("0.1") })
	}

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    })

	function approveToken(token: string, amount: string) {
		try {
			writeApproval({
				address: getTokenAvax(token, CHAIN_ID).address as Address,
				abi: abiApprouve,
				functionName: "approve",
				args: [router, parseUnits(amount, getTokenAvax(token, CHAIN_ID).decimals)],
			});
		} catch (error) {
			console.error("❌ Approve failed:", error);
		}
	}

	async function executeSwap() {
		if (!isApprovalSuccess) {
			console.error("Please approve USDC first");
			return;
		}

		try {
			const trades = await TradeV2.getTradesExactIn(
				allRoutes,
				amountIn,
				outputToken,
				false,
				true,
				publicClient,
				CHAIN_ID
			);
			console.log(trades);

			const validTrades = trades.filter((trade): trade is TradeV2 => trade !== undefined);
			const bestTrade = TradeV2.chooseBestTrade(validTrades, isExactIn);
			console.log(bestTrade);

			if (bestTrade) {
				const { totalFeePct, feeAmountIn } = await bestTrade.getTradeFee();
				console.log("Total fees percentage", totalFeePct.toSignificant(6), "%");
				console.log(`Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`);

				const userSlippageTolerance = new Percent("200", "10000");
				const swapOptions: TradeOptions = {
					allowedSlippage: userSlippageTolerance,
					ttl: 3600,
					recipient: address as string,
					feeOnTransfer: false,
				};

				const {
					methodName,
					args,
					value,
				} = bestTrade.swapCallParameters(swapOptions);

				writeSwap({
					address: router,
					abi: LBRouterV22ABI,
					functionName: methodName,
					args: args,
					account: address,
				});
			}
		} catch (error) {
			console.error("Error executing swap:", error);
		}
	}

	const word = ["USDC", "USDT", "WAVAX"];

	const handleSelect1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedOption1(e.target.value);
	};

	const handleSelect2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedOption2(e.target.value);
	};
	return (
		<main className="flex h-screen flex-col items-center gap-4">
			<textarea id="amount" onChange={(e) => setAmount(e.target.value)} placeholder="Amount"></textarea>
			<select id="select1" onChange={handleSelect1Change} value={selectedOption1 || ""}>
				<option value="" disabled>Select an option</option>
				{word.filter(opt => opt !== selectedOption2).map((opt, index) => (
					<option key={index} value={opt}>{opt}</option>
				))}
			</select>
			<select id="select2" onChange={handleSelect2Change} value={selectedOption2 || ""}>
				<option value="" disabled>Select an option</option>
				{word.filter(opt => opt !== selectedOption1).map((opt, index) => (
					<option key={index} value={opt}>{opt}</option>
				))}
			</select>
			<h1>Trader Joe Swap</h1>
			<button
				onClick={() => approveToken(selectedOption1 || "", amount)}
				className="px-4 py-2 bg-blue-500 text-white rounded"
				disabled={isApprovalSuccess}
			>
				{isApprovalSuccess ? "Approved!" : "Approve USDC"}
			</button>
			<button
				onClick={executeSwap}
				className="px-4 py-2 bg-green-500 text-white rounded"
				disabled={!isApprovalSuccess}
			>
				Swap
			</button>
			{(approvalError || swapError) && (
				<div className="text-red-500">
					{approvalError?.message || swapError?.message}
				</div>
			)}
			{(approvalHash || swapHash) && (
				<div className="text-green-500">
					Transaction Hash: {approvalHash || swapHash}
				</div>
			)}
			<button onClick={send}>send</button>
			{data && <div>Transaction Hash: {data}</div>}
			{isConfirming && <div>Waiting for confirmation...</div>}
			{isConfirmed && <div>Transaction confirmed.</div>}
		</main>
	);
}
