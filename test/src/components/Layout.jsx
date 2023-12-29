import Hello from "./Hello";

export default function Layout({ title = "", children = {} }) {
  return (
    <main>
      {title && <Hello title={title} />}
      {children}
    </main>
  );
}
