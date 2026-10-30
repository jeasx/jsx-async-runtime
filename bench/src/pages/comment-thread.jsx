import { Layout } from "../layout.js";
import { cx } from "../cx.js";

// A discussion with nested replies, rendered by a recursive component.
// 10 top-level comments with 3, 2 and 2 replies per level: 10 + 30 + 60 + 120 comments.

const REPLIES_PER_LEVEL = [3, 2, 2];

let nextId = 0;

function createComments(count, depth, parentId) {
  return Array.from({ length: count }, () => {
    const id = nextId++;
    const user = `user_${id % 37}`;
    return {
      id,
      parentId,
      user,
      avatar: `/avatars/${user}.png`,
      postedAt: new Date(Date.UTC(2026, 0, 1, 0, id)).toISOString(),
      text: `Reply #${id}: "a < b" isn't always true & that's fine.`,
      score: ((id * 7) % 50) - 10,
      replies:
        depth < REPLIES_PER_LEVEL.length
          ? createComments(REPLIES_PER_LEVEL[depth], depth + 1, id)
          : [],
    };
  });
}

const thread = createComments(10, 0, null);

export const COMMENT_COUNT = nextId;

function Comment({ comment, depth }) {
  return (
    <li
      id={`comment-${comment.id}`}
      class={cx("comment", `depth-${depth}`, { negative: comment.score < 0 })}
    >
      <header>
        <img class="avatar" src={comment.avatar} alt="" width={32} height={32} />
        <a href={`/users/${comment.user}`} class="author">
          {comment.user}
        </a>
        <time datetime={comment.postedAt}>{comment.postedAt}</time>
        <span class="score">{comment.score} points</span>
      </header>
      <p>{comment.text}</p>
      <footer>
        <button type="button" data-reply-to={comment.id}>
          Reply
        </button>
        {comment.parentId !== null && <a href={`#comment-${comment.parentId}`}>Parent</a>}
      </footer>
      {comment.replies.length > 0 && (
        <ul class="replies">
          {comment.replies.map((reply) => (
            <Comment comment={reply} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentThread() {
  return (
    <Layout title="Discussion">
      <h1>Discussion</h1>
      <ul class="comments">
        {thread.map((comment) => (
          <Comment comment={comment} depth={0} />
        ))}
      </ul>
    </Layout>
  );
}
