import { Button } from "@/components/ui/button";
import {
	DrawerClose,
	DrawerContent,
	DrawerFooter,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import Link from "next/link";

interface NavLinkProps {
	activeLink: string;
	isMenuOpen: boolean;
	onClose: () => void;
}

const NavLinkMobile: React.FC<NavLinkProps> = ({ activeLink, isMenuOpen, onClose }) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		setOpen(isMenuOpen);
	}, [isMenuOpen]);

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) onClose();
	};

	const links: [string, string][] = [
		["/", "Home"],
		["/ethoxford", "Hackathon"],
	];

	return (
		<Drawer.Root open={open} onOpenChange={handleOpenChange}>
			<DrawerContent>

				<div className="flex flex-col max-w-sm sm:mx-auto min-w-[50%]">
					<div className="m-4 my-8 flex flex-col gap-4 pl-8 max-w-3xl">
						{links.map(([link, text]) => (
							<div key={link} className="relative">
								<Link href={link} className="text-semibold text-foreground" onClick={onClose}>
									{text}
								</Link>
								{activeLink === link && (
									<div className="absolute top-0 h-full w-px -translate-x-4 bg-foreground transition-all duration-300"></div>
								)}
							</div>
						))}
					</div>
					<DrawerFooter>
						<DrawerClose asChild>
							<Button variant="outline" onClick={() => handleOpenChange(false)}>
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer.Root>
	);
};

export default NavLinkMobile;