from __future__ import annotations

from collections.abc import Sequence

import pytest

from app.perf import build_explain_rows, clear_captured_stats
from tests.factories import (
    create_comment,
    create_reply,
    create_topic,
    create_topic_like,
    create_user,
    create_vote,
)


def _format_plan(plan: Sequence[dict]) -> str:
    fragments: list[str] = []
    for row in plan:
        if "detail" in row:
            fragments.append(str(row["detail"]))
        elif "EXPLAIN" in row:
            fragments.append(str(row["EXPLAIN"]))
        else:
            fragments.append(", ".join(f"{key}={value}" for key, value in row.items()))
    return " | ".join(fragments)


def _markdown_table(rows: list[dict]) -> str:
    header = "| endpoint | query_count | query_time_ms | response_time_ms | unique_selects |"
    separator = "| --- | ---: | ---: | ---: | ---: |"
    body = [
        f"| {row['endpoint']} | {row['query_count']} | {row['query_time_ms']:.3f} | {row['response_time_ms']:.3f} | {row['unique_selects']} |"
        for row in rows
    ]
    return "\n".join([header, separator, *body])


@pytest.mark.asyncio
async def test_topic_and_comment_read_perf_baseline(
    authenticated_client,
    db_session,
    auth_user,
):
    clear_captured_stats()

    topic = await create_topic(db_session, user_id=auth_user.user_id, title="perf-target")
    commenters = [await create_user(db_session) for _ in range(3)]
    voters = [await create_user(db_session) for _ in range(4)]
    likers = [await create_user(db_session) for _ in range(4)]

    await create_vote(db_session, user_id=auth_user.user_id, topic_id=topic.topic_id, vote_index=0)
    for idx, voter in enumerate(voters):
        await create_vote(db_session, user_id=voter.user_id, topic_id=topic.topic_id, vote_index=idx % 2)

    for liker in likers[:3]:
        await create_topic_like(db_session, user_id=liker.user_id, topic_id=topic.topic_id)

    comments = []
    for idx, commenter in enumerate(commenters):
        comment = await create_comment(
            db_session,
            user_id=commenter.user_id,
            topic_id=topic.topic_id,
            content=f"comment-{idx}",
        )
        comments.append(comment)

    await create_reply(
        db_session,
        user_id=auth_user.user_id,
        comment_id=comments[0].comment_id,
        content="reply-root",
    )
    child = await create_reply(
        db_session,
        user_id=commenters[1].user_id,
        comment_id=comments[0].comment_id,
        content="reply-child",
    )
    await create_reply(
        db_session,
        user_id=commenters[2].user_id,
        comment_id=comments[0].comment_id,
        content="reply-nested",
        parent_reply_id=child.reply_id,
    )
    await create_reply(
        db_session,
        user_id=auth_user.user_id,
        comment_id=comments[1].comment_id,
        content="reply-second-comment",
    )
    await db_session.commit()

    topic_response = await authenticated_client.get(
        f"/topics/{topic.topic_id}",
        headers={"X-Perf-Debug": "1"},
    )
    comments_response = await authenticated_client.get(
        f"/comments/by-topic/{topic.topic_id}",
        headers={"X-Perf-Debug": "1"},
    )

    assert topic_response.status_code == 200
    assert comments_response.status_code == 200

    topic_trace_id = topic_response.headers["X-Perf-Trace-Id"]
    comments_trace_id = comments_response.headers["X-Perf-Trace-Id"]
    topic_explain = await build_explain_rows(db_session, topic_trace_id)
    comments_explain = await build_explain_rows(db_session, comments_trace_id)

    baseline_rows = [
        {
            "endpoint": f"/topics/{topic.topic_id}",
            "query_count": int(topic_response.headers["X-Perf-Query-Count"]),
            "query_time_ms": float(topic_response.headers["X-Perf-Query-Time-Ms"]),
            "response_time_ms": float(topic_response.headers["X-Perf-Response-Time-Ms"]),
            "unique_selects": len(topic_explain),
        },
        {
            "endpoint": f"/comments/by-topic/{topic.topic_id}",
            "query_count": int(comments_response.headers["X-Perf-Query-Count"]),
            "query_time_ms": float(comments_response.headers["X-Perf-Query-Time-Ms"]),
            "response_time_ms": float(comments_response.headers["X-Perf-Response-Time-Ms"]),
            "unique_selects": len(comments_explain),
        },
    ]

    print()
    print(_markdown_table(baseline_rows))
    print()
    print("[EXPLAIN] /topics/{topic_id}")
    for row in topic_explain:
        print(f"- {row['sql']}")
        print(f"  {_format_plan(row['plan'])}")
    print("[EXPLAIN] /comments/by-topic/{topic_id}")
    for row in comments_explain:
        print(f"- {row['sql']}")
        print(f"  {_format_plan(row['plan'])}")
    assert baseline_rows[0]["query_count"] > 0
    assert baseline_rows[1]["query_count"] > 0
    assert len(topic_explain) > 0
    assert len(comments_explain) > 0
