"use client";
import {
  ChainId,
  WNATIVE,
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
  createWalletClient,
  http,
  parseUnits,
  BaseError,
  ContractFunctionRevertedError,
} from "viem";
import { avalancheFuji } from "viem/chains";
import { useBalance, useAccount, useWriteContract } from "wagmi";

export default function SwapComponent() {
  const { address } = useAccount();
  const { LBRouterV22ABI } = jsonAbis;
  const CHAIN_ID = 43113;
  const router = LB_ROUTER_V22_ADDRESS[CHAIN_ID];
  const WAVAX = WNATIVE[CHAIN_ID];
  const USDC = new Token(
    CHAIN_ID,
    "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
    6,
    "USDC",
    "USD Coin"
  );

  const USDT = new Token(
    CHAIN_ID,
    "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    6,
    "USDT",
    "Tether USD"
  );

  const BASES = [WAVAX, USDC, USDT];
  const inputToken = USDC;
  const outputToken = WAVAX;
  const isExactIn = true;
  const typedValueIn = "20";
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

  async function approveToken() {
    try {
      await writeApproval({
        address: "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
        abi: [
          {
            name: "approve",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              {
                name: "spender",
                type: "address"
              },
              {
                name: "amount",
                type: "uint256"
              }
            ],
            outputs: [
              {
                name: "",
                type: "bool"
              }
            ]
          }
        ],
        functionName: "approve",
        args: [router, parseUnits('200', 6)],
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

      const validTrades = trades.filter((trade): trade is TradeV2 => trade !== undefined);
      const bestTrade = TradeV2.chooseBestTrade(validTrades, isExactIn);

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

        await writeSwap({
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

  return (
    <main className="flex h-screen flex-col items-center gap-4">
      <h1>Trader Joe Swap</h1>
      <button 
        onClick={approveToken}
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
    </main>
  );
}