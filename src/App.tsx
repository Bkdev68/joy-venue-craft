import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteContentProvider } from "@/hooks/useSiteContent";
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
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminServices from "./pages/admin/AdminServices";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminInsights from "./pages/admin/AdminInsights";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminHome from "./pages/admin/AdminHome";
import AdminLeistungen from "./pages/admin/AdminLeistungen";
import AdminPreise from "./pages/admin/AdminPreise";
import AdminKontakt from "./pages/admin/AdminKontakt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <SiteContentProvider>
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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="insights" element={<AdminInsights />} />
                <Route path="buchungen" element={<AdminBookings />} />
                <Route path="galerie" element={<AdminGallery />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="faq" element={<AdminFAQ />} />
                <Route path="inhalte" element={<AdminContent />} />
                <Route path="einstellungen" element={<AdminSettings />} />
                <Route path="seite/home" element={<AdminHome />} />
                <Route path="seite/leistungen" element={<AdminLeistungen />} />
                <Route path="seite/preise" element={<AdminPreise />} />
                <Route path="seite/kontakt" element={<AdminKontakt />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SiteContentProvider>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
