import React, { useRef } from "react";

const PostForm = ({ newPost, setNewPost, onAddPost }) => {
    const fileInputRef = useRef(null);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddPost();
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    return (
        <form onSubmit={handleSubmit} className="PostForm">
            <h2>Dodaj nowy post</h2>
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
            <button className="PrimaryButton" type="submit">
                Dodaj post
            </button>
        </form>
    );
};

export default PostForm;
