import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Copy } from "lucide-react";

function copyToClipboard(text: string) {
  if (!text) return;
	// add toast
  toast("Copied to clipboard");
  navigator.clipboard.writeText(text);
}

export default function CardList() {
  const cards = [
    "How much AVAX do I have left?",
    "Send 0.1 avax to 0x578dC842Bb55bb8b73472d69Fa2097ed1C19c46a",
    "Swap 1 USDC to AVAX",
    "Show me the price of AVAX in USD.",
  ];

  return (
    <div className="w-full text-avax grid grid-cols-2 gap-4 mt-4">
      {cards.map((text, index) => (
        <Card key={index} className="bg-background border">
          <CardContent className="p-4 text-sm flex justify-between items-center">
            <p className="font-medium text-muted-foreground">{text}</p>
            <button
              onClick={() => copyToClipboard(text)}
              className="hover:opacity-80 transition"
            >
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}