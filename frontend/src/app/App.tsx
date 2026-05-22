import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import HomePage from "./pages/home";
import JelajahPage from "./pages/jelajah";
import VisualisasiPage from "./pages/visualisasi";
import AIPage from "./pages/ai";
import TentangPage from "./pages/tentang";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <div className="min-h-screen bg-white font-display text-slate-800 flex flex-col">
      <Navbar />
      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jelajah" element={<JelajahPage />} />
          <Route path="/visualisasi" element={<VisualisasiPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/tentang" element={<TentangPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
      {/* Global toast notifications – posisi kanan bawah */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            error: "border-red-200",
            success: "border-green-200",
          },
        }}
      />
    </BrowserRouter>
  );
}
