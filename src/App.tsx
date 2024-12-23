import { RouterProvider } from "react-router-dom";
import { router } from "./App.routes";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;