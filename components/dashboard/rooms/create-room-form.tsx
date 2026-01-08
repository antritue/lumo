"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateRoomFormProps {
	onSubmit: (name: string) => void;
	onCancel?: () => void;
	showCancel?: boolean;
}

export function CreateRoomForm({
	onSubmit,
	onCancel,
	showCancel = false,
}: CreateRoomFormProps) {
	const t = useTranslations("app.rooms");
	const [roomName, setRoomName] = useState("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName) return;

		onSubmit(trimmedName);
		setRoomName("");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				type="text"
				value={roomName}
				onChange={(e) => setRoomName(e.target.value)}
				placeholder={t("inputPlaceholder")}
				className="text-base h-12"
				autoFocus
			/>
			<div className={showCancel ? "flex gap-3" : ""}>
				<Button
					type="submit"
					size="lg"
					className={showCancel ? "flex-1" : "w-full"}
					disabled={!roomName.trim()}
				>
					<Plus className="mr-2" />
					{t("addButton")}
				</Button>
				{showCancel && onCancel && (
					<Button type="button" variant="outline" size="lg" onClick={onCancel}>
						{t("cancel")}
					</Button>
				)}
			</div>
		</form>
	);
}
