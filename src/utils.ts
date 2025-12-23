export class Utils {
    /**
     * Removes eventual markdown code block markers from a string
     * @param text The input text possibly containing code block markers
     * @returns The cleared text
     */
    public static removeCodeBlockMarkers(text: string): string {
        if (!text || typeof text !== "string") {
            return "";
        }
        return text.replace(/^```[\w]*\n|```$/g, "");
    }

    /**
     * Formats an error message for display, extracting meaningful info from nested * JSON if present
     * @param error The error object or message
     * @param htmlMode Whether to format for HTML display (default: false)
     * @returns The formatted error message
     */
    public static formatErrorMessage(
        error: any,
        htmlMode: boolean = false
    ): string {
        const rawMessage =
            error instanceof Error ? error.message : String(error);
        const jsonMatch = rawMessage.match(/\{.*"error":\{.*\}\}$/);

        const cleanMessage = jsonMatch
            ? (() => {
                  try {
                      const parsed = JSON.parse(jsonMatch[0]);
                      return parsed?.error?.message ?? rawMessage;
                  } catch {
                      return rawMessage;
                  }
              })()
            : rawMessage;

        return (
            "An error occurred while processing your request." +
            (htmlMode
                ? `<br>Error details: <span class="error-text">${cleanMessage}</span>`
                : `\nError details: ${cleanMessage}`)
        );
    }
}
