import { useState } from "react";
import LoginPage    from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoadingPage  from "./pages/LoadingPage.jsx";
import HomePage     from "./pages/HomePage.jsx";

// screen: "login" | "register" | "loading" | "home"
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user,   setUser]   = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen("loading");
    setTimeout(() => setScreen("home"), 2400);
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("login");
  };

  if (screen === "loading")  return <LoadingPage />;
  if (screen === "home")     return <HomePage user={user} onLogout={handleLogout} />;
  if (screen === "register") return (
    <RegisterPage
      onRegistered={() => setScreen("login")}
      onBackToLogin={() => setScreen("login")}
    />
  );
  return (
    <LoginPage
      onLogin={handleLogin}
      onRegister={() => setScreen("register")}
    />
  );
}