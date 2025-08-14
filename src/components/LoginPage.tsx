"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserRole } from "../App";

const colors = {
  50: "#f8f7f5",
  100: "#e6e1d7",
  200: "#c8b4a0",
  300: "#a89080",
  400: "#8a7060",
  500: "#6b5545",
  600: "#544237",
  700: "#3c4237",
  800: "#2a2e26",
  900: "#1a1d18",
};

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const gradientRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = React.useState<UserRole>("chauffeur");
  const [name, setName] = React.useState("");

  useEffect(() => {
    // Animate words
    const words = document.querySelectorAll<HTMLElement>(".word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.8s ease-out forwards";
      }, delay);
    });

    // Mouse gradient
    const gradient = gradientRef.current;
    function onMouseMove(e: MouseEvent) {
      if (gradient) {
        gradient.style.left = e.clientX - 192 + "px";
        gradient.style.top = e.clientY - 192 + "px";
        gradient.style.opacity = "1";
      }
    }
    function onMouseLeave() {
      if (gradient) gradient.style.opacity = "0";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    // Word hover effects
    words.forEach((word) => {
      word.addEventListener("mouseenter", () => {
        word.style.textShadow = "0 0 20px rgba(200, 180, 160, 0.5)";
      });
      word.addEventListener("mouseleave", () => {
        word.style.textShadow = "none";
      });
    });

    // Click ripple effect
    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      ripple.style.width = "4px";
      ripple.style.height = "4px";
      ripple.style.background = "rgba(200, 180, 160, 0.6)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      ripple.style.animation = "pulse-glow 1s ease-out forwards";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }
    document.addEventListener("click", onClick);

    // Floating elements on scroll
    let scrolled = false;
    function onScroll() {
      if (!scrolled) {
        scrolled = true;
        document.querySelectorAll<HTMLElement>(".floating-element").forEach((el, index) => {
          setTimeout(() => {
            el.style.animationPlayState = "running";
          }, index * 200);
        });
      }
    }
    window.addEventListener("scroll", onScroll);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogin = () => {
    if (name.trim()) {
      onLogin({
        id: `${role}_${Date.now()}`,
        name,
        role,
        email: `${name.toLowerCase()}@aegean.com`,
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1a1d18] via-black to-[#2a2e26] text-[#e6e1d7] font-primary overflow-hidden relative w-full"
    >
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(200,180,160,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.5s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "1s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "1.5s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "2s" }} />

        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "3s" }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "3.2s" }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "3.4s" }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "3.6s" }} />
        <circle cx="50%" cy="50%" r="1.5" className="detail-dot" style={{ animationDelay: "4s" }} />
      </svg>

      {/* Corner elements */}
      <div className="corner-element absolute top-8 left-8" style={{ animationDelay: "4s" }}>
        <div className="absolute top-0 left-0 w-2 h-2 opacity-30" style={{ background: colors[200] }}></div>
      </div>
      <div className="corner-element absolute top-8 right-8" style={{ animationDelay: "4.2s" }}>
        <div className="absolute top-0 right-0 w-2 h-2 opacity-30" style={{ background: colors[200] }}></div>
      </div>
      <div className="corner-element absolute bottom-8 left-8" style={{ animationDelay: "4.4s" }}>
        <div className="absolute bottom-0 left-0 w-2 h-2 opacity-30" style={{ background: colors[200] }}></div>
      </div>
      <div className="corner-element absolute bottom-8 right-8" style={{ animationDelay: "4.6s" }}>
        <div className="absolute bottom-0 right-0 w-2 h-2 opacity-30" style={{ background: colors[200] }}></div>
      </div>

      {/* Floating elements */}
      <div className="floating-element" style={{ top: "25%", left: "15%", animationDelay: "5s" }}></div>
      <div className="floating-element" style={{ top: "60%", left: "85%", animationDelay: "5.5s" }}></div>
      <div className="floating-element" style={{ top: "40%", left: "10%", animationDelay: "6s" }}></div>
      <div className="floating-element" style={{ top: "75%", left: "90%", animationDelay: "6.5s" }}></div>

      <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-8 py-12 md:px-16 md:py-20">
        {/* Top tagline */}
        <div className="text-center">
          <h2
            className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] opacity-80"
            style={{ color: colors[200] }}
          >
            <span className="word" data-delay="0">Bienvenue</span>
            <span className="word" data-delay="200"> sur</span>
            <span className="word" data-delay="400"> <b>Aegean BL</b></span>
            <span className="word" data-delay="600"> —</span>
            <span className="word" data-delay="800"> Gestion</span>
            <span className="word" data-delay="1000"> intelligente</span>
            <span className="word" data-delay="1200"> des</span>
            <span className="word" data-delay="1400"> livraisons.</span>
          </h2>
          <div
            className="mt-4 w-16 h-px opacity-30 mx-auto"
            style={{
              background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
            }}
          ></div>
        </div>

        {/* Main content */}
        <div className="text-center max-w-5xl mx-auto">
          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-extralight leading-tight tracking-tight mb-8"
            style={{ color: colors[50] }}
          >
            <div className="mb-4 md:mb-6">
              <span className="word" data-delay="1600">Traçabilité</span>
              <span className="word" data-delay="1750"> totale</span>
              <span className="word" data-delay="1900"> de</span>
              <span className="word" data-delay="2050"> vos</span>
              <span className="word" data-delay="2200"> bons</span>
              <span className="word" data-delay="2350"> de</span>
              <span className="word" data-delay="2500"> livraison.</span>
            </div>
            <div
              className="text-2xl md:text-3xl lg:text-4xl font-thin leading-relaxed"
              style={{ color: colors[200] }}
            >
              <span className="word" data-delay="2600">Contrôlez,</span>
              <span className="word" data-delay="2750"> validez,</span>
              <span className="word" data-delay="2900"> et</span>
              <span className="word" data-delay="3050"> analysez</span>
              <span className="word" data-delay="3200"> chaque</span>
              <span className="word" data-delay="3350"> livraison</span>
              <span className="word" data-delay="3500"> — en</span>
              <span className="word" data-delay="3650"> temps</span>
              <span className="word" data-delay="3800"> réel.</span>
            </div>
          </h1>

          {/* Login Form */}
          <Card className="max-w-md mx-auto bg-[var(--color-800)]/50 backdrop-blur-sm border-[var(--color-700)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-100)] text-center">Connexion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[var(--color-200)]">Nom</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[var(--color-200)]">Rôle</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger className="bg-[var(--color-700)]/50 border-[var(--color-600)] text-[var(--color-100)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-800)] border-[var(--color-700)]">
                    <SelectItem value="chauffeur" className="text-[var(--color-100)]">Chauffeur</SelectItem>
                    <SelectItem value="agent" className="text-[var(--color-100)]">Agent de Saisie</SelectItem>
                    <SelectItem value="chef" className="text-[var(--color-100)]">Chef/Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-[var(--color-700)] hover:bg-[var(--color-600)] text-[var(--color-100)]"
              >
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom tagline */}
        <div className="text-center">
          <div
            className="mb-4 w-16 h-px opacity-30 mx-auto"
            style={{
              background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
            }}
          ></div>
          <h2
            className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] opacity-80"
            style={{ color: colors[200] }}
          >
            <span className="word" data-delay="4400">Sécurisé,</span>
            <span className="word" data-delay="4550"> fiable,</span>
            <span className="word" data-delay="4700"> et</span>
            <span className="word" data-delay="4850"> intelligent.</span>
          </h2>
        </div>
      </div>

      <div
        id="mouse-gradient"
        ref={gradientRef}
        className="fixed pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-500 ease-out opacity-0"
        style={{
          background: `radial-gradient(circle, ${colors[500]}0D 0%, transparent 100%)`,
        }}
      ></div>
    </div>
  );
}