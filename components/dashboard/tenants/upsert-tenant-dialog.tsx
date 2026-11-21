"use client";

import { Info, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useEffect, useState } from "react";
import type { Property } from "@/components/dashboard/properties/types";
import type { Room } from "@/components/dashboard/rooms/types";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isValidEmail } from "@/lib/utils";
import { RoomOccupiedError } from "./store";
import type { Tenant, TenantInput } from "./types";

interface UpsertTenantDialogProps {
	mode: "add" | "edit";
	tenant?: Tenant;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (input: TenantInput) => Promise<void>;
	rooms: Room[];
	properties: Property[];
	occupiedRoomIds: Set<string>;
}

type ErrorKind = "create" | "update" | "roomOccupied" | null;

export function UpsertTenantDialog({
	mode,
	tenant,
	open,
	onOpenChange,
	onSave,
	rooms,
	properties,
	occupiedRoomIds,
}: UpsertTenantDialogProps) {
	const t = useTranslations("app.tenants");

	const [fullName, setFullName] = useState("");
	const [roomId, setRoomId] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorKind, setErrorKind] = useState<ErrorKind>(null);

	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorKind(null);
		}
		if (mode === "edit" && tenant) {
			setFullName(tenant.fullName);
			setRoomId(tenant.roomId ?? "");
			setPhone(tenant.phone ?? "");
			setEmail(tenant.email ?? "");
			setNotes(tenant.notes ?? "");
		} else {
			setFullName("");
			setRoomId("");
			setPhone("");
			setEmail("");
			setNotes("");
		}
	}, [mode, tenant, open]);

	const trimmedEmail = email.trim();
	const emailIsValid = trimmedEmail === "" || isValidEmail(trimmedEmail);
	const canSubmit = fullName.trim().length > 0 && emailIsValid;

	const selectableRooms = rooms.filter(
		(room) => !occupiedRoomIds.has(room.id) || room.id === tenant?.roomId,
	);
	const roomGroups = properties
		.map((property) => ({
			property,
			rooms: selectableRooms.filter((room) => room.propertyId === property.id),
		}))
		.filter((group) => group.rooms.length > 0);

	const roomHelper =
		rooms.length === 0
			? t("form.roomHelperEmpty")
			: selectableRooms.length === 0
				? t("form.roomHelperFull")
				: t("form.roomHelper");

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		const trimmedName = fullName.trim();
		if (!trimmedName || !emailIsValid) return;

		setIsSubmitting(true);

		try {
			await onSave({
				fullName: trimmedName,
				roomId: roomId || null,
				phone: phone.trim() || null,
				email: trimmedEmail || null,
				notes: notes.trim() || null,
			});
			onOpenChange(false);
		} catch (error) {
			setIsSubmitting(false);
			setErrorKind(
				error instanceof RoomOccupiedError
					? "roomOccupied"
					: mode === "edit"
						? "update"
						: "create",
			);
		}
	};

	const title = mode === "edit" ? t("editTitle") : t("addButton");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">{title}</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="tenant-upsert-loader"
						/>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<label htmlFor="tenantName" className="text-sm font-medium">
								{t("form.name")}
							</label>
							<Input
								id="tenantName"
								type="text"
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								placeholder={t("form.namePlaceholder")}
								className="text-base h-12"
								autoFocus
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="tenantRoom" className="text-sm font-medium">
								{t("form.room")}
								<span className="ml-1 font-normal text-muted-foreground">
									({t("form.optional")})
								</span>
							</label>
							<select
								id="tenantRoom"
								value={roomId}
								onChange={(event) => setRoomId(event.target.value)}
								className="flex h-12 w-full rounded-xl border border-border bg-background px-3 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							>
								<option value="">{t("form.roomPlaceholder")}</option>
								{roomGroups.map((group) => (
									<optgroup key={group.property.id} label={group.property.name}>
										{group.rooms.map((room) => (
											<option key={room.id} value={room.id}>
												{room.name}
											</option>
										))}
									</optgroup>
								))}
							</select>
							<p className="flex gap-1.5 text-xs leading-relaxed text-foreground/80">
								<Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
								{roomHelper}
							</p>
						</div>

						<div className="flex items-center gap-3 pt-1">
							<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{t("form.contactDetails")}
							</span>
							<div className="h-px flex-1 bg-border" />
						</div>

						<div className="space-y-2">
							<label htmlFor="tenantPhone" className="text-sm font-medium">
								{t("form.phone")}
								<span className="ml-1 font-normal text-muted-foreground">
									({t("form.optional")})
								</span>
							</label>
							<Input
								id="tenantPhone"
								type="tel"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								placeholder={t("form.phonePlaceholder")}
								className="text-base h-12"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="tenantEmail" className="text-sm font-medium">
								{t("form.email")}
								<span className="ml-1 font-normal text-muted-foreground">
									({t("form.optional")})
								</span>
							</label>
							<Input
								id="tenantEmail"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder={t("form.emailPlaceholder")}
								aria-invalid={!emailIsValid}
								className="text-base h-12"
							/>
							{!emailIsValid && (
								<p className="text-xs text-destructive">
									{t("form.emailInvalid")}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<label htmlFor="tenantNotes" className="text-sm font-medium">
								{t("form.notes")}
								<span className="ml-1 font-normal text-muted-foreground">
									({t("form.optional")})
								</span>
							</label>
							<Textarea
								id="tenantNotes"
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								className="text-base min-h-20 resize-none"
								rows={3}
							/>
						</div>

						<div className="flex gap-3">
							<Button
								type="submit"
								size="lg"
								className="flex-1"
								disabled={!canSubmit}
							>
								{title}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="flex-1"
								onClick={() => onOpenChange(false)}
							>
								{t("form.cancel")}
							</Button>
						</div>
					</form>
				)}

				<ErrorDialog
					open={errorKind !== null}
					onOpenChange={(nextOpen) => !nextOpen && setErrorKind(null)}
					title={
						errorKind === "roomOccupied"
							? t("errors.roomOccupied.title")
							: errorKind === "update"
								? t("errors.update.title")
								: t("errors.create.title")
					}
					description={
						errorKind === "roomOccupied"
							? t("errors.roomOccupied.description")
							: errorKind === "update"
								? t("errors.update.description")
								: t("errors.create.description")
					}
				/>
			</DialogContent>
		</Dialog>
	);
}
