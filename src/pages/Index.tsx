import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchForm from "@/components/SearchForm";
import heroBus from "@/assets/hero-bus.jpg";
import { Shield, Tag, Headphones, Award } from "lucide-react";

const FEATURES = [
  { icon: Shield, title: "100% Secure Booking", desc: "Your data and payments are always protected." },
  { icon: Tag, title: "Lowest Price Guarantee", desc: "Get the best fares on every route, every time." },
  { icon: Headphones, title: "24×7 Customer Support", desc: "We're here whenever you need help." },
  { icon: Award, title: "Trusted by Millions", desc: "Over 36 crore happy customers and counting." },
];

const POPULAR_ROUTES = [
  { from: "Bangalore", to: "Hyderabad" },
  { from: "Mumbai", to: "Pune" },
  { from: "Delhi", to: "Jaipur" },
  { from: "Chennai", to: "Bangalore" },
  { from: "Hyderabad", to: "Vijayawada" },
  { from: "Pune", to: "Goa" },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative text-primary-foreground overflow-hidden">
        <img
          src={heroBus}
          alt="Modern luxury sleeper bus on highway at sunset"
          width={1600}
          height={800}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle dark gradient for text readability — image stays clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" aria-hidden />
        <div className="container relative py-12 md:py-20">
          <div className="max-w-3xl mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
              India's No. 1 Online Bus Ticket Booking Site
            </h1>
            <p className="text-base md:text-lg opacity-90">
              Search, compare and book bus tickets across 100,000+ routes. Lowest fares, guaranteed.
            </p>
          </div>
          <SearchForm />
        </div>
      </section>

      {/* Features */}
      <section className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl border p-5 text-center shadow-sm hover:shadow-md transition-smooth">
              <Icon className="w-8 h-8 mx-auto text-primary mb-3" />
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular routes */}
      <section className="container pb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Bus Routes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_ROUTES.map(({ from, to }) => (
            <Link
              key={`${from}-${to}`}
              to={`/results?source=${from}&destination=${to}&date=${new Date(Date.now() + 86400000).toISOString().split("T")[0]}`}
              className="bg-card border rounded-lg p-4 flex items-center justify-between hover:border-primary hover:shadow-md transition-smooth group"
            >
              <span className="font-medium text-sm">
                {from} <span className="text-muted-foreground">→</span> {to}
              </span>
              <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-base">
                Book →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
