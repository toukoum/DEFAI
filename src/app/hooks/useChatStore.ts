import { CoreMessage, generateId, Message } from "ai";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ChatSession {
	messages: Message[];
	createdAt: string;
}

interface State {
	chats: Record<string, ChatSession>;
	currentChatId: string | null;
	userName: string | "Elong Musk";
	isLocal: boolean;
}

interface Actions {
	setCurrentChatId: (chatId: string) => void;
	getChatById: (chatId: string) => ChatSession | undefined;
	getMessagesById: (chatId: string) => Message[];
	saveMessages: (chatId: string, messages: Message[]) => void;
	handleDelete: (chatId: string, messageId?: string) => void;
	setUserName: (userName: string) => void;
	setIsLocal: (isLocal: boolean) => void;
}

const useChatStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			chats: {},
			currentChatId: null,
			userName: "Elon Musk",
			isLocal: false,

			setUserName: (userName) => set({ userName }),

			setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
			setIsLocal: (isLocal) => set({ isLocal }),
			getChatById: (chatId) => {
				const state = get();
				return state.chats[chatId];
			},
			getMessagesById: (chatId) => {
				const state = get();
				return state.chats[chatId]?.messages || [];
			},
			saveMessages: (chatId, messages) => {
				set((state) => {
					const existingChat = state.chats[chatId];

					return {
						chats: {
							...state.chats,
							[chatId]: {
								messages: [...messages],
								createdAt: existingChat?.createdAt || new Date().toISOString(),
							},
						},
					};
				});
			},
			handleDelete: (chatId, messageId) => {
				set((state) => {
					const chat = state.chats[chatId];
					if (!chat) return state;

					// If messageId is provided, delete specific message
					if (messageId) {
						const updatedMessages = chat.messages.filter(
							(message) => message.id !== messageId
						);
						return {
							chats: {
								...state.chats,
								[chatId]: {
									...chat,
									messages: updatedMessages,
								},
							},
						};
					}

					// If no messageId, delete the entire chat
					const { [chatId]: _, ...remainingChats } = state.chats;
					return {
						chats: remainingChats,
					};
				});
			},

		}),
		{
			name: "state-hackaton",
			partialize: (state) => ({
				chats: state.chats,
				currentChatId: state.currentChatId,
				userName: state.userName,
			}),
		}
	)
);

export default useChatStore;