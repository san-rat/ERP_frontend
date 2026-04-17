import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Rehydrate session
    const token = sessionStorage.getItem("erp_token");
    const storedUser = sessionStorage.getItem("erp_user");
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user", err);
        sessionStorage.removeItem("erp_token");
        sessionStorage.removeItem("erp_user");
      }
    } else if (token) {
        // Fallback or wipe if incomplete state
        sessionStorage.removeItem("erp_token");
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    sessionStorage.setItem("erp_token", userData.token);
    sessionStorage.setItem("erp_user", JSON.stringify(userData));
    setUser(userData);
    
    const role = userData.role?.toUpperCase();
    if (role === "ADMIN") {
      navigate("/admin");
    } else if (role === "EMPLOYEE") {
      navigate("/employee/overview");
    } else if (role === "MANAGER") {
      navigate("/manager/analytics");
    } else {
      navigate("/");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("erp_token");
    sessionStorage.removeItem("erp_user");
    sessionStorage.removeItem("erp_churn_predictions");
    sessionStorage.removeItem("erp_total_customers");
    sessionStorage.removeItem("erp_all_forecasts");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
