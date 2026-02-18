"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiArrowRightOnRectangle,
  HiMusicalNote,
  HiClipboardDocumentList,
  HiPlus,
  HiTrash,
  HiArrowPath,
  HiCloudArrowUp,
} from "react-icons/hi2";
import toast from "react-hot-toast";
export const dynamic = "force-dynamic";

type Tab = "beats" | "orders" | "upload";

interface AdminBeat {
  id: string;
  title: string;
  slug: string;
  bpm: number;
  key: string;
  genre: string;
  price: number;
  artworkUrl: string;
  plays: number;
  isActive: boolean;
  isSold: boolean;
  createdAt: string;
  _count: { orderItems: number };
}

interface AdminOrder {
  id: string;
  email: string;
  customerName: string | null;
  total: number;
  status: string;
  paymentProvider: string;
  createdAt: string;
  items: Array<{
    price: number;
    licenseType: string;
    beat: { title: string; artworkUrl: string };
  }>;
}

// ---------- Login Form ----------
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      onLogin();
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-surface text-lg">V</span>
          </div>
          <h1 className="font-display font-bold text-xl text-neutral-50">Admin Panel</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to manage your beats</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="input"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- Upload Beat Form ----------
function UploadBeatForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "",
    bpm: "",
    key: "C Minor",
    genre: "Trap",
    tags: "",
    price: "",
    exclusivePrice: "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    mp3: null,
    wav: null,
    artwork: null,
    preview: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState("");

  const uploadFile = async (file: File, type: string) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }

    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.mp3 || !files.wav || !files.artwork) {
      toast.error("MP3, WAV, and artwork files are required");
      return;
    }

    setUploading(true);

    try {
      setUploadStep("Uploading artwork...");
      const artwork = await uploadFile(files.artwork, "artwork");

      setUploadStep("Uploading MP3...");
      const mp3 = await uploadFile(files.mp3, "mp3");

      setUploadStep("Uploading WAV...");
      const wav = await uploadFile(files.wav, "wav");

      let preview = { url: mp3.url, publicId: mp3.publicId };
      if (files.preview) {
        setUploadStep("Uploading preview...");
        preview = await uploadFile(files.preview, "preview");
      }

      setUploadStep("Creating beat...");
      const res = await fetch("/api/admin/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
          artworkUrl: artwork.url,
          artworkPublicId: artwork.publicId,
          mp3Url: mp3.url,
          mp3PublicId: mp3.publicId,
          wavUrl: wav.url,
          wavPublicId: wav.publicId,
          previewUrl: preview.url,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success("Beat uploaded successfully!");
      onSuccess();

      // Reset form
      setForm({
        title: "",
        bpm: "",
        key: "C Minor",
        genre: "Trap",
        tags: "",
        price: "",
        exclusivePrice: "",
      });
      setFiles({ mp3: null, wav: null, artwork: null, preview: null });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadStep("");
    }
  };

  const keys = [
    "C Major", "C Minor", "C# Major", "C# Minor",
    "D Major", "D Minor", "D# Major", "D# Minor",
    "E Major", "E Minor", "F Major", "F Minor",
    "F# Major", "F# Minor", "G Major", "G Minor",
    "G# Major", "G# Minor", "A Major", "A Minor",
    "A# Major", "A# Minor", "B Major", "B Minor",
  ];

  const genres = [
    "Trap", "Hip Hop", "R&B", "Drill", "Pop", "Lo-fi", "Afrobeat", "Reggaeton", "Soul", "Jazz",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Beat Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            BPM *
          </label>
          <input
            type="number"
            value={form.bpm}
            onChange={(e) => setForm({ ...form, bpm: e.target.value })}
            className="input"
            required
            min={60}
            max={300}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Key *
          </label>
          <select
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            className="input"
          >
            {keys.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Genre *
          </label>
          <select
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            className="input"
          >
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Base Price ($) *
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input"
            required
            min={1}
            step={0.01}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Exclusive Price ($)
          </label>
          <input
            type="number"
            value={form.exclusivePrice}
            onChange={(e) => setForm({ ...form, exclusivePrice: e.target.value })}
            className="input"
            min={1}
            step={0.01}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="dark, melodic, guitar"
          className="input"
        />
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["artwork", "mp3", "wav", "preview"] as const).map((type) => (
          <div key={type}>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              {type === "artwork"
                ? "Cover Artwork (JPG/PNG) *"
                : type === "mp3"
                  ? "MP3 File *"
                  : type === "wav"
                    ? "WAV File *"
                    : "Preview MP3 (optional, tagged)"}
            </label>
            <label className="flex items-center gap-3 p-3 bg-surface-200 border border-surface-400
                           rounded-lg cursor-pointer hover:border-accent/30 transition-all">
              <HiCloudArrowUp className="w-5 h-5 text-neutral-500 shrink-0" />
              <span className="text-sm text-neutral-400 truncate">
                {files[type]?.name || "Choose file..."}
              </span>
              <input
                type="file"
                className="hidden"
                accept={
                  type === "artwork"
                    ? "image/jpeg,image/png,image/webp"
                    : type === "wav"
                      ? "audio/wav"
                      : "audio/mpeg"
                }
                onChange={(e) =>
                  setFiles({ ...files, [type]: e.target.files?.[0] || null })
                }
              />
            </label>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="btn-primary flex items-center gap-2"
      >
        <HiPlus className="w-4 h-4" />
        {uploading ? uploadStep || "Uploading..." : "Upload Beat"}
      </button>
    </form>
  );
}

// ---------- Main Dashboard ----------
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("beats");
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Check existing session
  useEffect(() => {
    fetch("/api/admin/beats")
      .then((r) => {
        if (r.ok) setAuthenticated(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const fetchBeats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/beats");
      if (res.ok) setBeats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    if (tab === "beats") fetchBeats();
    if (tab === "orders") fetchOrders();
  }, [authenticated, tab, fetchBeats, fetchOrders]);

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this beat?")) return;
    await fetch("/api/admin/beats", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBeats();
    toast.success("Beat deactivated");
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <HiArrowPath className="w-6 h-6 text-neutral-500 animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <header className="border-b border-surface-300 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-surface text-xs">V</span>
            </div>
            <span className="font-display font-semibold text-neutral-100 text-sm">
              Admin Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <HiArrowRightOnRectangle className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-100 border border-surface-300 rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
              Total Beats
            </p>
            <p className="font-display font-bold text-2xl text-neutral-50">
              {beats.length}
            </p>
          </div>
          <div className="bg-surface-100 border border-surface-300 rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
              Total Orders
            </p>
            <p className="font-display font-bold text-2xl text-neutral-50">
              {orders.filter((o) => o.status === "COMPLETED").length}
            </p>
          </div>
          <div className="bg-surface-100 border border-surface-300 rounded-xl p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
              Revenue
            </p>
            <p className="font-display font-bold text-2xl text-accent">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-surface-300 pb-3">
          {[
            { id: "beats" as Tab, label: "Beats", icon: HiMusicalNote },
            { id: "orders" as Tab, label: "Orders", icon: HiClipboardDocumentList },
            { id: "upload" as Tab, label: "Upload Beat", icon: HiPlus },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id
                ? "bg-accent text-surface"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-surface-200"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "upload" && (
          <UploadBeatForm
            onSuccess={() => {
              fetchBeats();
              setTab("beats");
            }}
          />
        )}

        {tab === "beats" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-neutral-500">Loading...</div>
            ) : beats.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                No beats yet. Upload your first beat.
              </div>
            ) : (
              beats.map((beat) => (
                <div
                  key={beat.id}
                  className="flex items-center gap-4 p-4 bg-surface-100 border border-surface-300
                           rounded-xl"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={beat.artworkUrl}
                      alt={beat.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-neutral-100 text-sm truncate">
                        {beat.title}
                      </h3>
                      {!beat.isActive && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded">
                          Inactive
                        </span>
                      )}
                      {beat.isSold && (
                        <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] rounded">
                          Sold
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {beat.bpm} BPM / {beat.key} / {beat.genre} / {beat.plays} plays / {beat._count.orderItems} sales
                    </p>
                  </div>
                  <span className="font-display font-bold text-accent text-sm">
                    ${beat.price}
                  </span>
                  <button
                    onClick={() => handleDelete(beat.id)}
                    className="p-2 rounded-lg text-neutral-500 hover:text-red-400
                             hover:bg-red-400/10 transition-all"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-neutral-500">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">No orders yet.</div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-surface-100 border border-surface-300 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm text-neutral-200 font-medium">
                        {order.email}
                      </span>
                      {order.customerName && (
                        <span className="text-xs text-neutral-500 ml-2">
                          ({order.customerName})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "FAILED"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                          }`}
                      >
                        {order.status}
                      </span>
                      <span className="font-display font-bold text-accent text-sm">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span>{order.paymentProvider}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>
                      {order.items.map((i) => i.beat.title).join(", ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
