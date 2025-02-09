import { useMemo } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function SendResultDialog({
  open,
  onOpenChange,
  result,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  result: string;
}) {
  const parsedResult = useMemo(() => {
    try {
      return JSON.parse(result);
    } catch (error) {
      return { error: "Invalid JSON result" };
    }
  }, [result]);

	const formatValue = (value: string) => {
    if (typeof value === "string" && value.startsWith("http")) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {value}
        </a>
      );
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          Show details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6 bg-background text-foreground">
        <DialogHeader>
          <DialogTitle>Transaction details</DialogTitle>
          <DialogDescription>A summary of what happened.</DialogDescription>
        </DialogHeader>
          <div className="space-y-4 mt-4 text-sm">
            {Object.entries(parsedResult).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <span className="text-muted-foreground uppercase text-xs">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium break-all mt">{formatValue(String(value))}</span>
                <Separator className="mt-2" />
              </div>
            ))}
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

export default SendResultDialog;
