export default async function Timeout({ ms = 1, children = {} }) {
  await new Promise((res) => setTimeout(res, ms));
  return <div>{children}</div>;
}
