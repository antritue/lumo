"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ErrorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: string;
	description?: string;
}

export function ErrorDialog({
	open,
	onOpenChange,
	title = "Something went wrong",
	description = "An unexpected error occurred. Please try again later.",
}: ErrorDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-6 w-6 text-destructive" />
					</div>
					<DialogTitle className="text-center">{title}</DialogTitle>
					<DialogDescription className="text-center">
						{description}
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-center pt-2">
					<Button
						onClick={() => onOpenChange(false)}
						variant="destructive"
						className="w-full"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
