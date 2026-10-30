import { Layout } from "../layout.js";

// An account page whose components read the user, the current path and translations
// from the `this` context instead of passing them down as props.

export const ORDER_COUNT = 50;

const messages = {
  "account.title": "Mein Konto",
  "account.greeting": "Hallo",
  "nav.overview": "Übersicht",
  "nav.orders": "Bestellungen",
  "nav.addresses": "Adressen",
  "nav.payment": "Zahlungsarten",
  "nav.settings": "Einstellungen",
  "nav.logout": "Abmelden",
  "orders.title": "Ihre Bestellungen",
  "orders.number": "Bestellnummer",
  "orders.date": "Datum",
  "orders.total": "Summe",
  "orders.status": "Status",
  "orders.details": "Details",
  "status.pending": "In Bearbeitung",
  "status.shipped": "Versandt",
  "status.delivered": "Zugestellt",
  "status.cancelled": "Storniert",
};

const statuses = ["pending", "shipped", "delivered", "cancelled"];

const user = { name: "Erika Mustermann", email: "erika@example.com", avatar: "/avatars/erika.png" };

const orders = Array.from({ length: ORDER_COUNT }, (_, i) => ({
  id: `A-${100000 + i}`,
  date: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  total: `${(12.5 + i * 3.1).toFixed(2).replace(".", ",")} €`,
  status: statuses[i % statuses.length],
}));

/** Creates a new context per render, like a server does per request. */
export function createAccountContext() {
  return {
    user,
    path: "/account/orders",
    t(key) {
      return messages[key] ?? key;
    },
  };
}

function AccountNav() {
  const items = ["overview", "orders", "addresses", "payment", "settings"];
  return (
    <nav class="account-nav">
      <ul>
        {items.map((item) => {
          const href = `/account/${item}`;
          const current = href === this.path;
          return (
            <li class={{ current }}>
              <a href={href} aria-current={current ? "page" : undefined}>
                {this.t(`nav.${item}`)}
              </a>
            </li>
          );
        })}
      </ul>
      <form method="post" action="/logout">
        <button type="submit">{this.t("nav.logout")}</button>
      </form>
    </nav>
  );
}

function UserCard() {
  return (
    <div class="user-card">
      <img src={this.user.avatar} alt="" width={48} height={48} />
      <p>
        {this.t("account.greeting")}, <strong>{this.user.name}</strong>
      </p>
      <p class="email">{this.user.email}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span class={["status", `status-${status}`]}>{this.t(`status.${status}`)}</span>;
}

function OrdersTable() {
  return (
    <table class="orders">
      <caption>{this.t("orders.title")}</caption>
      <thead>
        <tr>
          {["number", "date", "total", "status"].map((column) => (
            <th scope="col">{this.t(`orders.${column}`)}</th>
          ))}
          <th>
            <span class="visually-hidden">{this.t("orders.details")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr>
            <td>{order.id}</td>
            <td>
              <time datetime={order.date}>{order.date}</time>
            </td>
            <td class="amount">{order.total}</td>
            <td>
              <StatusBadge status={order.status} />
            </td>
            <td>
              <a href={`/account/orders/${order.id}`}>{this.t("orders.details")}</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AccountPage() {
  return (
    <Layout title={this.t("account.title")}>
      <div class="account">
        <aside>
          <UserCard />
          <AccountNav />
        </aside>
        <section>
          <OrdersTable />
        </section>
      </div>
    </Layout>
  );
}
