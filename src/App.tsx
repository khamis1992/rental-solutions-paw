import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./App.routes";
import { Toaster } from "@/components/ui/toaster";
import "./i18n/config"; // Import i18n configuration
import { useTranslation } from "react-i18next";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial document direction based on language
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;