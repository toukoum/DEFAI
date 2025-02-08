import React, { useEffect, useRef } from "react";

interface ToolExecutorProps {
  toolCallId: string;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  executeTool: () => Promise<any>;
}

const ToolExecutor: React.FC<ToolExecutorProps> = ({
  toolCallId,
  addToolResult,
  executeTool,
}) => {
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return; // On s'assure que ça ne s'exécute qu'une fois
    executedRef.current = true;
    executeTool()
      .then((result) => {
        if (addToolResult) {
          addToolResult({ toolCallId, result });
        }
      })
      .catch((error) => {
        console.error("Error executing tool", error);
      });
  }, [toolCallId, addToolResult, executeTool]);

  return <div className="mt-2">Executing tool...</div>;
};

export default ToolExecutor;