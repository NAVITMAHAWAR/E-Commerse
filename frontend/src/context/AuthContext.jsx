import { createContext, useContext, useState, Children } from "react";

import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userInfo")) || null,
  );

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUser(data);
  };

  const register = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
  };

  const logOut = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const forgetPassword = async (email) => {
    await api.post("/auth/forgot-password", { email });
  };

  const resetPassword = async (token, password) => {
    await api.post(`/auth/reset-password/${token}`, { password });
  };


  const loginWithGoogle = async (idToken) => {
  const { data } = await api.post("/auth/google", { idToken });
  localStorage.setItem("userInfo", JSON.stringify(data));
  setUser(data);
  return data;   // frontend ko return kar rahe hain
};
  return (
    <AuthContext.Provider
      value={{ user, login, register, logOut, forgetPassword, resetPassword, loginWithGoogle}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
