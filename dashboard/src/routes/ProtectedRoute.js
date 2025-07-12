// src/components/ProtectedRoute.js
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    axios
      .post("http://localhost:3002/auth", {}, { withCredentials: true })
      .then((res) => {
        setAuth(res.data.status);
      });
  }, []);

  if (auth === null) return <div>Loading...</div>;

  if (!auth) {
    window.location.href = "http://localhost:3001/signup"; 
    return null;
  }

  return children;
};

export default ProtectedRoute;
