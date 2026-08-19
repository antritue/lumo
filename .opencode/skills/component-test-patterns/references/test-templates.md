# Test Templates

Load this file when you need the full template code for a specific component type.

## Store test

Replace `Service`, `mockService`, `/api/services`, and `createService("WiFi")` with your feature's types and API path.

```typescript
describe("create<Feature>", () => {
  it("creates locally when unauthenticated", async () => {
    await use<Feature>Store.getState().create<Feature>("New Item");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem({ name: "New Item" }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls API when authenticated", async () => {
    authenticate();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem({ id: "server-id", name: "New Item", userId: "user-123" }),
    });

    await use<Feature>Store.getState().create<Feature>("New Item");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem({ id: "server-id", name: "New Item", userId: "user-123" }));
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/<feature>",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("handles API error gracefully", async () => {
    authenticate();
    mockFetch.mockResolvedValueOnce({ ok: false });
    const consoleSpy = mockErrorConsole();

    await expect(
      use<Feature>Store.getState().create<Feature>("New Item"),
    ).rejects.toThrow("Failed to create <feature>");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(0);
    consoleSpy.mockRestore();
  });
});
```

## Upsert dialog

```typescript
import { fireEvent } from "@testing-library/react";

describe("Upsert<Feature>Dialog", () => {
  const mockItem: Item = { id: "1", userId: "user-1", name: "Test", /* feature fields */ };
  const mockOnOpenChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => { vi.clearAllMocks(); });

  describe("Display", () => {
    it("displays add mode with empty fields", () => {
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={mockOnOpenChange} onSave={mockOnSave} />);
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("heading", { name: /add <feature>/i })).toBeInTheDocument();
      expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("");
    });
  });

  describe("Interactions", () => {
    it("saves item with correct data in add mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={mockOnOpenChange} onSave={mockOnSave} />);
      const dialog = screen.getByRole("dialog");
      const nameInput = within(dialog).getByPlaceholderText(/name/i);
      const form = within(dialog).getByRole("button", { name: /add <feature>/i }).closest("form");
      expect(form).not.toBeNull();

      await user.type(nameInput, "New Item");
      fireEvent.submit(form as HTMLFormElement);
      await act(async () => {});

      expect(mockOnSave).toHaveBeenCalledWith(null, "New Item", /* defaults */);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows error dialog on save failure", async () => {
      const onSave = vi.fn().mockRejectedValue(new Error("API error"));
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={vi.fn()} onSave={onSave} />);
      const dialog = screen.getByRole("dialog");
      const nameInput = within(dialog).getByPlaceholderText(/name/i);
      const form = within(dialog).getByRole("button", { name: /add <feature>/i }).closest("form");
      expect(form).not.toBeNull();

      await userEvent.setup().type(nameInput, "Test");
      fireEvent.submit(form as HTMLFormElement);

      expect(await screen.findByText(/problem adding this <feature>/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    });
  });
});
```

## Delete dialog

```typescript
it("calls onDelete with item id when delete button is clicked", async () => {
  const user = userEvent.setup();
  renderWithProviders(<Delete<Feature>Dialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onDelete={mockOnDelete} />);
  await user.click(screen.getByRole("button", { name: /delete <feature>/i }));
  expect(mockOnDelete).toHaveBeenCalledWith("1");
});

it("shows error dialog on delete failure", async () => {
  const onDelete = vi.fn().mockRejectedValue(new Error("API error"));
  const user = userEvent.setup();
  renderWithProviders(<Delete<Feature>Dialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onDelete={onDelete} />);
  await user.click(screen.getByRole("button", { name: /delete <feature>/i }));
  expect(await screen.findByText(/problem deleting this <feature>/i)).toBeInTheDocument();
});
```

## Item component

```typescript
// Expand/collapse test
it("shows expanded details when clicked", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} />);

  await user.click(screen.getByRole("button", { expanded: false }));

  expect(screen.getByText(/detail label/i)).toBeInTheDocument();
});

// Template A: inline action buttons (services-style)
it("calls onEdit when inline edit button is clicked", async () => {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} onEdit={onEdit} />);

  await user.click(screen.getByRole("button", { name: /edit/i }));

  expect(onEdit).toHaveBeenCalledWith(mockItem);
});

// Template B: kebab menu (rooms/payments-style)
it("calls onEdit when edit is clicked from kebab menu", async () => {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} onEdit={onEdit} />);

  await user.click(screen.getByRole("button"));  // kebab button (first/only button)
  await user.click(screen.getByRole("button", { name: /edit/i }));

  expect(onEdit).toHaveBeenCalledWith(mockItem);
});
```

## List component

```typescript
// Template A: inline action buttons (services-style)
it("opens dialog with item data for editing", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureList />);

  await user.click(screen.getByRole("button", { name: /edit/i }));

  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("Existing Item");
  expect(within(dialog).getByRole("button", { name: /save/i })).toBeEnabled();
});

// Template B: kebab menu (rooms/payments-style)
it("opens dialog with item data for editing via kebab", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureList />);

  const itemCard = screen.getByText("Existing Item").closest("a, div");
  const kebabButton = within(itemCard!).getByRole("button");
  await user.click(kebabButton);
  await user.click(screen.getByRole("button", { name: /edit/i }));

  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("Existing Item");
  expect(within(dialog).getByRole("button", { name: /save/i })).toBeEnabled();
});
```

## Empty state

```typescript
it("creates first item and closes dialog on submit", async () => {
  const user = userEvent.setup();
  renderWithProviders(<EmptyState />);

  await user.click(screen.getByRole("button", { name: /add <feature>/i }));

  const input = screen.getByPlaceholderText(/name/i);
  const saveButton = screen.getByRole("button", { name: /add <feature>/i });

  await user.type(input, "New Item");
  await user.click(saveButton);

  const { items } = use<Feature>Store.getState();
  expect(items).toHaveLength(1);
  expect(items[0].name).toBe("New Item");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

## Page state machine

```typescript
describe("<Feature>Page", () => {
  describe("when fetching items failed", () => {
    it("shows error state with retry button", () => {
      useItemsStore.setState({ isItemsFetchFailed: true, isItemsLoading: false, hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /failed to load/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe("while items are still loading", () => {
    it("shows loading skeleton", () => {
      useItemsStore.setState({ isItemsLoading: true, hasItemsFetched: true });
      const { container } = renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(container.querySelectorAll(".animate-shimmer").length).toBeGreaterThan(0);
    });
  });

  describe("when there are no items", () => {
    it("shows empty state", () => {
      useItemsStore.setState({ items: [], hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /empty title/i })).toBeInTheDocument();
    });
  });

  describe("when items exist", () => {
    it("shows item list", () => {
      useItemsStore.setState({ items: [mockItem()], hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByText(/default item name/i)).toBeInTheDocument();
    });
  });
});
```
