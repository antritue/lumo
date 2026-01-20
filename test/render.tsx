import { type RenderOptions, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import messages from "@/messages/en.json";

interface WrapperProps {
	children: React.ReactNode;
}

function wrapper({ children }: WrapperProps) {
	return (
		<NextIntlClientProvider locale="en" messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}

/**
 * Renders a component with i18n provider configured for testing.
 * Always uses English locale for consistent test assertions.
 */
export function renderWithProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return render(ui, { wrapper, ...options });
}
