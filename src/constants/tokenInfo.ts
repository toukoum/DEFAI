import {
	ChainId,
	WNATIVE,
	Token,
} from "@traderjoe-xyz/sdk-core";

function getWAVAX(CHAIN_ID: ChainId) : Token {
	return WNATIVE[CHAIN_ID];
}
function getUSDCAvax(CHAIN_ID: ChainId): Token {
	return new Token(
	CHAIN_ID,
	"0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
	6,
	"USDC",
	"USD Coin"
)};

function getUSDTAvax(CHAIN_ID: ChainId): Token {
	return new Token(
	CHAIN_ID,
	"0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
	6,
	"USDT",
	"Tether USD"
)};

export function getTokenAvax(tokenName: string, CHAIN_ID: ChainId): Token {
	if (tokenName === "USDC") {
		return getUSDCAvax(CHAIN_ID);
	} else if (tokenName === "USDT") {
		return getUSDTAvax(CHAIN_ID);
	} else {
		return getWAVAX(CHAIN_ID);
	}
}
export function getBaseAvax(CHAIN_ID: ChainId): Token[] {
	return [getWAVAX(CHAIN_ID), getUSDCAvax(CHAIN_ID), getUSDTAvax(CHAIN_ID)];
}