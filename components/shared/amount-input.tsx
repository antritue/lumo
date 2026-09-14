"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatAmountInputDisplay, parseAmountInputValue } from "@/lib/utils";

type AmountInputProps = Omit<
	ComponentProps<"input">,
	"value" | "onChange" | "type"
> & {
	value: string;
	onChange: (rawValue: string) => void;
};

export function AmountInput({ value, onChange, ...props }: AmountInputProps) {
	return (
		<Input
			{...props}
			type="text"
			inputMode="decimal"
			autoComplete="off"
			value={formatAmountInputDisplay(value)}
			onChange={(e) => onChange(parseAmountInputValue(e.target.value))}
		/>
	);
}
