import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  // Pour dev, tu peux stocker le token ici
  const token = localStorage.getItem("spotify_access_token") || "";

  return (
   <div>
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard token={token} />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
};

export default App;
