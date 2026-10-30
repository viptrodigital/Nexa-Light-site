"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isAdmin, supabase } from "./db";
import { StoreProvider, useStore } from "./store";
import { Button, Field, ToastProvider, inputClass } from "./ui";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/Products";
import ProductEditor from "./pages/ProductEditor";
import CategoriesPage from "./pages/Categories";
import GalleryPage from "./pages/Gallery";
import BlogPage from "./pages/Blog";
import SeoPage from "./pages/Seo";
import SettingsPage from "./pages/Settings";

// Hash routes: #/products, #/products/new, #/products/<id>, ...
function useRoute() {
  const read = () => (typeof window === "undefined" ? "" : window.location.hash.replace(/^#\/?/, ""));
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route.split("?")[0].split("/").map(decodeURIComponent);
}

// Query part of the hash route (#/products?cat=...).
export const hashParams = () => new URLSearchParams(window.location.hash.split("?")[1] ?? "");

export const go = (path: string) => {
  window.location.hash = `/${path}`;
};

const NAV = [
  { path: "", label: "Dashboard" },
  { path: "products", label: "Products" },
  { path: "categories", label: "Categories" },
  { path: "gallery", label: "Projects Gallery" },
  { path: "blog", label: "Blog" },
  { path: "seo", label: "SEO" },
  { path: "settings", label: "Settings" },
];

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [allowed, setAllowed] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setAllowed(undefined);
    isAdmin()
      .then(setAllowed)
      .catch(() => setAllowed(false));
  }, [session]);

  if (session === undefined || (session && allowed === undefined)) return <Centered>Loading…</Centered>;
  if (!session) return <Login />;
  if (!allowed)
    return (
      <Centered>
        <p className="mb-4">The account {session.user.email} is not an admin.</p>
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </Centered>
    );

  return (
    <ToastProvider>
      <StoreProvider>
        <Shell email={session.user.email ?? ""} />
      </StoreProvider>
    </ToastProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col items-center justify-center p-6 text-sm text-secondary bg-background">{children}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-black/[0.08] p-8 shadow-premium">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" className="w-12 h-12 rounded-lg mb-6" />
        <h1 className="text-xl font-semibold text-primary mb-1">NexaLight Admin</h1>
        <p className="text-sm text-secondary mb-6">Sign in to manage products and content.</p>
        <div className="space-y-4">
          <Field label="Email">
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Password">
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Shell({ email }: { email: string }) {
  const route = useRoute();
  const { loading } = useStore();
  const [menu, setMenu] = useState(false);
  const section = route[0] || "";

  useEffect(() => setMenu(false), [route.join("/")]);

  let page: React.ReactNode;
  if (loading) page = <p className="text-sm text-secondary">Loading data…</p>;
  else if (section === "products" && route[1]) page = <ProductEditor key={route[1]} id={route[1] === "new" ? null : route[1]} copyFrom={route[2] === "copy" ? route[1] : undefined} />;
  else if (section === "products") page = <ProductsPage key={typeof window === "undefined" ? "" : window.location.hash} />;
  else if (section === "categories") page = <CategoriesPage />;
  else if (section === "gallery") page = <GalleryPage />;
  else if (section === "blog") page = <BlogPage />;
  else if (section === "seo") page = <SeoPage />;
  else if (section === "settings") page = <SettingsPage email={email} />;
  else page = <Dashboard />;

  return (
    <div className="min-h-screen bg-background lg:pl-60">
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-black/[0.08] flex flex-col transition-transform lg:translate-x-0 ${menu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-black/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="w-8 h-8 rounded-md" />
          <span className="text-sm font-semibold text-primary">NexaLight Admin</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <a
              key={n.path}
              href={`#/${n.path}`}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${section === n.path ? "bg-primary text-white" : "text-secondary hover:bg-surfaceLight hover:text-primary"}`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t border-black/[0.06] space-y-1">
          <a href="/" target="_blank" className="block px-3 py-2 rounded-lg text-sm text-secondary hover:bg-surfaceLight hover:text-primary">View website ↗</a>
          <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-3 py-2 rounded-lg text-sm text-secondary hover:bg-surfaceLight hover:text-primary">
            Sign out
          </button>
          <p className="px-3 pt-1 text-[11px] text-secondary truncate">{email}</p>
        </div>
      </aside>
      {menu && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" aria-label="Close menu" onClick={() => setMenu(false)} />}

      <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white border-b border-black/[0.08]">
        <button onClick={() => setMenu(true)} className="w-9 h-9 flex flex-col items-center justify-center gap-1" aria-label="Open menu">
          <span className="w-5 h-[1.5px] bg-primary" />
          <span className="w-5 h-[1.5px] bg-primary" />
          <span className="w-5 h-[1.5px] bg-primary" />
        </button>
        <span className="text-sm font-semibold text-primary">NexaLight Admin</span>
      </header>

      <main className="p-4 md:p-8 max-w-[90rem]">{page}</main>
    </div>
  );
}
