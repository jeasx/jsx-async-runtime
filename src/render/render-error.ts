export class RenderError extends Error {
  private tags: string[] = [];

  constructor(message: string, tag?: string) {
    super(message);
    this.name = "RenderError";
    this.message = message;
    if (tag) {
      this.pushTag(tag);
    }
  }

  pushTag(tag: string) {
    this.tags.unshift(tag);
  }

  updateMessage() {
    this.message = `\nError: ${this.tags
      .filter((tag) => tag)
      .map((tag) => `<${tag}>`)
      .join("")}\nCause: ${this.message}`;
  }
}
