type Props = { ms?: number; children?: JSX.Children };

export default async function Timeout({ ms = 1, children }: Props) {
  await new Promise((res) => setTimeout(res, ms));
  return <div>{children}</div>;
}
