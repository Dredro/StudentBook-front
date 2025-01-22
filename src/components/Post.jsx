import React, { useState } from "react";

const Post = ({ post, loggedInUser, onLike, onAddComment, onFollowAuthor, onEditPost }) => {
    const [commentBody, setCommentBody] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editDescription, setEditDescription] = useState(post.description);
    const [editImage, setEditImage] = useState(post.image);

    const handleSubmitComment = (e) => {
        e.preventDefault();
        onAddComment(commentBody);
        setCommentBody("");
    };

    const handleStartEditing = () => {
        setEditTitle(post.title);
        setEditDescription(post.description);
        setEditImage(post.image);
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        onEditPost(post.id, {
            title: editTitle,
            description: editDescription,
            image: editImage,
        });
        setIsEditing(false);
    };

    const handleChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="Post">
            {isEditing ? (
                <div className="EditPostForm">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                    />
                    {editImage && <img src={editImage} alt="Uploaded" className="PostImage" />}
                    <input type="file" accept="image/*" onChange={handleChangeImage} />
                    <div className="EditPostActions">
                        <button className="PrimaryButton" onClick={handleSaveEdit}>
                            Zapisz
                        </button>
                        <button className="CancelButton" onClick={handleCancelEditing}>
                            Anuluj
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <h2>{post.title}</h2>
                    <h4>by {post.author}</h4>
                    <p>{post.description}</p>
                    {post.image && <img src={post.image} alt="Uploaded" className="PostImage" />}
                </>
            )}

            <div className="PostActions">
                <button className="LikeButton" onClick={onLike}>
                    {post.likesCount > 0 ? "Like/Unlike" : "Like"}
                </button>
                <span className="LikeCount">Lajki: {post.likesCount}</span>

                {loggedInUser && post.authorId && post.authorId !== loggedInUser.userId && (
                    <button className="FollowButton" onClick={onFollowAuthor}>
                        {post.isFollowingAuthor ? "Unfollow" : "Follow"}
                    </button>
                )}

                {loggedInUser && post.authorId === loggedInUser.userId && !isEditing && (
                    <button className="EditButton" onClick={handleStartEditing}>
                        Edit
                    </button>
                )}
            </div>

            <div className="Comments">
                <h3>Komentarze</h3>
                <ul>
                    {post.comments.map((comment, index) => (
                        <li key={index}>
                            <strong>{comment.userName || "Anonim"}:</strong> {comment.body}
                        </li>
                    ))}
                </ul>

                {loggedInUser && (
                    <form onSubmit={handleSubmitComment} className="CommentForm">
                        <input
                            type="text"
                            placeholder="Dodaj komentarz..."
                            value={commentBody}
                            onChange={(e) => setCommentBody(e.target.value)}
                            required
                        />
                        <button className="PrimaryButton" type="submit">
                            Dodaj
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Post;
