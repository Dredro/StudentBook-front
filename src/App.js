import React, { useState, useRef, useEffect } from "react"
import "./App.css";


const baseURL = "http://localhost:4000/api"

const App = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loggedInUser, setLoggedInUser] = useState(null)
    const [authMode, setAuthMode] = useState("login")
    const [errorMsg, setErrorMsg] = useState("")
    const [posts, setPosts] = useState([])
    const [newPost, setNewPost] = useState({ title: "", description: "", image: "" })
    const [sortOption, setSortOption] = useState("latest")
    const fileInputRef = useRef(null)

    const fetchPosts = () => {
        const headers = {}
        if (loggedInUser?.token) {
            headers["Authorization"] = `Bearer ${loggedInUser.token}`
        }
        fetch(`${baseURL}/posts`, { headers })
            .then((res) => res.json())
            .then((data) => {
                setPosts(data)
            })
            .catch((err) => console.error("Error fetching posts:", err))
    }

    useEffect(() => {
        fetchPosts()
    }, [loggedInUser])

    const handleRegister = async () => {
        setErrorMsg("")
        try {
            const res = await fetch(`${baseURL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })
            const data = await res.json()
            if (!res.ok) {
                setErrorMsg(data.error || "Błąd rejestracji")
            } else {
                alert("Zarejestrowano! Teraz możesz się zalogować.")
                setAuthMode("login")
            }
        } catch (err) {
            setErrorMsg("Błąd połączenia z serwerem")
        }
    }

    const handleLogin = async () => {
        setErrorMsg("")
        try {
            const res = await fetch(`${baseURL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })
            const data = await res.json()
            if (!res.ok) {
                setErrorMsg(data.error || "Błąd logowania")
            } else {
                setLoggedInUser({ token: data.token, username: data.username, userId: data.userId })
                setUsername("")
                setPassword("")
            }
        } catch (err) {
            setErrorMsg("Błąd połączenia z serwerem")
        }
    }

    const handleLogout = () => {
        setLoggedInUser(null)
        setErrorMsg("")
    }

    const handleAddPost = async () => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby dodać post")
            return
        }
        if (!newPost.title || !newPost.description) return
        try {
            const res = await fetch(`${baseURL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loggedInUser.token}`
                },
                body: JSON.stringify(newPost)
            })
            const data = await res.json()
            if (!res.ok) {
                console.error("Error adding post:", data.error)
            } else {
                setPosts((prev) => [data, ...prev])
                setNewPost({ title: "", description: "", image: "" })
                if (fileInputRef.current) fileInputRef.current.value = null
            }
        } catch (err) {
            console.error("Error adding post:", err)
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewPost((prev) => ({ ...prev, image: reader.result }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleLikePost = async (postId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby polubić post")
            return
        }
        try {
            const res = await fetch(`${baseURL}/posts/${postId}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${loggedInUser.token}` }
            })
            const updatedPost = await res.json()
            if (!res.ok) {
                console.error("Error liking post:", updatedPost.error)
            } else {
                setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
            }
        } catch (err) {
            console.error("Error liking post:", err)
        }
    }

    const handleAddComment = async (postId, commentBody) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby komentować")
            return
        }
        if (!commentBody.trim()) return
        try {
            const res = await fetch(`${baseURL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loggedInUser.token}`
                },
                body: JSON.stringify({ postId, body: commentBody })
            })
            const newComment = await res.json()
            if (!res.ok) {
                console.error("Error adding comment:", newComment.error)
            } else {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? { ...post, comments: [...post.comments, newComment] }
                            : post
                    )
                )
            }
        } catch (err) {
            console.error("Error adding comment:", err)
        }
    }

    const handleFollowAuthor = async (authorId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby followować")
            return
        }
        try {
            const res = await fetch(`${baseURL}/users/${authorId}/follow`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${loggedInUser.token}`
                }
            })
            const data = await res.json()
            if (!res.ok) {
                console.error("Error following/unfollowing user:", data.error)
            } else {
                fetchPosts()
            }
        } catch (err) {
            console.error("Error following user:", err)
        }
    }

    const handleEditPost = async (postId, updatedData) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby edytować post")
            return
        }
        try {
            const res = await fetch(`${baseURL}/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loggedInUser.token}`
                },
                body: JSON.stringify(updatedData)
            })
            const updatedPost = await res.json()
            if (!res.ok) {
                console.error("Błąd edycji posta:", updatedPost.error)
                return
            }
            setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
        } catch (err) {
            console.error("Błąd połączenia podczas edycji posta:", err)
        }
    }

    const getSortedPosts = () => {
        let sorted = [...posts]
        if (sortOption === "followed") {
            sorted = sorted.filter((p) => p.isFollowingAuthor)
        } else if (sortOption === "latest") {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        } else if (sortOption === "popular") {
            sorted.sort((a, b) => b.likesCount - a.likesCount)
        }
        return sorted
    }

    const sortedPosts = getSortedPosts()

    return (
        <div className="App">
            <h1>Social Media App</h1>
            {!loggedInUser ? (
                <div className="AuthPanel">
                    <h2>{authMode === "login" ? "Zaloguj się" : "Zarejestruj się"}</h2>
                    {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
                    <input
                        type="text"
                        placeholder="Nazwa użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {authMode === "login" ? (
                        <button onClick={handleLogin}>Zaloguj</button>
                    ) : (
                        <button onClick={handleRegister}>Zarejestruj</button>
                    )}
                    <button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
                        Przełącz na {authMode === "login" ? "rejestrację" : "logowanie"}
                    </button>
                </div>
            ) : (
                <div className="UserPanel">
                    <p>Zalogowany jako: {loggedInUser.username}</p>
                    <button onClick={handleLogout}>Wyloguj</button>
                </div>
            )}
            {loggedInUser && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleAddPost()
                    }}
                    className="PostForm"
                >
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
                    />
                    <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                    <button type="submit">Add Post</button>
                </form>
            )}
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
                        key={post.id}
                        post={post}
                        loggedInUser={loggedInUser}
                        onLike={() => handleLikePost(post.id)}
                        onAddComment={(commentBody) => handleAddComment(post.id, commentBody)}
                        onFollowAuthor={() => handleFollowAuthor(post.authorId)}
                        onEditPost={handleEditPost}
                    />
                ))}
            </div>
        </div>
    )
}

const Post = ({ post, loggedInUser, onLike, onAddComment, onFollowAuthor, onEditPost }) => {
    const [commentBody, setCommentBody] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(post.title)
    const [editDescription, setEditDescription] = useState(post.description)
    const [editImage, setEditImage] = useState(post.image)

    const handleSubmitComment = (e) => {
        e.preventDefault()
        onAddComment(commentBody)
        setCommentBody("")
    }

    const handleStartEditing = () => {
        setEditTitle(post.title)
        setEditDescription(post.description)
        setEditImage(post.image)
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
    }

    const handleSaveEdit = () => {
        onEditPost(post.id, {
            title: editTitle,
            description: editDescription,
            image: editImage
        })
        setIsEditing(false)
    }

    const handleChangeImage = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setEditImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

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
                    {editImage && <img src={editImage} alt="Uploaded" style={{ maxWidth: "100%" }} />}
                    <input type="file" accept="image/*" onChange={handleChangeImage} />
                    <button onClick={handleSaveEdit}>Zapisz</button>
                    <button onClick={handleCancelEditing}>Anuluj</button>
                </div>
            ) : (
                <>
                    <h2>{post.title}</h2>
                    <h4>by {post.author}</h4>
                    <p>{post.description}</p>
                    {post.image && <img src={post.image} alt="Uploaded" style={{ maxWidth: "100%" }} />}
                </>
            )}
            <div>
                <button onClick={onLike}>{post.likesCount > 0 ? "Like/Unlike" : "Like"}</button>
                <span>Likes: {post.likesCount}</span>
            </div>
            {loggedInUser && post.authorId && post.authorId !== loggedInUser.userId && (
                <div>
                    <button onClick={onFollowAuthor}>{post.isFollowingAuthor ? "Unfollow" : "Follow"}</button>
                </div>
            )}
            {loggedInUser && post.authorId === loggedInUser.userId && !isEditing && (
                <button onClick={handleStartEditing}>Edit</button>
            )}
            <div className="Comments">
                <h3>Comments</h3>
                <ul>
                    {post.comments.map((comment, index) => (
                        <li key={index}>
                            <strong>{comment.userName || "Anonim"}</strong>: {comment.body}
                        </li>
                    ))}
                </ul>
                {loggedInUser && (
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
                )}
            </div>
        </div>
    )
}

export default App
