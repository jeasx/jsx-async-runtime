export default function Headline({ title = "Hello World" }) {
  return this?.context?.subtitle ? (
    <h1>
      {title} - {this.context?.subtitle}
    </h1>
  ) : (
    <h1>{title}</h1>
  );
}
