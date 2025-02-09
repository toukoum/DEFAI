"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Hexagon } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import NavLinkMobile from "./NavLinkMobile";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const { address, isConnected } = useAccount(); // Wagmi pour voir si le wallet est connecté

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	function onClose() {
		setIsMenuOpen(false);
	}

	const activeLink = typeof window !== "undefined" ? window.location.pathname : "";

	return (
		<header
			className={`sticky left-0 top-0 z-50 w-full bg-background/80 text-foreground backdrop-blur-lg transition-all duration-300 
      ${isScrolled ? "border-b border-border py-4 md:py-2" : "border-b-0 py-4"}`}
		>
			<div className="container mx-auto flex items-center justify-between 2xl:px-0">
				{/* Logo */}
				<a href="/" className="flex items-center space-x-4">
					<div className="flex items-center space-x-4">
						<Image
							src="/red_logo.svg"
							alt="Defai Logo"
							width={32}
							height={32}
							className="w-6 h-6"
						/>
						<h1 className="text-sm font-bold text-foreground">Defai  <span className="text-muted-foreground font-light ml-2">EthOxford</span></h1>
					</div>
				</a>

				{/* Navigation */}
				<div className="flex items-center md:space-x-8">
					{/* Mobile Menu Toggle */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="mr-4 block p-2 transition-all duration-300"
						aria-label="Toggle menu"
					>
						{isMenuOpen ? (
							<ChevronUp size={30} className="stroke-[1.5] text-foreground" />
						) : (
							<ChevronDown size={30} className="stroke-[1.5] text-foreground" />
						)}
					</button>

					{/* Navigation Links */}
					<NavLinkMobile activeLink={activeLink} isMenuOpen={isMenuOpen} onClose={onClose} />

					{/* Try Button, connect wallet if not connected */}
					{isConnected && (
						<div className="flex items-center gap-2 py text-xs text-green-300"> 
							Connected
						</div>
					)}
					<ConnectButton label="Connect" accountStatus="avatar" showBalance={false} />
				</div>
			</div>
		</header>
	);
};

export default Header;