export const rejectAfter = (ms, message) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
