"use client";

import useChatStore from "@/app/hooks/useChatStore";
import { Attachment, ChatRequestOptions, generateId } from "ai";
import { Message, useChat } from "ai/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { toast } from "sonner";
import ChatBottombar from "./chat-bottombar";
import ChatList from "./chat-list";
import ChatTopbar from "./chat-topbar";
import { Card, CardContent } from "../ui/card";
import CardList  from "./CardList";
import { useAccount } from "wagmi";

export interface ChatProps {
	id: string;
	initialMessages: Message[] | [];
}

export default function Chat({ initialMessages, id }: ChatProps) {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		isLoading,
		stop,
		setMessages,
		setInput,
		reload,
		addToolResult
	} = useChat({
		id,
		initialMessages,
		onResponse: (response) => {
			if (response) {
				setLoadingSubmit(false);
			}
		},
		onFinish: (message) => {
			const savedMessages = getMessagesById(id);
			saveMessages(id, [...savedMessages, message]);
			setLoadingSubmit(false);
			router.replace(`/home/c/${id}`);
		},
		onError: (error) => {
			setLoadingSubmit(false);
			router.replace("/");
			console.error(error.message);
			console.error(error.cause);
		},
		onToolCall: (tool) => {
			if (tool.toolCall.toolName == "getAvaxBalance") {
				toast("Checking your AVAX balance...");
				// here get the balance from the wallet
			}
		}
	});
	const { address } = useAccount();
	const [loadingSubmit, setLoadingSubmit] = React.useState(false);
	const saveMessages = useChatStore((state) => state.saveMessages);
	const getMessagesById = useChatStore((state) => state.getMessagesById);
	const isLocal = useChatStore((state) => state.isLocal);
	const router = useRouter();

	const isToolInProgress = messages.some(
		(m: Message) =>
			m.role === 'assistant' &&
			m.toolInvocations?.some((tool) => !('result' in tool))
	);


	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		window.history.replaceState({}, "", `/c/${id}`);

		const userMessage: Message = {
			id: generateId(),
			role: "user",
			content: input,
		};

		setLoadingSubmit(true);


		const requestOptions: ChatRequestOptions = {
			body: {
				isLocal: isLocal,
			},
		};

		handleSubmit(e, requestOptions);
		saveMessages(id, [...messages, userMessage]);
	};

	const removeLatestMessage = () => {
		const updatedMessages = messages.slice(0, -1);
		setMessages(updatedMessages);
		saveMessages(id, updatedMessages);
		return updatedMessages;
	};

	const handleStop = () => {
		stop();
		saveMessages(id, [...messages]);
		setLoadingSubmit(false);
	};

	return (
		<div className="flex flex-col w-full max-w-3xl h-full">

			<ChatTopbar
				isLoading={isLoading}
				chatId={id}
				messages={messages}
				setMessages={setMessages}
			/>

			{messages.length === 0 ? (
				<div className="flex flex-col h-full w-full items-center gap-4 justify-center">

					<h1 className="scale-x-[-1] text-[80px] -mb-6 font-bold">D</h1>
					<h2 className="text-2xl mb-6">Defai</h2>


					<p className="self-start pl-6 text-base text-foreground">
						How can I help you today?
					</p>

					<ChatBottombar
						input={input}
						handleInputChange={handleInputChange}
						handleSubmit={onSubmit}
						isLoading={isLoading}
						stop={handleStop}
						setInput={setInput}
						isToolInProgress={isToolInProgress}
						isMiddle={true}
					/>
					
					<CardList />

				

				</div>
			) : (
				<>
					<ChatList
						messages={messages}
						isLoading={isLoading}
						loadingSubmit={loadingSubmit}
						reload={async () => {
							removeLatestMessage();

							const requestOptions: ChatRequestOptions = {
								body: {
									isLocal: isLocal,
								},
							};

							setLoadingSubmit(true);
							return reload(requestOptions);
						}}
						addToolResult={addToolResult}
					/>
					<ChatBottombar
						input={input}
						handleInputChange={handleInputChange}
						handleSubmit={onSubmit}
						isLoading={isLoading}
						stop={handleStop}
						setInput={setInput}
						isToolInProgress={isToolInProgress}
						isMiddle={false}
					/>
				</>
			)}
		</div>
	);
}
