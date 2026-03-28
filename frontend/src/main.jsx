import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../routes/App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../routes/Login.jsx";
import Signup from "../routes/Signup.jsx";
import Home from "../routes/Home.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}> </RouterProvider>
  </StrictMode>,
);
