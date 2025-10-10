export default function Unescaped({ children }) {
  const $jsxEscapeHTML = this.jsxEscapeHTML;

  const EscapeHTML = () => {
    this.jsxEscapeHTML = $jsxEscapeHTML;
    return null;
  };

  this.jsxEscapeHTML = false;

  return (
    <>
      {children}
      <EscapeHTML />
    </>
  );
}
