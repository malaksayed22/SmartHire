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

  useEffect(() => {
    // Keep local auth state aligned with server cookies to avoid stale signed-in UI.
    (async () => {
      if (!candidateUser) return;

      try {
        const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim() || "/api";
        const res = await fetch(`${BASE_URL}/candidate/my-applications`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("candidate session is not active");
        }
      } catch {
        setCandidateUser(null);
        localStorage.removeItem("sh_cand_user");
      }
    })();
  }, [candidateUser]);

  const deriveNameFromEmail = (email) => {
    const local = (email || "").split("@")[0];
    return (
      local
        .split(/[._\-+]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ") || "User"
    );
  };

  const loginHR = async (email, password, name) => {
    try {
      const { hrLogin } = await import("../services/api");
      const data = await hrLogin(email, password);
      const n = data.name || name || deriveNameFromEmail(email);
      const initials = n
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      const user = {
        email: data.email || email,
        name: n,
        role: "HR Manager",
        avatar: initials,
        _id: data._id || data.id,
      };
      setHrUser(user);
      localStorage.setItem("sh_hr_user", JSON.stringify(user));
      return true;
    } catch (err) {
      throw err;
    }
  };

  const loginCandidate = async (email, password, name) => {
    try {
      const { candidateLogin } = await import("../services/api");
      const data = await candidateLogin(email, password);
      const n = data.name || name || deriveNameFromEmail(email);
      const initials = n
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      const user = {
        email: data.email || email,
        name: n,
        role: "candidate",
        avatar: initials,
        _id: data._id || data.id,
      };
      setCandidateUser(user);
      localStorage.setItem("sh_cand_user", JSON.stringify(user));
      return true;
    } catch (err) {
      throw err;
    }
  };

  const signupHR = async (name, email, phone, password) => {
    const { hrRegister } = await import("../services/api");
    await hrRegister(name, email, phone, password);
    return loginHR(email, password, name);
  };

  const signupCandidate = async (name, email, phone, password) => {
    const { candidateRegister } = await import("../services/api");
    await candidateRegister(name, email, phone, password);
    return loginCandidate(email, password, name);
  };

  const logoutHR = async () => {
    try {
      const { hrLogout } = await import("../services/api");
      await hrLogout();
    } catch {}
    setHrUser(null);
    localStorage.removeItem("sh_hr_user");
  };

  const logoutCandidate = async () => {
    try {
      const { candidateLogout } = await import("../services/api");
      await candidateLogout();
    } catch {}
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
