import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./styles/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
       <Toaster  position="top-center"
      richColors
      expand
      duration={3000}
      visibleToasts={5}
      theme="system" toastOptions={{ className: "z-[99999]" }} />
    </BrowserRouter>
  </React.StrictMode>
);
