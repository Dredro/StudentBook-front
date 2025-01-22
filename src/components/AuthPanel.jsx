import React from "react";

const AuthPanel = ({
                       authMode,
                       errorMsg,
                       username,
                       password,
                       onChangeUsername,
                       onChangePassword,
                       onSwitchMode,
                       onLogin,
                       onRegister,
                   }) => {
    return (
        <div className="AuthPanel">
            <h2>{authMode === "login" ? "Zaloguj się" : "Zarejestruj się"}</h2>
            {errorMsg && <p className="ErrorMsg">{errorMsg}</p>}
            <input
                type="text"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(e) => onChangeUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
            />
            {authMode === "login" ? (
                <button className="PrimaryButton" onClick={onLogin}>
                    Zaloguj
                </button>
            ) : (
                <button className="PrimaryButton" onClick={onRegister}>
                    Zarejestruj
                </button>
            )}
            <button className="SwitchButton" onClick={onSwitchMode}>
                {authMode === "login" ? "Przełącz na rejestrację" : "Przełącz na logowanie"}
            </button>
        </div>
    );
};

export default AuthPanel;
