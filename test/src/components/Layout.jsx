export default function Layout({ title = "", children = {} }) {
  return (
    <main>
      {title && <h1>{title}</h1>}
      {children}
    </main>
  );
}
