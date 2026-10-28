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

test("promise child of a component rejects while an earlier sibling is pending", () => {
  const Slow = () => delay(30, "a");
  const Wrap = ({ children }) => <p>{children}</p>;
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
  const User = async ({ user }) => <p>{(await user).name}</p>;
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
  const Users = async ({ users }) => (await Promise.all(users)).join();
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
  const User = async ({ data }) => <p>{(await data.user).name}</p>;
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
  const Users = async ({ data }) => (await Promise.all(data.users)).join();
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
  const User = async ({ user }) => <p>{(await user).name}</p>;
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

test("object props that reference themselves are fine", () => {
  // Object props are only walked one level deep, so cyclic data can't recurse forever.
  const node = { name: "a" };
  node.self = node;
  const Name = ({ node }) => node.self.name;
  return equal(<Name node={node} />, `a`);
});
