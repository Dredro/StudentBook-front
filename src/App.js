import React, { useState, useRef } from "react";
import './App.css'
const App = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ author: "", title: "", description: "", image: "" });
    const [sortOption, setSortOption] = useState("latest");
    const [followedUsers, setFollowedUsers] = useState([]); // Lista obserwowanych użytkowników
    const [displayedPosts, setDisplayedPosts] = useState([]); // Posty wyświetlane na ekranie
    const fileInputRef = useRef(null);

    // Mock data for demonstration
    const mockPosts = [
        {
            id: 1,
            author: "John Doe",
            title: "Welcome to my blog",
            description: "Hello, world!",
            image: "",
            likes: 5,
            comments: [],
        },
        {
            id: 2,
            author: "Jane Smith",
            title: "Learning React",
            description: "React is amazing!",
            image: "",
            likes: 8,
            comments: [],
        },
    ];

    // Load mock posts
    React.useEffect(() => {
        setPosts(mockPosts);
        setDisplayedPosts(mockPosts); // Inicjalizacja wyświetlanych postów
    }, []);

    // Add a new post
    const handleAddPost = () => {
        const newPostData = { ...newPost, id: posts.length + 1, likes: 0, comments: [] };
        const updatedPosts = [newPostData, ...posts];
        setPosts(updatedPosts);
        setDisplayedPosts(updatedPosts);
        setNewPost({ author: "", title: "", description: "", image: "" });

        // Reset input pliku
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    // Handle image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPost((prevPost) => ({ ...prevPost, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Add a like to a post
    const handleLikePost = (postId) => {
        const updatedPosts = posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
        );
        setPosts(updatedPosts);
        setDisplayedPosts(updatedPosts);
    };

    // Add a comment to a post
    const handleAddComment = (postId, commentBody) => {
        const updatedPosts = posts.map((post) => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: [...post.comments, { userName: "Anonymous", body: commentBody, likes: 0 }],
                };
            }
            return post;
        });
        setPosts(updatedPosts);
        setDisplayedPosts(updatedPosts);
    };

    // Follow/unfollow a user
    const handleFollowUser = (author) => {
        setFollowedUsers((prevFollowed) =>
            prevFollowed.includes(author)
                ? prevFollowed.filter((user) => user !== author) // Unfollow
                : [...prevFollowed, author] // Follow
        );
    };

    // Sort posts on demand
    const handleSortChange = (newSortOption) => {
        setSortOption(newSortOption);
        let sortedPosts = [...posts];

        if (newSortOption === "followed") {
            sortedPosts = sortedPosts.filter((post) => followedUsers.includes(post.author));
        } else if (newSortOption === "latest") {
            sortedPosts.sort((a, b) => b.id - a.id);
        } else if (newSortOption === "popular") {
            sortedPosts.sort((a, b) => b.likes - a.likes);
        }

        setDisplayedPosts(sortedPosts);
    };

    return (
        <div className="App">
            <h1>Social Media App</h1>

            {/* Add Post Form */}
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
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef} // Referencja do inputu
                />
                <button type="submit">Add Post</button>
            </form>

            {/* Sort Options */}
            <div className="SortOptions">
                <label>Sort by:</label>
                <select
                    onChange={(e) => handleSortChange(e.target.value)}
                    value={sortOption}
                >
                    <option value="latest">Latest</option>
                    <option value="popular">Most Liked</option>
                    <option value="followed">Followed Users</option>
                </select>
            </div>

            {/* Post List */}
            <div className="PostList">
                {displayedPosts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        followedUsers={followedUsers}
                        onLike={() => handleLikePost(post.id)}
                        onFollow={() => handleFollowUser(post.author)}
                        onAddComment={(commentBody) => handleAddComment(post.id, commentBody)}
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

            {/* Comments */}
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
