import { createContext, useEffect, useState } from "react";

export const routeContext = createContext();

function RouteGuardContent({ children }) {
  const [role, setRole] = useState(null);
  const [authorisedUser, setAuthorisedUser] = useState(false);

  const syncFromSession = () => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");

    if (token && userData) {
      const user = JSON.parse(userData);
      setAuthorisedUser(true);
      setRole(user.role);
    } else {
      setAuthorisedUser(false);
      setRole(null);
    }
  };

  useEffect(() => {
    syncFromSession();
    window.addEventListener("session-updated", syncFromSession);
    return () => window.removeEventListener("session-updated", syncFromSession);
  }, []);

  return (
    <routeContext.Provider value={{ role, setRole, authorisedUser, setAuthorisedUser }}>
      {children}
    </routeContext.Provider>
  );
}

export default RouteGuardContent;