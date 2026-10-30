import { html } from "jsx-async-runtime";

/**
 * The page frame shared by all cases. `head` adds page-specific elements to the `<head>`.
 */
export function Layout({ title, head = undefined, children }) {
  return (
    <>
      {html("<!DOCTYPE html>")}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title}</title>
          <link rel="stylesheet" href="/styles.css" />
          {head}
        </head>
        <body>
          <nav>
            <ul>
              {["Home", "Products", "About", "Contact"].map((label) => (
                <li>
                  <a href={`/${label.toLowerCase()}`} class={{ active: label === "Products" }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <main>{children}</main>
          <footer>
            <p>© 2026 Example</p>
          </footer>
        </body>
      </html>
    </>
  );
}
