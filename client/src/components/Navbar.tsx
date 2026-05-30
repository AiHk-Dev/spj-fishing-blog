/*
 * Design Philosophy: Dark Maritime Minimalism
 * Navbar: Glass morphism on scroll, minimal links, teal accent on active
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import SPJLogo from "./SPJLogo";
import { useBlogAuth } from "@/hooks/useBlogAuth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { member, isLoggedIn, logout } = useBlogAuth();

  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/#posts", label: "釣果記録" },
    { href: "/#tackle", label: "タックル" },
    { href: "/#technique", label: "テクニック" },
    { href: "/#about", label: "About" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[oklch(0.10_0.025_240/0.95)] backdrop-blur-md border-b border-[oklch(0.25_0.03_240)]"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2.5 group">
            <SPJLogo size={38} className="transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col leading-tight">
              <span
                className="font-bold text-lg text-white tracking-wide group-hover:text-[oklch(0.72_0.18_195)] transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SPJ Fishing
              </span>
              <span
                className="text-[9px] tracking-[0.25em] uppercase"
                style={{ fontFamily: "'Bebas Neue', 'Barlow Condensed', sans-serif", color: "oklch(0.72 0.18 195)", letterSpacing: "0.22em" }}
              >
                Slow Pitch Jigging
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[oklch(0.75_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors duration-200 font-['Noto_Sans_JP'] tracking-wide"
            >
              {link.label}
            </a>
          ))}
          {/* Member auth links */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <span className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.65_0.15_190)] hover:text-[oklch(0.72_0.15_190)] transition-colors font-['Noto_Sans_JP'] cursor-pointer">
                  <span className="text-xs bg-[oklch(0.65_0.15_190/0.15)] border border-[oklch(0.65_0.15_190/0.4)] px-1.5 py-0.5 rounded-sm">会員</span>
                  {member?.username}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <span className="text-sm text-[oklch(0.65_0.02_240)] hover:text-white transition-colors font-['Noto_Sans_JP'] cursor-pointer">ログイン</span>
              </Link>
              <Link href="/register">
                <span className="text-sm bg-[oklch(0.65_0.15_190)] text-[oklch(0.10_0.025_240)] font-['Noto_Sans_JP'] font-semibold px-4 py-1.5 rounded-sm hover:bg-[oklch(0.72_0.15_190)] transition-colors cursor-pointer">会員登録</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[oklch(0.12_0.025_240/0.98)] backdrop-blur-md border-t border-[oklch(0.25_0.03_240)] px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-base text-[oklch(0.80_0.02_240)] hover:text-[oklch(0.65_0.15_190)] transition-colors font-['Noto_Sans_JP'] py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
