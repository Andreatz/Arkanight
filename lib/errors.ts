export function getErrorMessage(
  error: unknown,
  fallback = "Errore imprevisto"
) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}

export function getRequestErrorMessage(error: unknown) {
  const message = getErrorMessage(error);
  if (message.toLowerCase().includes("fetch failed")) {
    return "Impossibile contattare Supabase. Controlla connessione e variabili d'ambiente.";
  }
  return message;
}
