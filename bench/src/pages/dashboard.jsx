import { Layout } from "../layout.js";
import { cx } from "../cx.js";

// A dashboard that starts all its requests up front and passes the promises down,
// as the README recommends for loading data in parallel: as props of async components,
// as promise children and as promise attributes.

// Resolves right away, so the case measures the runtime's promise handling, not timers.
const load = (value) => Promise.resolve(value);

const api = {
  user: () => load({ name: "Ada <admin>", avatar: "/avatars/ada.png", unread: 3 }),
  stats: () =>
    load([
      { label: "Revenue", value: "€12,340", change: 4.2 },
      { label: "Orders", value: "318", change: -1.3 },
      { label: "Visitors", value: "9,421", change: 12.8 },
      { label: "Conversion", value: "3.4%", change: 0.4 },
    ]),
  orders: () =>
    load(
      Array.from({ length: 20 }, (_, i) => ({
        id: `A-${200000 + i}`,
        customer: `Customer ${i} & Co.`,
        total: `€${(40 + i * 7.5).toFixed(2)}`,
        paid: i % 5 !== 0,
      })),
    ),
  activity: () =>
    load(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        text: `User ${i % 9} changed "Settings" <${i}>`,
        at: new Date(Date.UTC(2026, 9, 30, 8, i)).toISOString(),
      })),
    ),
};

async function UserMenu({ user }) {
  const { name, unread } = await user;
  return (
    <div class="user-menu">
      <span>{name}</span>
      {unread > 0 && (
        <span class="badge" aria-label={`${unread} unread messages`}>
          {unread}
        </span>
      )}
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <div class="stat">
      <h3>{stat.label}</h3>
      <p class="value">{stat.value}</p>
      <p class={cx("change", stat.change < 0 ? "down" : "up")}>
        {stat.change > 0 && "+"}
        {stat.change}%
      </p>
    </div>
  );
}

async function RecentOrders({ orders }) {
  return (
    <table class="orders">
      <tbody>
        {(await orders).map((order) => (
          <tr class={cx({ unpaid: !order.paid })}>
            <td>
              <a href={`/orders/${order.id}`}>{order.id}</a>
            </td>
            <td>{order.customer}</td>
            <td class="amount">{order.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActivityFeed({ activity }) {
  return (
    <ol class="activity">
      {activity.then((items) =>
        items.map((item) => (
          <li>
            <time datetime={item.at}>{item.at.slice(11, 16)}</time> {item.text}
          </li>
        )),
      )}
    </ol>
  );
}

export function Dashboard() {
  // All requests start right away and run in parallel.
  const user = api.user();
  const stats = api.stats();
  const orders = api.orders();
  const activity = api.activity();

  return (
    <Layout title="Dashboard">
      <header class="toolbar">
        <img src={user.then((u) => u.avatar)} alt="" width={32} height={32} />
        <UserMenu user={user} />
      </header>
      <section class="stats">
        {stats.then((stats) => stats.map((stat) => <StatCard stat={stat} />))}
      </section>
      <div class="columns">
        <section>
          <h2>Recent orders</h2>
          <RecentOrders orders={orders} />
        </section>
        <section>
          <h2>Activity</h2>
          <ActivityFeed activity={activity} />
        </section>
      </div>
    </Layout>
  );
}
