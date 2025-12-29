import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { StickyCTA } from "./StickyCTA";
import { ChatBot } from "@/components/chat/ChatBot";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";
import { usePageTracking, useScrollTracking, useTimeOnPage } from "@/hooks/useAnalytics";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  // Initialize Google Analytics if configured
  useGoogleAnalytics();
  
  // Track page views, scroll depth, and time on page
  usePageTracking();
  useScrollTracking();
  useTimeOnPage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyCTA />
      <ChatBot />
    </div>
  );
}
