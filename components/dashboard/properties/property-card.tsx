"use client";

import { Home } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "./types";

interface PropertyCardProps {
	property: Property;
	onClick?: (property: Property) => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
	return (
		<Card
			className="hover:shadow-soft-lg transition-shadow cursor-pointer"
			onClick={() => onClick?.(property)}
		>
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
						<Home className="h-5 w-5 text-muted-foreground" />
					</div>
					{property.name}
				</CardTitle>
			</CardHeader>
		</Card>
	);
}
