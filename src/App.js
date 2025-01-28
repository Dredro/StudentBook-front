import React, { useState, useEffect } from "react";
import {
    fetchAllPosts,
    addPost,
    likePost,
    addComment,
    followAuthor,
    editPost,
    deletePost, // Importowana funkcja usuwania
} from "./services/postService";
import { registerUser, loginUser } from "./services/authService";

import AuthPanel from "./components/AuthPanel";
import UserPanel from "./components/UserPanel";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import SortOptions from "./components/SortOptions";

import "./App.css";

const App = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [errorMsg, setErrorMsg] = useState("");

    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: "", description: "", image: "" });
    const [sortOption, setSortOption] = useState("latest");

    const fetchPosts = async () => {
        try {
            const token = loggedInUser?.token || null;
            const data = await fetchAllPosts(token);
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts:", err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [loggedInUser]);

    const handleRegister = async () => {
        setErrorMsg("");
        try {
            await registerUser(username, password);
            alert("Zarejestrowano! Teraz możesz się zalogować.");
            setAuthMode("login");
        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    const handleLogin = async () => {
        setErrorMsg("");
        try {
            const data = await loginUser(username, password);
            setLoggedInUser({
                token: data.token,
                username: data.username,
                userId: data.userId,
            });
            setUsername("");
            setPassword("");
        } catch (err) {
            setErrorMsg(err.message);
        }
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        setErrorMsg("");
    };

    const handleAddPost = async () => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby dodać post");
            return;
        }
        if (!newPost.title || !newPost.description) return;
        try {
            const createdPost = await addPost(newPost, loggedInUser.token);
            setPosts((prev) => [createdPost, ...prev]);
            setNewPost({ title: "", description: "", image: "" });
        } catch (err) {
            console.error("Error adding post:", err);
        }
    };

    const handleLikePost = async (postId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby polubić post");
            return;
        }
        try {
            const updatedPost = await likePost(postId, loggedInUser.token);
            setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    const handleAddComment = async (postId, commentBody) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby komentować");
            return;
        }
        if (!commentBody.trim()) return;
        try {
            const newComment = await addComment(postId, commentBody, loggedInUser.token);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? { ...post, comments: [...post.comments, newComment] }
                        : post
                )
            );
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    const handleFollowAuthor = async (authorId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby followować");
            return;
        }
        try {
            await followAuthor(authorId, loggedInUser.token);
            fetchPosts(); // Re-fetch posts to update follow status
        } catch (err) {
            console.error("Error following user:", err);
        }
    };

    const handleEditPost = async (postId, updatedData) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby edytować post");
            return;
        }
        try {
            const updatedPost = await editPost(postId, updatedData, loggedInUser.token);
            setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
        } catch (err) {
            console.error("Błąd edycji posta:", err);
        }
    };

    // Nowa funkcja do obsługi usuwania posta
    const handleDeletePost = async (postId) => {
        if (!loggedInUser) {
            alert("Musisz być zalogowany, aby usunąć post");
            return;
        }
        try {
            await deletePost(postId, loggedInUser.token);
            setPosts((prev) => prev.filter((post) => post.id !== postId));
        } catch (err) {
            console.error("Błąd podczas usuwania posta:", err);
            alert("Nie udało się usunąć posta.");
        }
    };

    const getSortedPosts = () => {
        let sorted = [...posts];
        if (sortOption === "followed") {
            sorted = sorted.filter((p) => p.isFollowingAuthor);
        } else if (sortOption === "latest") {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOption === "popular") {
            sorted.sort((a, b) => b.likesCount - a.likesCount);
        }
        return sorted;
    };

    const sortedPosts = getSortedPosts();

    return (
        <div className="App">
            <h1>Social Media App</h1>

            {!loggedInUser ? (
                <AuthPanel
                    authMode={authMode}
                    errorMsg={errorMsg}
                    username={username}
                    password={password}
                    onChangeUsername={setUsername}
                    onChangePassword={setPassword}
                    onSwitchMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                />
            ) : (
                <UserPanel username={loggedInUser.username} onLogout={handleLogout} />
            )}

            {loggedInUser && (
                <PostForm
                    newPost={newPost}
                    setNewPost={setNewPost}
                    onAddPost={handleAddPost}
                />
            )}

            <SortOptions sortOption={sortOption} onChangeSort={setSortOption} />

            <PostList
                posts={sortedPosts}
                loggedInUser={loggedInUser}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onFollowAuthor={handleFollowAuthor}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost} // Przekazujemy funkcję usuwania
            />
        </div>
    );
};

export default App;
