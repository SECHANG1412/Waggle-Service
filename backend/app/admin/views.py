from sqladmin import ModelView
from app.db.models import (
    User,
    Topic,
    Comment,
    Reply,
    Vote,
    TopicLike,
    CommentLike,
    ReplyLike,
    Inquiry,
    AdminActionLog,
)


class UserAdmin(ModelView, model=User):
    column_list = [
        User.user_id,
        User.username,
        User.email,
        User.is_admin,
        User.created_at,
    ]
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"


class TopicAdmin(ModelView, model=Topic):
    column_list = [
        Topic.topic_id,
        Topic.title,
        Topic.category,
        Topic.user_id,
        Topic.created_at,
    ]
    name = "Topic"
    name_plural = "Topics"
    icon = "fa-solid fa-comments"


class CommentAdmin(ModelView, model=Comment):
    column_list = [
        Comment.comment_id,
        Comment.topic_id,
        Comment.user_id,
        Comment.content,
        Comment.created_at,
    ]
    name = "Comment"
    name_plural = "Comments"
    icon = "fa-regular fa-comment"


class ReplyAdmin(ModelView, model=Reply):
    column_list = [
        Reply.reply_id,
        Reply.comment_id,
        Reply.user_id,
        Reply.content,
        Reply.created_at,
    ]
    name = "Reply"
    name_plural = "Replies"
    icon = "fa-solid fa-reply"


class VoteAdmin(ModelView, model=Vote):
    column_list = [
        Vote.vote_id,
        Vote.topic_id,
        Vote.user_id,
        Vote.vote_index,
        Vote.created_at,
    ]
    name = "Vote"
    name_plural = "Votes"
    icon = "fa-solid fa-check"


class TopicLikeAdmin(ModelView, model=TopicLike):
    column_list = [TopicLike.like_id, TopicLike.topic_id, TopicLike.user_id]
    name = "Topic Like"
    name_plural = "Topic Likes"
    icon = "fa-solid fa-heart"


class CommentLikeAdmin(ModelView, model=CommentLike):
    column_list = [CommentLike.like_id, CommentLike.comment_id, CommentLike.user_id]
    name = "Comment Like"
    name_plural = "Comment Likes"
    icon = "fa-solid fa-heart"


class ReplyLikeAdmin(ModelView, model=ReplyLike):
    column_list = [ReplyLike.like_id, ReplyLike.reply_id, ReplyLike.user_id]
    name = "Reply Like"
    name_plural = "Reply Likes"
    icon = "fa-solid fa-heart"


class InquiryAdmin(ModelView, model=Inquiry):
    column_list = [
        Inquiry.inquiry_id,
        Inquiry.name,
        Inquiry.email,
        Inquiry.title,
        Inquiry.status,
        Inquiry.created_at,
    ]
    name = "Inquiry"
    name_plural = "Inquiries"
    icon = "fa-solid fa-envelope"


class AdminActionLogAdmin(ModelView, model=AdminActionLog):
    column_list = [
        AdminActionLog.log_id,
        AdminActionLog.admin_user_id,
        AdminActionLog.action,
        AdminActionLog.target_type,
        AdminActionLog.target_id,
        AdminActionLog.reason,
        AdminActionLog.created_at,
    ]
    name = "Admin Action Log"
    name_plural = "Admin Action Logs"
    icon = "fa-solid fa-clipboard-list"
