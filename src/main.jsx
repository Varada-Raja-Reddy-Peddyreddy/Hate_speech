import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../echo_platform.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
