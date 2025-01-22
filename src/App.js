// frontend/src/App.js
import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const baseURL = "http://localhost:4000/api"; // Adres Twojego backendu

const App = () => {
    // ------ Stan dotyczący usera (logowanie) ------
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null); // { token, username, userId }
    const [authMode, setAuthMode] = useState("login"); // "login" lub "register"
    const [errorMsg, setErrorMsg] = useState("");

    // ------ Stan dotyczący postów ------
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: "", description: "", image: "" });
    const [sortOption, setSortOption] = useState("latest");
    const fileInputRef = useRef(null);

    // ------ Komu obserwujemy (IDs) ------
    // W tym przykładzie wyciągamy z userów, którzy mają w followers ID naszego usera,
    // ale najprościej: w fetchu /posts i /users zapisywać w state, itd.
    // Dla uproszczenia front w tym przykładzie przechowuje "followedUsers" po stronie klienta
    // Możesz jednak pobrać to z backendu.
    const [followedUsers, setFollowedUsers] = useState([]);

    // Pobierz listę postów (bez tokena – endpoint jest publiczny)
    useEffect(() => {
        fetch(`${baseURL}/posts`)
            .then((response) => response.json())
            .then((data) => {
                setPosts(data);
            })
            .catch((error) => console.error("Error fetching posts:", error));
    }, []);

    // ======= Funkcje logowania / rejestracji =======

    const handleRegister = async () => {
        setErrorMsg("");
        try {
            const res = await fetch(`${baseURL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Błąd rejestracji");
            } else {
                alert("Użytkownik zarejestrowany. Możesz się teraz zalogować!");
                setAuthMode("login");
            }
        } catch (err) {
            setErrorMsg("Błąd połączenia z serwerem");
        }
    };

    const handleLogin = async () => {
        setErrorMsg("");
        try {
            const res = await fetch(`${baseURL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Błąd logowania");
            } else {
                // Ustawiamy stan zalogowanego usera
                setLoggedInUser({ token: data.token, username: data.username, userId: data.userId });
                // Czyścimy formularz
                setUsername("");
                setPassword("");
            }
        } catch (err) {
            setErrorMsg("Błąd połączenia z serwerem");
        }
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        setErrorMsg("");
    };

    // ======= Dodawanie postu =======
    const handleAddPost = async () => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby dodać post");
            return;
        }

        if (!newPost.title || !newPost.description) return;

        try {
            const res = await fetch(`${baseURL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loggedInUser.token}`, // token JWT
                },
                body: JSON.stringify(newPost),
            });
            const data = await res.json();
            if (!res.ok) {
                console.error("Error adding post:", data.error);
            } else {
                setPosts((prevPosts) => [data, ...prevPosts]);
                setNewPost({ title: "", description: "", image: "" });
                if (fileInputRef.current) fileInputRef.current.value = null;
            }
        } catch (error) {
            console.error("Error adding post:", error);
        }
    };

    // ======= Upload obrazka =======
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

    // ======= Lajkowanie posta =======
    const handleLikePost = async (postId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby polubić post");
            return;
        }

        try {
            const res = await fetch(`${baseURL}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${loggedInUser.token}`,
                },
            });
            const updatedPost = await res.json();
            if (!res.ok) {
                console.error("Error liking post:", updatedPost.error);
            } else {
                setPosts((prev) =>
                    prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
                );
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    // ======= Dodawanie komentarzy =======
    const handleAddComment = async (postId, commentBody) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby komentować");
            return;
        }

        if (!commentBody.trim()) return;

        try {
            const res = await fetch(`${baseURL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${loggedInUser.token}`,
                },
                body: JSON.stringify({
                    postId,
                    body: commentBody,
                }),
            });
            const newComment = await res.json();
            if (!res.ok) {
                console.error("Error adding comment:", newComment.error);
            } else {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: [...post.comments, newComment],
                            }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // ======= Follow / Unfollow =======
    const handleFollowUser = async (authorName) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby obserwować");
            return;
        }

        // W tym przykładzie nie mamy w post obiektu "authorId", tylko "author" (nazwa).
        // Musielibyśmy z backendu zwracać authorId. Zakładamy więc, że mamy metodę
        // do pobierania userId po username – w tym przykładzie pominę, bo to wymaga
        // dodatkowego endpointu /api/users?username=...
        //
        // Dla uproszczenia: pseudo-kod do "odgadnięcia" userId
        // => normalnie z backendu powinno to przyjść w polu "authorId".

        // Nie mamy userId? Zatem w tym dema pominę tę część.
        // Zakładamy, że w post w polu "author" zamiast stringu trzymasz obiekt { username, id }
        // i wtedy:
        //
        //   authorId = post.author.id
        //
        // Poniżej "udajemy", że mamy taką metodę:
        // const userToFollowId = getUserIdByUsername(authorName);
        //
        // Zmienię minimalnie Post, żeby przechowywać (post.author, post.authorId).

        alert("W tym przykładowym kodzie musimy mieć authorId, aby go zaobserwować!");
    };

    // ======= Sortowanie postów =======
    const getSortedPosts = () => {
        let sorted = [...posts];
        if (sortOption === "followed") {
            // Filtrowanie po obserwowanych. Uwaga: to wymaga posiadania logicznie:
            // "czy dany authorId jest przez nas followowany?" -> to też musimy mieć z backendu
            // Póki co, w tym przykladzie: sortOption "followed" będzie puste,
            // dopóki nie pobierzemy realnych "followedUsers" z backendu
            sorted = sorted.filter((p) => followedUsers.includes(p.author));
        } else if (sortOption === "latest") {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOption === "popular") {
            sorted.sort((a, b) => b.likes.length - a.likes.length);
        }
        return sorted;
    };

    // ======= RENDER =======
    const sortedPosts = getSortedPosts();

    return (
        <div className="App">
            <h1>Social Media App</h1>

            {/* Panel logowania/rejestracji */}
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
                    <button
                        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    >
                        Przełącz na {authMode === "login" ? "rejestrację" : "logowanie"}
                    </button>
                </div>
            ) : (
                <div className="UserPanel">
                    <p>Zalogowany jako: {loggedInUser.username}</p>
                    <button onClick={handleLogout}>Wyloguj</button>
                </div>
            )}

            {/* Formularz dodawania posta (tylko gdy zalogowany) */}
            {loggedInUser && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleAddPost();
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
                        onChange={(e) =>
                            setNewPost({ ...newPost, description: e.target.value })
                        }
                        required
                    />
                    <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                    <button type="submit">Add Post</button>
                </form>
            )}

            {/* Sortowanie postów */}
            <div className="SortOptions">
                <label>Sort by:</label>
                <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
                    <option value="latest">Latest</option>
                    <option value="popular">Most Liked</option>
                    <option value="followed">Followed Users</option>
                </select>
            </div>

            {/* Lista postów */}
            <div className="PostList">
                {sortedPosts.map((post) => (
                    <Post
                        key={post.id}
                        post={post}
                        loggedInUser={loggedInUser}
                        onLike={() => handleLikePost(post.id)}
                        onFollowUser={handleFollowUser}
                        onAddComment={(commentBody) => handleAddComment(post.id, commentBody)}
                    />
                ))}
            </div>
        </div>
    );
};

// Komponent Post
const Post = ({ post, loggedInUser, onLike, onFollowUser, onAddComment }) => {
    const [commentBody, setCommentBody] = useState("");

    const handleSubmitComment = (e) => {
        e.preventDefault();
        onAddComment(commentBody);
        setCommentBody("");
    };

    return (
        <div className="Post">
            <h2>{post.title}</h2>
            <h4>by {post.author}</h4>
            <p>{post.description}</p>
            {post.image && (
                <img src={post.image} alt="Uploaded content" style={{ maxWidth: "100%" }} />
            )}
            <div>
                <button onClick={onLike}>{post.likes.length > 0 ? "Like/Unlike" : "Like"}</button>
                <span>Likes: {post.likes.length}</span>
            </div>
            <div>
                {/* Przykład pseudo-przycisku do follow - W DEMO nie działa,
            bo potrzebujemy do tego realnego authorId w post (nie samego username)
            i endpointu /api/users/:id/follow */}
                <button onClick={() => onFollowUser(post.author)}>Follow/Unfollow</button>
            </div>

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
    );
};

export default App;
