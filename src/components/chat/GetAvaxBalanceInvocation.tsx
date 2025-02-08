//import React, { useEffect } from "react";
//import { getAvaxBalance } from "./tools/getAvaxBalance"; // your client-side tool
//import { useAccount } from "wagmi";

//interface GetAvaxBalanceInvocationProps {
//  toolCallId: string;
//  toolInvocation: any; // Replace 'any' with the appropriate type if known
//  addToolResult?: (result: { toolCallId: string; result: any }) => void; // Replace 'any' with the appropriate type if known
//}

//const GetAvaxBalanceInvocation: React.FC<GetAvaxBalanceInvocationProps> = ({ toolCallId, toolInvocation, addToolResult }) => {
//  const { address } = useAccount();

//  useEffect(() => {
//    if (!("result" in toolInvocation) && address) {
//      getAvaxBalance.execute({ walletAddress: address, chain: "avalanche" })
//        .then((result: any) => {
//          addToolResult && addToolResult({ toolCallId, result });
//        })
//        .catch((error: any) => {
//          addToolResult && addToolResult({ toolCallId, result: `Error: ${error.message}` });
//        });
//    }
//  }, [toolCallId, toolInvocation, address, addToolResult]);

//  return (
//    <div className="mt-2">
//      Checking your AVAX balance...
//    </div>
//  );
//};

//export default GetAvaxBalanceInvocation;