import React from "react";

const UserPanel = ({ username, onLogout }) => {
    return (
        <div className="UserPanel">
            <p>
                Zalogowany jako: <strong>{username}</strong>
            </p>
            <button className="LogoutButton" onClick={onLogout}>
                Wyloguj
            </button>
        </div>
    );
};

export default UserPanel;
