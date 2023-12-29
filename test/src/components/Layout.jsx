import Headline from "./Headline";

export default function Layout({ title = "", children = {} }) {
  return (
    <main>
      {title && <Headline title={title} />}
      {children}
    </main>
  );
}
