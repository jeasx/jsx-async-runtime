export default function Html({ children }) {
  const $jsxEscapeHTML = this.jsxEscapeHTML;

  const RestoreEscape = () => {
    this.jsxEscapeHTML = $jsxEscapeHTML;
    return null;
  };

  this.jsxEscapeHTML = false;

  return (
    <>
      {children}
      <RestoreEscape />
    </>
  );
}
