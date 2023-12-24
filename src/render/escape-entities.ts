export function escapeEntities(input: string) {
  if (typeof input === "string") {
    return input.replace(ESCAPE, (match) => {
      return ENTITIES[match];
    });
  } else {
    return input;
  }
}

const ENTITIES: { [k: string]: any } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const ESCAPE = new RegExp(`[${Object.keys(ENTITIES).join("")}]`, "g");
