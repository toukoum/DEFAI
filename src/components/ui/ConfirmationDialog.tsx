import { useState, useRef } from "react";
import { Copy } from "lucide-react";
import { useAccount } from "wagmi";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
	actionType: "swap" | "bridge" | "send";
	message: string;
	parameters: Record<string, any>;
	onConfirm: () => void;
	onCancel: () => void;
	toolCallId: string;
	addToolResult?: (args: { toolCallId: string; result: string }) => void;
}

// Simple dictionary to map token names to addresses
const tokenAddresses: Record<string, string> = {
	AVAX: "0xAvax1234567890abcdef0000000000000000000000",
	USDC: "0xUsdc1234567890abcdef0000000000000000000000",
	// ... add more if needed
};

function truncateAddress(address: string, start = 6, end = 4): string {
	if (!address) return "";
	if (address.length <= start + end) return address;
	return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function copyToClipboard(text: string) {
	if (!text) return;
	navigator.clipboard.writeText(text);
}

export function ConfirmationDialog({
	actionType,
	message,
	parameters,
	onConfirm,
	onCancel,
	toolCallId,
	addToolResult,
}: ConfirmationDialogProps) {
	// Remove the DialogTrigger – we want this to open immediately.
	const [open, setOpen] = useState(true);
	// Use a ref to ensure the confirmation is processed only once.
	const executedRef = useRef(false);

	// NOTE: Removed the useEffect that was setting executedRef.current = true

	// WAGMI: get user address
	const { address: userAddr } = useAccount();

	// Map token name to token address, if provided
	let mappedTokenAddress = "";
	if (parameters.tokenName && tokenAddresses[parameters.tokenName]) {
		mappedTokenAddress = tokenAddresses[parameters.tokenName];
	}
	if (!mappedTokenAddress) {
		mappedTokenAddress = "0x1234567890abcdef000000000000000000000000";
	}

	// Label for the dialog title
	const actionLabels = {
		swap: "Swap confirmation",
		bridge: "Bridge confirmation",
		send: "Send confirmation",
	};

	const handleConfirm = () => {
		if (!executedRef.current) {
			executedRef.current = true;
			onConfirm();
			setOpen(false);
		}
	};

	const handleCancel = () => {
		if (!executedRef.current) {
			executedRef.current = true;
			onCancel();
			setOpen(false);
		}
	};

	// Specialized layout if actionType is "send"
	const isSend = actionType === "send";

	// Truncate addresses
	const truncatedUserAddress = userAddr ? truncateAddress(userAddr) : "";
	const truncatedDestination = parameters.destination
		? truncateAddress(parameters.destination)
		: "";
	const truncatedTokenAddress = mappedTokenAddress
		? truncateAddress(mappedTokenAddress)
		: "";

	// Helper component to render an address row with a copy icon
	const RenderAddressRow = ({
		label,
		fullAddress,
		truncated,
	}: {
		label: string;
		fullAddress: string;
		truncated: string;
	}) => {
		if (!fullAddress) return null;
		return (
			<div className="flex justify-between py-2 text-sm">
				<span className="font-semibold">{label}</span>
				<div className="flex items-center gap-2">
					<span>{truncated}</span>
					<button
						type="button"
						onClick={() => copyToClipboard(fullAddress)}
						className="hover:opacity-80"
					>
						<Copy className="h-4 w-4" />
					</button>
				</div>
			</div>
		);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Open confirmation</Button>
			</DialogTrigger>
			<DialogContent
				forceMount
				className="max-w-md p-6 focus-visible:ring-0 focus-visible:outline-none"
			>
				<DialogHeader>
					<DialogTitle className="mb-4">{actionLabels[actionType]}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				{isSend ? (
					<div className="mt-4">
						<h3 className="mb-3 text-md font-semibold text-muted-foreground">
							Details
						</h3>
						<div className="space-y-2 divide-y divide-border">
							<div className="flex justify-between py-2 text-sm">
								<span className="font-semibold">Action type</span>
								<span>Send</span>
							</div>

							<RenderAddressRow
								label="From"
								fullAddress={userAddr ?? ""}
								truncated={truncatedUserAddress}
							/>

							<RenderAddressRow
								label="To"
								fullAddress={parameters.destination ?? ""}
								truncated={truncatedDestination}
							/>

							{parameters.tokenName && (
								<div className="flex justify-between py-2 text-sm">
									<span className="font-semibold">Token name</span>
									<span>{parameters.tokenName}</span>
								</div>
							)}

							<RenderAddressRow
								label="Token address"
								fullAddress={mappedTokenAddress}
								truncated={truncatedTokenAddress}
							/>

							{parameters.amount && (
								<div className="flex justify-between py-2 text-sm">
									<span className="font-semibold">Amount</span>
									<span className="font-bold">{parameters.amount}</span>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="mt-4 space-y-2 divide-y divide-border">
						{Object.entries(parameters).map(([key, value]) => {
							if (!value) return null;
							let displayValue = value;
							if (typeof value === "string" && value.startsWith("0x")) {
								displayValue = truncateAddress(value);
							}
							const isLikelyAddress =
								typeof value === "string" && value.startsWith("0x");
							return (
								<div key={key} className="flex justify-between py-2 text-sm">
									<span className="font-semibold">{key}:</span>
									<div className="flex items-center gap-2">
										<span>
											{displayValue?.toString?.() ?? String(displayValue)}
										</span>
										{isLikelyAddress && (
											<button
												type="button"
												onClick={() => copyToClipboard(value as string)}
												className="hover:opacity-80"
											>
												<Copy className="h-4 w-4" />
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}

				<div className="mt-6 flex justify-end gap-2">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						className="bg-avax hover:bg-avax hover:opacity-90"
						onClick={handleConfirm}
					>
						Confirm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}