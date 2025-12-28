import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Leistungen from "./pages/Leistungen";
import Photobooth from "./pages/services/Photobooth";
import VideoBooth360 from "./pages/services/VideoBooth360";
import AudioGuestbook from "./pages/services/AudioGuestbook";
import Galerie from "./pages/Galerie";
import Preise from "./pages/Preise";
import Kontakt from "./pages/Kontakt";
import Buchen from "./pages/Buchen";
import FAQ from "./pages/FAQ";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/leistungen" element={<Leistungen />} />
          <Route path="/leistungen/photobooth" element={<Photobooth />} />
          <Route path="/leistungen/360-video-booth" element={<VideoBooth360 />} />
          <Route path="/leistungen/audio-gaestebuch" element={<AudioGuestbook />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/preise" element={<Preise />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/buchen" element={<Buchen />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
