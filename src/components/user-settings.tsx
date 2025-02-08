"use client";

import useChatStore from "@/app/hooks/useChatStore";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function UserSettings() {
	const { setTheme, theme } = useTheme();
	const userName = useChatStore((state) => state.userName);

	return (
		<div className="flex items-center gap-2 justify-between">
			<div className="flex items-center gap-2">
				<Avatar className="flex justify-start items-center overflow-hidden">
					<AvatarImage
						src=""
						alt="AI"
						width={4}
						height={4}
						className="object-contain"
					/>
					<AvatarFallback>
						{userName.substring(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="text-xs truncate">
					<p>{userName}</p>
				</div>
			</div>


			{/*// div for swithing theme using lucide icon */}
			<div
				className="ml-4 flex items-center gap-2 *:transition-all *:duration-300"
			>
				{theme === "dark" ?
					(<button
						onClick={() => setTheme("light")}
						className="flex items-center gap-2 w-8 h-8 rounded-full"
					>
						<Sun className="w-5 h-5" />
					</button>) :
					(<button
						onClick={() => setTheme("dark")}
						className="flex items-center gap-2 w-8 h-8 rounded-full"
					>
						<Moon className="w-5 h-5" />
					</button>)

				}
			</div>

		</div>
	);
}
