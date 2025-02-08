import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { ChatRequestOptions, ToolInvocation } from "ai";
import { Message } from "ai/react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ButtonWithTooltip from "../button-with-tooltip";
import CodeDisplayBlock from "../code-display-block";
import { Button } from "../ui/button";
import {
	ChatBubble,
	ChatBubbleAvatar,
	ChatBubbleMessage,
} from "../ui/chat/chat-bubble";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";

export type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	isLoading: boolean | undefined;
	reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
	// on récupère la fonction addToolResult qu'on a passé depuis ChatList
	addToolResult?: (args: { toolCallId: string; result: string }) => void;
};

const MOTION_CONFIG = {
	initial: { opacity: 0, scale: 1, y: 20, x: 0 },
	animate: { opacity: 1, scale: 1, y: 0, x: 0 },
	exit: { opacity: 0, scale: 1, y: 20, x: 0 },
	transition: {
		opacity: { duration: 0.1 },
		layout: {
			type: "spring",
			bounce: 0.3,
			duration: 0.2,
		},
	},
};

function ChatMessage({
	message,
	isLast,
	isLoading,
	reload,
	addToolResult,
}: ChatMessageProps) {
	const [isCopied, setIsCopied] = useState<boolean>(false);

	const { cleanContent } = useMemo(() => {

		return {
			cleanContent: message.content
				.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, "")
				.trim(),
		};
	}, [message.content]);

	const contentParts = useMemo(
		() => cleanContent.split("```"),
		[cleanContent]
	);

	const handleCopy = () => {
		navigator.clipboard.writeText(message.content);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1500);
	};

	const renderContent = () => (
		contentParts.map((part, index) => (
			index % 2 === 0 ? (
				<Markdown key={index} remarkPlugins={[remarkGfm]}>{part}</Markdown>
			) : (
				<pre className="whitespace-pre-wrap" key={index}>
					<CodeDisplayBlock code={part} />
				</pre>
			)
		))
	);

	// On ajoute ici un petit rendu pour les tools
	// (askForConfirmation, getLocation, etc.)
	const renderToolInvocations = () => {
		if (!message.toolInvocations) return null;

		return message.toolInvocations.map((toolInvocation: ToolInvocation) => {
			const { toolCallId, toolName } = toolInvocation;

			// Petit helper
			const confirmResult = (result: string) => {
				if (!addToolResult) return;
				addToolResult({ toolCallId, result });
			};

			if (toolName === "askForConfirmation") {
				const { actionType, message, parameters } = toolInvocation.args;

				console.log("PARAMETERS for askConfirmation tools: ", actionType, message, parameters);

				// If confirmation has already been given, show result
				if ("result" in toolInvocation) {
					return (
						<div key={toolCallId} className="mt-2">
							<strong>Confirmation Given:</strong> {toolInvocation.result}
						</div>
					);
				}

				// Otherwise, render confirmation dialog
				return (
					<div key={toolCallId} className="mt-2">
						<ConfirmationDialog
							actionType={actionType}
							message={message}
							parameters={parameters}
							onConfirm={() => confirmResult("Yes")}
							onCancel={() => confirmResult("No")}
						/>
					</div>
				);
			}

			// 2) getLocation (ou tout autre tool)
			if (toolName === "getLocation") {
				// On regarde si on a un "result"
				if ("result" in toolInvocation) {
					return (
						<div key={toolCallId} className="mt-2">
							<strong>Tool:</strong> {toolName}
							<br />
							<strong>Résultat:</strong> {toolInvocation.result}
						</div>
					);
				}
				// Pas de result => on est en train d’appeler le tool
				return (
					<div key={toolCallId} className="mt-2">
						Call {toolName} in progress...
					</div>
				);
			}

			if (toolName === "transfer") {
				if ("result" in toolInvocation) {
					return (
						// TODO FAire un dialog pour montrer le tool qui s'est exécuté
						<div key={toolCallId} className="mt-2">
							<strong>Tool:</strong> {toolName}
							<br />
							<strong>Result:</strong> {toolInvocation.result}
						</div>
					);
				}
				return (
					<div key={toolCallId} className="mt-2">
						{`Appel du tool ${toolName}...`}
					</div>
				);
			}

			if (toolName === "convert") {
				if ("result" in toolInvocation) {
					return (
						<div key={toolCallId} className="mt-2">
							<strong>Tool:</strong> {toolName}
							<br />
							<strong>Result:</strong> {toolInvocation.result}
						</div>
					);
				}
				return (
					<div key={toolCallId} className="mt-2">
						{`Appel du tool ${toolName}...`}
					</div>
				);
			}

			// fallback si on a d’autres tools
			if (!("result" in toolInvocation)) {
				return (
					<div key={toolCallId} className="mt-2">
						{`Appel du tool ${toolName}...`}
					</div>
				);
			}

			return null;

		});
	};

	const renderActionButtons = () =>
		message.role === "assistant" && (
			<div className="pt-2 flex gap-1 items-center text-muted-foreground">
				{!isLoading && (
					<ButtonWithTooltip side="bottom" toolTipText="Copy">
						<Button
							onClick={handleCopy}
							variant="ghost"
							size="icon"
							className="h-4 w-4"
						>
							{isCopied ? (
								<CheckIcon className="w-3.5 h-3.5 transition-all" />
							) : (
								<CopyIcon className="w-3.5 h-3.5 transition-all" />
							)}
						</Button>
					</ButtonWithTooltip>
				)}
				{!isLoading && isLast && (
					<ButtonWithTooltip side="bottom" toolTipText="Regenerate">
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4"
							onClick={() => reload()}
						>
							<RefreshCcw className="w-3.5 h-3.5 scale-100 transition-all" />
						</Button>
					</ButtonWithTooltip>
				)}
			</div>
		);

	return (
		<motion.div {...MOTION_CONFIG} className="flex flex-col gap-2 whitespace-pre-wrap">
			<ChatBubble variant={message.role === "user" ? "sent" : "received"}>
				{message.role === "assistant" &&
					<ChatBubbleAvatar
						src={message.role === "assistant" ? "/logo-avax.png" : ""}
						width={6}
						height={6}
						className="object-contain"
					/>
				}
				<ChatBubbleMessage>
					{renderToolInvocations()}
					{renderContent()}
					{renderActionButtons()}
				</ChatBubbleMessage>
			</ChatBubble>
		</motion.div>
	);
}

export default memo(
	ChatMessage,
	(prevProps, nextProps) => {
		if (nextProps.isLast) return false;
		return (
			prevProps.isLast === nextProps.isLast &&
			prevProps.message === nextProps.message
		);
	}
);