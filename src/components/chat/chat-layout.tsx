"use client";

import React from "react";
import Chat, { ChatProps } from "./chat";

type MergedProps = ChatProps;

export function ChatLayout({
  initialMessages,
  id,
}: MergedProps) {
  return (
        <Chat id={id} initialMessages={initialMessages} />
  );
}
