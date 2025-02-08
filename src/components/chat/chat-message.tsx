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

// shadcn Dialog imports
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export type ChatMessageProps = {
  message: Message;
  isLast: boolean;
  isLoading: boolean | undefined;
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
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

// --------------- HELPER COMPONENTS ---------------

// A simple placeholder for the steps in progress
function SendInProgressCard() {
  return (
    <div className="border w-full border-border p-4 my-4 rounded-md shadow-sm">
      <p className="font-semibold text-sm mb-2">Send in progress</p>
      <ul className="text-xs list-disc ml-4 space-y-1">
        <li>Preparing transaction...</li>
        <li>Awaiting signature...</li>
        <li>Broadcasting transaction...</li>
      </ul>
    </div>
  );
}

// A dialog to show final results or extra details
function SendResultDialog({
  open,
  onOpenChange,
  result, // the final result (string)
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  result: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Show details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Transaction details</DialogTitle>
          <DialogDescription>A summary of what happened.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Result:</strong> {result}</p>
          {/* If result is a transaction hash, you can link to an explorer, e.g.: 
              <a href={`https://snowtrace.io/tx/${result}`} target="_blank" rel="noreferrer">
                View on Snowtrace
              </a>
          */}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// The final card once the send is complete
function SendCompleteCard({ result }: { result: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="border w-full border-border p-4 my-4 rounded-md shadow-sm">
      <p className="font-semibold text-sm mb-2">Send complete</p>
      <p className="text-xs">Your transaction was processed successfully.</p>
      <div className="mt-2">
        <SendResultDialog open={dialogOpen} onOpenChange={setDialogOpen} result={result} />
      </div>
    </div>
  );
}

// --------------- MAIN COMPONENT ---------------

function ChatMessage({
  message,
  isLast,
  isLoading,
  reload,
  addToolResult,
}: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Clean up the content, removing <think> tags
  const { cleanContent } = useMemo(() => {
    return {
      cleanContent: message.content
        .replace(/<think>[\s\S]*?(?:<\/think>|$)/g, "")
        .trim(),
    };
  }, [message.content]);

  const contentParts = useMemo(() => cleanContent.split("```"), [cleanContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const renderContent = () => (
    contentParts.map((part, index) =>
      index % 2 === 0 ? (
        <Markdown key={index} remarkPlugins={[remarkGfm]}>
          {part}
        </Markdown>
      ) : (
        <pre className="whitespace-pre-wrap" key={index}>
          <CodeDisplayBlock code={part} />
        </pre>
      )
    )
  );

  const renderToolInvocations = () => {
    if (!message.toolInvocations) return null;

    return message.toolInvocations.map((toolInvocation: ToolInvocation) => {
      const { toolCallId, toolName } = toolInvocation;
      const confirmResult = (result: string) => {
        if (!addToolResult) return;
        addToolResult({ toolCallId, result });
      };

      // askForConfirmation
      if (toolName === "askForConfirmation") {
        const { actionType, message, destination, amount, tokenName } = toolInvocation.args;
        const parameters = {
          destination,
          amount,
          tokenName,
        };
        if ("result" in toolInvocation) {
          return (
            <div key={toolCallId} className="mt-2">
              <strong>Confirmation Given:</strong> {toolInvocation.result}
            </div>
          );
        }
        // Render dialog if not yet confirmed
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

      // send tool
      if (toolName === "send") {
        // if there's no result, it means the tool is still working
        if (!("result" in toolInvocation)) {
          return (
            <div key={toolCallId} className="mt-2">
              <SendInProgressCard />
            </div>
          );
        }
        // if the tool is finished, show the final card
        return (
          <div key={toolCallId} className="mt-2">
            <SendCompleteCard result={toolInvocation.result as string} />
          </div>
        );
      }

      // convert or other tools
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

      // fallback if we have other tools
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

  // Copy + Regenerate buttons
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
        {message.role === "assistant" && (
          <ChatBubbleAvatar
            src={message.role === "assistant" ? "/logo-avax.png" : ""}
            width={6}
            height={6}
            className="object-contain"
          />
        )}
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