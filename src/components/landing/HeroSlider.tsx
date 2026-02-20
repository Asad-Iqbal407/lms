"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1523050335392-9bc56751d11b?q=80&w=1600&auto=format&fit=crop",
    title: "Empowering Future Leaders",
    description: "Welcome to the University of Gujrat's premier Learning Management System.",
    color: "from-emerald-700/80 to-teal-900/90",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
    title: "Innovative Digital Learning",
    description: "Access course materials, assignments, and grades from anywhere, anytime.",
    color: "from-sky-700/80 to-cyan-900/90",
  },
  {
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop",
    title: "Collaborative Education",
    description: "Connect with teachers and peers in a modern digital environment.",
    color: "from-amber-600/85 to-orange-900/90",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-[32px] bg-zinc-900 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          
          {/* Colorful Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.color}`} />

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              {slide.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-100 md:text-xl">
              {slide.description}
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all ${
              index === current ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
