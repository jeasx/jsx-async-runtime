import Headline from "./Headline.js";

export default function Layout({ title = "", context = undefined, children = {} }) {
  if (context) {
    this.context = { ...context };
  }
  return (
    <main>
      {title && <Headline title={title} />}
      {children}
    </main>
  );
}
