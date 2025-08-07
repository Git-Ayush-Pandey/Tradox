import { useEffect, useState } from "react";
import { verifyToken } from "../hooks/api";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null); 

  useEffect(() => {
    verifyToken()
      .then((res) => {
        setAuth(res.data.status);
      })
      .catch((err) => {
        console.error("Verification failed:", err);
        setAuth(false);
      });
  }, []);

  if (auth === null) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  if (!auth) {
    window.location.href = "http://localhost:3001/signup";
    return null;
  }

  return children;
};

export default ProtectedRoute;
