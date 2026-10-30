export const logger = {
  warn(message: string, context?: unknown) {
    console.warn(message, context ?? "");
  },

  error(message: string, context?: unknown) {
    console.error(message, context ?? "");
  },
};
