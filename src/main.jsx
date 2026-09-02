import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId="969345472140-hqaa8cc8pt7dgbomirgt6f8ot5ncn4s2.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
