import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import { Copy } from "lucide-react";
import { Button } from "../ui/button";

function copyToClipboard(text: string) {
  if (!text) return;
  toast("Copied to clipboard");
  navigator.clipboard.writeText(text);
}

export default function CardList() {
  const cards = [
    "Send 0.2 AVAX to 0x578dC842Bb55bb8b73472d69Fa2097ed1C19c46a",
    "How much AVAX do I have remaining?",
    "Swap 10 USDC for AVAX",
    "What is the value of 10 AVAX in USD?",
  ];

  return (
    <div className="w-full text-avax grid grid-cols-2 gap-4 mt-20">
      {cards.map((text, index) => (
        <Card
          key={index}
          className="bg-background border cursor-pointer hover:shadow-lg transition hover:opacity-70"
          onClick={() => copyToClipboard(text)}
        >
          <CardContent className="p-4 text-sm flex justify-between items-center">
            <p className="overflow-hidden font-medium text-card-foreground">
              {text}
            </p>
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event from firing when clicking the button
                copyToClipboard(text);
              }}
              className="hover:opacity-80 transition"
              variant="ghost"
            >
              <Copy className="h-4 w-4 text-card-foreground" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
