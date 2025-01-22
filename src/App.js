import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const baseURL = "https://jsapi.vectorgamedev.com/api"; // API base URL

const App = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ author: "", title: "", description: "", image: "" });
    const [sortOption, setSortOption] = useState("latest");
    const [followedUsers, setFollowedUsers] = useState([]);
    const fileInputRef = useRef(null);

    // Fetch posts from the backend
    useEffect(() => {
        fetch(`${baseURL}/posts`)
            .then((response) => response.json())
            .then((data) => setPosts(data))
            .catch((error) => console.error("Error fetching posts:", error));
    }, []);

    const getSortedPosts = () => {
        let sortedPosts = [...posts];
        if (sortOption === "followed") {
            sortedPosts = sortedPosts.filter((post) => followedUsers.includes(post.author));
        } else if (sortOption === "latest") {
            sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOption === "popular") {
            sortedPosts.sort((a, b) => b.likes - a.likes);
        }
        return sortedPosts;
    };

    const handleAddPost = () => {
        if (!newPost.author || !newPost.title || !newPost.description) return;

        const postData = { ...newPost, image: newPost.image || "" };

        fetch(`${baseURL}/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData),
        })
            .then((response) => response.json())
            .then((data) => {
                setPosts((prevPosts) => [data, ...prevPosts]);
                setNewPost({ author: "", title: "", description: "", image: "" });
                if (fileInputRef.current) fileInputRef.current.value = null;
            })
            .catch((error) => console.error("Error adding post:", error));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPost((prev) => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLikePost = (postId) => {
        fetch(`${baseURL}/posts/${postId}/like`, { method: "POST" })
            .then((response) => response.json())
            .then((updatedPost) => {
                setPosts((prevPosts) =>
                    prevPosts.map((post) => (post._id === postId ? updatedPost : post))
                );
            })
            .catch((error) => console.error("Error liking post:", error));
    };

    const handleAddComment = (postId, commentBody) => {
        if (!commentBody.trim()) return;

        const commentData = { postId, userName: "Anonymous", body: commentBody };

        fetch(`${baseURL}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentData),
        })
            .then((response) => response.json())
            .then((newComment) => {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === postId
                            ? { ...post, comments: [...post.comments, newComment] }
                            : post
                    )
                );
            })
            .catch((error) => console.error("Error adding comment:", error));
    };

    const handleFollowUser = (author) => {
        setFollowedUsers((prev) =>
            prev.includes(author) ? prev.filter((user) => user !== author) : [...prev, author]
        );
    };

    const sortedPosts = getSortedPosts();

    return (
        <div className="App">
            <h1>Social Media App</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddPost();
                }}
                className="PostForm"
            >
                <input
                    type="text"
                    placeholder="Author"
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Post Title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Post Description"
                    value={newPost.description}
                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                    required
                ></textarea>
                <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                <button type="submit">Add Post</button>
            </form>

            <div className="SortOptions">
                <label>Sort by:</label>
                <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                    <option value="latest">Latest</option>
                    <option value="popular">Most Liked</option>
                    <option value="followed">Followed Users</option>
                </select>
            </div>

            <div className="PostList">
                {sortedPosts.map((post) => (
                    <Post
                        key={post._id}
                        post={post}
                        followedUsers={followedUsers}
                        onLike={() => handleLikePost(post._id)}
                        onFollow={() => handleFollowUser(post.author)}
                        onAddComment={(commentBody) => handleAddComment(post._id, commentBody)}
                    />
                ))}
            </div>
        </div>
    );
};

const Post = ({ post, followedUsers, onLike, onFollow, onAddComment }) => {
    const [commentBody, setCommentBody] = useState("");

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (commentBody.trim()) {
            onAddComment(commentBody);
            setCommentBody("");
        }
    };

    return (
        <div className="Post">
            <h2>{post.title}</h2>
            <h4>by {post.author}</h4>
            <p>{post.description}</p>
            {post.image && <img src={post.image} alt="Uploaded content" style={{ maxWidth: "100%" }} />}
            <button onClick={onLike}>Like</button>
            <span>Likes: {post.likes}</span>
            <button onClick={onFollow}>
                {followedUsers.includes(post.author) ? "Unfollow" : "Follow"}
            </button>

            <div className="Comments">
                <h3>Comments</h3>
                <ul>
                    {post.comments.map((comment, index) => (
                        <li key={index}>
                            <strong>{comment.userName}</strong>: {comment.body}
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleSubmitComment} className="CommentForm">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        required
                    />
                    <button type="submit">Add Comment</button>
                </form>
            </div>
        </div>
    );
};

export default App;
