import React from "react";
import Post from "./Post";

const PostList = ({
                      posts,
                      loggedInUser,
                      onLikePost,
                      onAddComment,
                      onFollowAuthor,
                      onEditPost,
                  }) => {
    return (
        <div className="PostList">
            {posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    loggedInUser={loggedInUser}
                    onLike={() => onLikePost(post.id)}
                    onAddComment={(commentBody) => onAddComment(post.id, commentBody)}
                    onFollowAuthor={() => onFollowAuthor(post.authorId)}
                    onEditPost={onEditPost}
                />
            ))}
        </div>
    );
};

export default PostList;
