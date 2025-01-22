const baseURL = "http://localhost:4000/api";

export const registerUser = async (username, password) => {
    const res = await fetch(`${baseURL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd rejestracji");
    }
    return data;
};

export const loginUser = async (username, password) => {
    const res = await fetch(`${baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Błąd logowania");
    }
    return data;
};
