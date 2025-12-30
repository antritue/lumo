"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileMenu() {
	const [open, setOpen] = useState(false);

	return (
		<div className="md:hidden">
			<button
				type="button"
				className="p-2 rounded-lg hover:bg-secondary transition-colors"
				onClick={() => setOpen(!open)}
				aria-label="Toggle menu"
			>
				{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</button>

			{open && (
				<div className="absolute left-0 right-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-soft-lg p-4 animate-in slide-in-from-top-2 fade-in duration-200">
					<div className="flex flex-col gap-4">
						<button
							type="button"
							className="text-left text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-2 rounded-md hover:bg-secondary"
							onClick={() => {
								setOpen(false);
								window.location.hash = "features";
							}}
						>
							Features
						</button>
						<button
							type="button"
							className="text-left text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-2 rounded-md hover:bg-secondary"
							onClick={() => {
								setOpen(false);
								window.location.hash = "pricing";
							}}
						>
							Pricing
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
