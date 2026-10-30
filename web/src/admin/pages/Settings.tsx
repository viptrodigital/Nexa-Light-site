"use client";

import { useState } from "react";
import { save, supabase } from "../db";
import { useStore } from "../store";
import { Button, Card, Field, PageHeader, inputClass, useToast } from "../ui";

export default function SettingsPage({ email }: { email: string }) {
  const { data, reload } = useStore();
  const toast = useToast();
  const [s, setS] = useState({
    email: data.settings.email ?? "",
    phone: data.settings.phone ?? "",
    whatsapp: data.settings.whatsapp ?? "",
    location: data.settings.location ?? "",
    mapEmbed: data.settings.mapEmbed ?? "",
  });
  const [login, setLogin] = useState({ email, password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof s, v: string) => setS((x) => ({ ...x, [k]: v }));

  const saveContact = async () => {
    setBusy(true);
    try {
      // Keep any other fields stored in the same document.
      await save("settings", "config", { ...data.settings, ...s });
      await reload();
      toast("Contact details saved");
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`, true);
    }
    setBusy(false);
  };

  const saveLogin = async () => {
    if (login.password && login.password.length < 8) return toast("Password must be at least 8 characters.", true);
    if (login.password !== login.confirm) return toast("Passwords don't match.", true);
    const changes: { email?: string; password?: string } = {};
    if (login.email.trim() && login.email.trim() !== email) changes.email = login.email.trim();
    if (login.password) changes.password = login.password;
    if (!Object.keys(changes).length) return toast("Nothing to change.", true);
    setBusy(true);
    const { error } = await supabase.auth.updateUser(changes);
    setBusy(false);
    if (error) return toast(error.message, true);
    setLogin((l) => ({ ...l, password: "", confirm: "" }));
    toast(changes.email ? "Check the new email inbox to confirm the change." : "Password updated");
  };

  // Accepts either the embed URL or the whole <iframe> code from Google Maps.
  const mapSrc = s.mapEmbed.match(/src="([^"]+)"/)?.[1] ?? s.mapEmbed;

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card title="Contact details" actions={<Button disabled={busy} onClick={saveContact}>Save</Button>}>
          <p className="text-xs text-secondary mb-4">Used on the Contact page, footer, product enquiry buttons and WhatsApp links.</p>
          <div className="space-y-4">
            <Field label="Email"><input value={s.email} onChange={(e) => set("email", e.target.value)} className={inputClass} /></Field>
            <Field label="Phone"><input value={s.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} /></Field>
            <Field label="WhatsApp link" hint="Format: https://wa.me/91XXXXXXXXXX">
              <input value={s.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Address" hint="Separate lines with commas.">
              <textarea value={s.location} onChange={(e) => set("location", e.target.value)} rows={3} className={`${inputClass} !h-auto py-2`} />
            </Field>
            <Field label="Google Maps embed" hint="Google Maps → Share → Embed a map → copy HTML, and paste it here.">
              <textarea value={s.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value.match(/src="([^"]+)"/)?.[1] ?? e.target.value)} rows={3} className={`${inputClass} !h-auto py-2 text-xs`} />
            </Field>
            {mapSrc.startsWith("https://") && <iframe src={mapSrc} title="Map preview" className="w-full h-48 rounded-lg border border-black/10" loading="lazy" />}
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Admin login">
            <div className="space-y-4">
              <Field label="Login email"><input type="email" value={login.email} onChange={(e) => setLogin((l) => ({ ...l, email: e.target.value }))} className={inputClass} /></Field>
              <Field label="New password" hint="Leave empty to keep the current password.">
                <input type="password" autoComplete="new-password" value={login.password} onChange={(e) => setLogin((l) => ({ ...l, password: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Confirm new password">
                <input type="password" autoComplete="new-password" value={login.confirm} onChange={(e) => setLogin((l) => ({ ...l, confirm: e.target.value }))} className={inputClass} />
              </Field>
              <Button disabled={busy} onClick={saveLogin}>Update login</Button>
            </div>
          </Card>
          <Card title="Old admin panel">
            <p className="text-sm text-secondary mb-3">The previous admin panel is still available while you get used to this one.</p>
            <a href="/admin-legacy" target="_blank" className="text-sm underline">Open old admin ↗</a>
          </Card>
        </div>
      </div>
    </>
  );
}
