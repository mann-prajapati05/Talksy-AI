import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../routes/App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../routes/Login.jsx";
import Signup from "../routes/Signup.jsx";
import Home from "../routes/Home.jsx";
import store from "./redux/store.js";
import { Provider } from "react-redux";
import MockHire from "../routes/MockHire.jsx";
import InterviewHistory from "../routes/InterviewHistory.jsx";
import InterviewReport from "../routes/InterviewReport.jsx";
import Pricing from "../routes/Pricing.jsx";
import { bootstrapSessionAuth } from "./utils/authSession";

bootstrapSessionAuth();

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
      {
        path: "/mock-hire",
        element: <MockHire />,
      },
      {
        path: "/interview-history",
        element: <InterviewHistory />,
      },
      {
        path: "/report/:interviewId",
        element: <InterviewReport />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}> </RouterProvider>
    </Provider>
  </StrictMode>,
);
