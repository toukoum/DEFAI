import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
	actionType: "swap" | "bridge" | "transfer";
	message: string;
	parameters: Record<string, any>;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmationDialog({ actionType, message, parameters, onConfirm, onCancel }: ConfirmationDialogProps) {
	const [open, setOpen] = useState(true);

	const actionLabels = {
		swap: "Swap Confirmation",
		bridge: "Bridge Confirmation",
		transfer: "Transfer Confirmation",
	};

	const handleConfirm = () => {
		onConfirm();
		setOpen(false);
	};

	const handleCancel = () => {
		onCancel();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Open Confirmation</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md p-6">
				<DialogHeader>
					<DialogTitle>{actionLabels[actionType]}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-2">
					{Object.entries(parameters).map(([key, value]) => (
						<div key={key} className="flex justify-between text-sm">
							<span className="font-semibold">{key}:</span>
							<span>{value.toString()}</span>
						</div>
					))}
				</div>

				<div className="flex justify-end gap-2 mt-6">
					<Button variant="secondary" onClick={handleCancel}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm}>
						Confirm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}