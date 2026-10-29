import test from "node:test";
import Timeout from "./components/Timeout.js";
import { delay } from "./helpers/delay.js";
import { equal } from "./helpers/equal.js";
import { rejectAfter } from "./helpers/reject-after.js";
import { rejects } from "./helpers/rejects.js";

// Promises start before rendering reaches them and may reject in the meantime. That must not
// crash Node with an unhandled rejection: the render rejects with the first error it reaches.

test("promise child rejects while an earlier sibling is pending", () =>
  rejects(
    () => (
      <div>
        {delay(30, "a")}
        {rejectAfter(5, "boom")}
      </div>
    ),
    "boom",
  ));

test("nested promise child rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        <p>{rejectAfter(5, "nested")}</p>
      </div>
    ),
    "nested",
  );
});

test("promise in a Set child rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        {new Set([rejectAfter(5, "set")])}
      </div>
    ),
    "set",
  );
});

test("promise in a Map child rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        {new Map([["key", rejectAfter(5, "map value")]]) as any}
      </div>
    ),
    "map value",
  );
});

test("promise as a Map key rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        {new Map([[rejectAfter(5, "map key"), "value"]]) as any}
      </div>
    ),
    "map key",
  );
});

test("promise in an array in a Map child rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  return rejects(
    () => (
      <div>
        <Slow />
        {new Map([["key", [delay(1, "b"), rejectAfter(5, "array in map")]]]) as any}
      </div>
    ),
    "array in map",
  );
});

test("Maps that contain themselves are fine", () => {
  const map = new Map<unknown, unknown>();
  map.set("a", map);
  const First = ({ map }: { map: Map<unknown, unknown> }) => [...map.keys()][0] as string;
  return equal(<First map={map} />, `a`);
});

test("promise child of a component rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const Wrap = ({ children }: { children: JSX.Children }) => <p>{children}</p>;
  return rejects(
    () => (
      <div>
        <Slow />
        <Wrap>{rejectAfter(5, "single child")}</Wrap>
      </div>
    ),
    "single child",
  );
});

test("promise attribute rejects while an earlier sibling is pending", () =>
  rejects(
    () => (
      <p>
        <Timeout ms={10}>a</Timeout>
        <span title={Promise.reject(new Error("early"))}>b</span>
      </p>
    ),
    "early",
  ));

test("promise prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const User = async ({ user }: { user: Promise<{ name: string }> }) => <p>{(await user).name}</p>;
  return rejects(
    () => (
      <div>
        <Slow />
        <User user={rejectAfter(5, "prop")} />
      </div>
    ),
    "prop",
  );
});

test("promise in an array prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const Users = async ({ users }: { users: Promise<string>[] }) =>
    (await Promise.all(users)).join();
  return rejects(
    () => (
      <div>
        <Slow />
        <Users users={[delay(1, "ada"), rejectAfter(5, "array prop")]} />
      </div>
    ),
    "array prop",
  );
});

test("promise in an object prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const User = async ({ data }: { data: { user: Promise<{ name: string }> } }) => (
    <p>{(await data.user).name}</p>
  );
  return rejects(
    () => (
      <div>
        <Slow />
        <User data={{ user: rejectAfter(5, "object prop") }} />
      </div>
    ),
    "object prop",
  );
});

test("promise in an array of an object prop rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const Users = async ({ data }: { data: { users: Promise<string>[] } }) =>
    (await Promise.all(data.users)).join();
  return rejects(
    () => (
      <div>
        <Slow />
        <Users data={{ users: [delay(1, "ada"), rejectAfter(5, "array in object prop")] }} />
      </div>
    ),
    "array in object prop",
  );
});

test("component returns an array with a rejecting promise", () => {
  const List = () => [delay(30, "a"), rejectAfter(5, "array")];
  return rejects(() => <List />, "array");
});

test("component returns a nested array with a rejecting promise", () => {
  const Slow = () => delay(30, "a");
  const List = () => [<Slow />, [[rejectAfter(5, "nested array")]]];
  return rejects(() => <List />, "nested array");
});

test("promise child rejects after an earlier sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  return rejects(
    () => (
      <div>
        <Boom />
        {rejectAfter(5, "second")}
      </div>
    ),
    "first",
  );
});

test("component returns a nested array with a rejecting promise after a sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  const List = () => [<Boom />, [rejectAfter(5, "second")]];
  return rejects(() => <List />, "first");
});

test("promise prop rejects after an earlier sibling threw", () => {
  const Boom = () => {
    throw new Error("first");
  };
  const User = async ({ user }: { user: Promise<{ name: string }> }) => <p>{(await user).name}</p>;
  return rejects(
    () => (
      <div>
        <Boom />
        <User user={rejectAfter(5, "second")} />
      </div>
    ),
    "first",
  );
});

type Node = { name: string; self?: Node };

test("object props that reference themselves are fine", () => {
  // Object props are only walked one level deep, so cyclic data can't recurse forever.
  const node: Node = { name: "a" };
  node.self = node;
  const Name = ({ node }: { node: Node }) => node.self?.name;
  return equal(<Name node={node} />, `a`);
});

test("array props that contain themselves are fine", () => {
  const list: unknown[] = [];
  list.push("a", list);
  const set = new Set<unknown>();
  set.add("b").add(set);
  type Props = { list: unknown[]; set: Set<unknown>; data: { list: unknown[] } };
  const First = ({ list, set, data }: Props) => `${list[0]}${[...set][0]}${data.list[0]}`;
  return equal(<First list={list} set={set} data={{ list }} />, `aba`);
});

test("promise in an array that contains itself rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const list: unknown[] = [];
  list.push(list, rejectAfter(5, "cyclic array"));
  const Item = async ({ list }: { list: unknown[] }) => (await list[1]) as string;
  return rejects(
    () => (
      <div>
        <Slow />
        <Item list={list} />
      </div>
    ),
    "cyclic array",
  );
});

test("promise in an array nested several times rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const inner = [rejectAfter(5, "shared array")];
  const Item = async ({ list }: { list: any[] }) => await list[0][0];
  return rejects(
    () => (
      <div>
        <Slow />
        <Item list={[inner, inner, [inner]]} />
      </div>
    ),
    "shared array",
  );
});
