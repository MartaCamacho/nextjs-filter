const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/** Formats a number as Mango-style EUR currency, e.g. `5.99` -> "5,99 €". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
