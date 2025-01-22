const baseURL = "http://localhost:4000/api";

// Pomocnicza funkcja do pobrania nagłówków z tokenem
const getAuthHeaders = (token) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const fetchAllPosts = async (token) => {
    const headers = token ? getAuthHeaders(token) : {};
    const res = await fetch(`${baseURL}/posts`, { headers });
    if (!res.ok) {
        throw new Error("Błąd pobierania postów");
    }
    return res.json();
};

export const addPost = async (postData, token) => {
    const res = await fetch(`${baseURL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
        },
        body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd dodawania posta");
    }
    return data;
};

export const likePost = async (postId, token) => {
    const res = await fetch(`${baseURL}/posts/${postId}/like`, {
        method: "POST",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd lajkowania posta");
    }
    return data;
};

export const addComment = async (postId, commentBody, token) => {
    const res = await fetch(`${baseURL}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
        },
        body: JSON.stringify({ postId, body: commentBody }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd dodawania komentarza");
    }
    return data;
};

export const followAuthor = async (authorId, token) => {
    const res = await fetch(`${baseURL}/users/${authorId}/follow`, {
        method: "POST",
        headers: getAuthHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd obserwowania użytkownika");
    }
    return data;
};

export const editPost = async (postId, updatedData, token) => {
    const res = await fetch(`${baseURL}/posts/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
        },
        body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd edycji posta");
    }
    return data;
};
