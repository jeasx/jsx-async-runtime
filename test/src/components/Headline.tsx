export default function Headline(this: any, { title = "Hello World" }: { title?: string }) {
  return this?.context?.subtitle ? (
    <h1>
      {title} - {this.context?.subtitle}
    </h1>
  ) : (
    <h1>{title}</h1>
  );
}
