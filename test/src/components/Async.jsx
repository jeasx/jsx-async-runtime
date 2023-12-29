export default async function Async({ children = {} }) {
  await new Promise((res) => setTimeout(res, 1));
  return <div>{children}</div>;
}
