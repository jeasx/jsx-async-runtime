import Headline from "./Headline.js";

type Props = { title?: string; context?: { subtitle: string }; children?: JSX.Children };

export default function Layout(this: any, { title = "", context, children }: Props) {
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
