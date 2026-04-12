import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [hrUser, setHrUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sh_hr_user"));
    } catch {
      return null;
    }
  });
  const [candidateUser, setCandidateUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sh_cand_user"));
    } catch {
      return null;
    }
  });

  const deriveNameFromEmail = (email) => {
    const local = (email || "").split("@")[0];
    return (
      local
        .split(/[._\-+]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ") || "User"
    );
  };

  const loginHR = (email, password, name) => {
    const n = name && name.trim() ? name.trim() : deriveNameFromEmail(email);
    const initials = n
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    const user = { email, name: n, role: "HR Manager", avatar: initials };
    setHrUser(user);
    localStorage.setItem("sh_hr_user", JSON.stringify(user));
    return true;
  };

  const loginCandidate = (email, password, name) => {
    const n = name && name.trim() ? name.trim() : deriveNameFromEmail(email);
    const initials = n
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    const user = { email, name: n, role: "candidate", avatar: initials };
    setCandidateUser(user);
    localStorage.setItem("sh_cand_user", JSON.stringify(user));
    return true;
  };

  const signupHR = (name, email, password) => loginHR(email, password, name);
  const signupCandidate = (name, email, password) =>
    loginCandidate(email, password, name);

  const logoutHR = () => {
    setHrUser(null);
    localStorage.removeItem("sh_hr_user");
  };

  const logoutCandidate = () => {
    setCandidateUser(null);
    localStorage.removeItem("sh_cand_user");
  };

  return (
    <AuthContext.Provider
      value={{
        hrUser,
        candidateUser,
        loginHR,
        loginCandidate,
        signupHR,
        signupCandidate,
        logoutHR,
        logoutCandidate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
