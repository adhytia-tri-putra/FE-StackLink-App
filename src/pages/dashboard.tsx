import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { profileService } from "../services/profileService";
import { linkService, LinkItem } from "../services/linkService";
import {
  analyticsService,
  AnalyticsSummary,
  AnalyticsUpdatePayload,
  applyRealtimeAnalyticsUpdate,
} from "../services/analyticsService";
import { authService } from "../services/authService";
import Insights from "./insights";

type DashboardLink = LinkItem & { active: boolean; clicks: number };

// UI Icons (Lucide-like style using SVG)
const IconAdd = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4v16m8-8H4"
    />
  </svg>
);
const IconChart = () => (
  <svg
    className="w-4 h-4 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const IconTrash = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const THEMES = [
  {
    id: "default",
    name: "Ocean Glow",
    bg: "bg-gradient-to-tr from-[#e8f3ff] to-[#d9fbf6]",
  },
  { id: "dark", name: "Midnight Dark", bg: "bg-slate-900 text-white" },
  {
    id: "sunset",
    name: "Warm Sunset",
    bg: "bg-gradient-to-tr from-orange-100 to-amber-200",
  },
  {
    id: "forest",
    name: "Emerald Forest",
    bg: "bg-gradient-to-tr from-emerald-50 to-teal-100",
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"links" | "design" | "insights">(
    "links",
  );

  // State Profile
  const [username, setUsername] = useState("adhyitahirasawa");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customColor, setCustomColor] = useState("#2388ff");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // State Links
  const [links, setLinks] = useState<DashboardLink[]>([]);

  // State Modals & Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const initialize = async () => {
      if (!authService.getToken()) {
        navigate("/login");
        return;
      }

      try {
        const profile = await profileService.getMyProfile();
        setUsername(profile.username || username);
        setHeadline(profile.headline || "");
        setBio(profile.bio || "");
        setCustomColor(profile.customColor || "#2388ff");

        const fetchedLinks = await linkService.getLinks();
        const summary = await analyticsService.getSummary();
        setAnalytics(summary);

        const clicksById = new Map(
          summary.links.map((item) => [item.id, item.totalClicks]),
        );
        setLinks(
          fetchedLinks.map((link) => ({
            ...link,
            active: link.isActive,
            clicks: clicksById.get(link.id) ?? 0,
          })),
        );
      } catch (error) {
        console.error(error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    let closed = false;
    let unsubscribe: (() => void) | null = null;

    void analyticsService
      .subscribe((event) => {
        if (event.type !== "analytics-update") return;
        const payload = event.payload as AnalyticsUpdatePayload | undefined;
        if (!payload || !payload.linkId) return;

        setAnalytics((current) =>
          current ? applyRealtimeAnalyticsUpdate(current, payload) : current,
        );

        setLinks((currentLinks) =>
          currentLinks.map((link) =>
            link.id === payload.linkId
              ? { ...link, clicks: link.clicks + 1 }
              : link,
          ),
        );
      })
      .then((source) => {
        if (closed) {
          source.close();
          return;
        }

        unsubscribe = () => source.close();
      });

    return () => {
      closed = true;
      unsubscribe?.();
    };
  }, []);

  const refreshAnalytics = async () => {
    try {
      const summary = await analyticsService.getSummary();
      setAnalytics(summary);
      setLinks((currentLinks) =>
        currentLinks.map((link) => ({
          ...link,
          clicks:
            summary.links.find((item) => item.id === link.id)?.totalClicks ??
            link.clicks,
        })),
      );
    } catch (error) {
      console.warn("Tidak dapat memuat analytics", error);
    }
  };

  const handleSave = async () => {
    try {
      await profileService.updateProfile({
        headline,
        bio,
      });

      await profileService.updateTheme({ buttonColor: customColor });
      alert("Profile & Design tersimpan!");
    } catch (error) {
      alert((error as Error).message || "Gagal menyimpan profil");
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;

    try {
      const created = await linkService.createLink(
        newTitle,
        newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
        null,
      );

      setLinks([
        {
          ...created,
          isActive: created.isActive,
          clicks: 0,
        },
        ...links,
      ]);
      setNewTitle("");
      setNewUrl("");
      setIsAddModalOpen(false);
      await refreshAnalytics();
    } catch (error) {
      alert((error as Error).message || "Gagal membuat link.");
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await linkService.deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
      await refreshAnalytics();
    } catch (error) {
      alert((error as Error).message || "Gagal menghapus link.");
    }
  };

  const updateLinkField = async (
    id: string,
    updates: Partial<{ title: string; url: string; isActive: boolean }>,
  ) => {
    setLinks((currentLinks) =>
      currentLinks.map((link) =>
        link.id === id ? { ...link, ...updates } : link,
      ),
    );

    try {
      await linkService.updateLink(id, updates);
      await refreshAnalytics();
    } catch (error) {
      console.error(error);
    }
  };

  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const handleReorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setLinks((prevLinks) => {
      const fromIndex = prevLinks.findIndex((l) => l.id === fromId);
      const toIndex = prevLinks.findIndex((l) => l.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prevLinks;
      const updated = [...prevLinks];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const reorderLinksArray = (
    currentLinks: DashboardLink[],
    fromId: string,
    toId: string,
  ) => {
    if (fromId === toId) return currentLinks;
    const fromIndex = currentLinks.findIndex((l) => l.id === fromId);
    const toIndex = currentLinks.findIndex((l) => l.id === toId);
    if (fromIndex === -1 || toIndex === -1) return currentLinks;
    const updated = [...currentLinks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    return updated;
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedLinkId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (draggedLinkId === null || draggedLinkId === id) return;
    setDragOverLinkId(id);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (draggedLinkId === null) return;
    const reordered = reorderLinksArray(links, draggedLinkId, id);
    setLinks(reordered);
    setDraggedLinkId(null);
    setDragOverLinkId(null);

    try {
      await linkService.reorderLinks(
        reordered.map((link, index) => ({ id: link.id, position: index })),
      );
      await refreshAnalytics();
    } catch (error) {
      console.error("Gagal menyimpan urutan link", error);
    }
  };

  const onDragLeave = (id: string) => {
    if (dragOverLinkId === id) setDragOverLinkId(null);
  };

  const toggleLinkActive = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;

    const updatedActive = !link.active;
    setLinks(
      links.map((l) => (l.id === id ? { ...l, active: updatedActive } : l)),
    );

    try {
      await linkService.updateLink(id, { isActive: updatedActive });
      await refreshAnalytics();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2388ff] to-[#1ed4c9] rounded-lg" />
            <span className="font-bold text-xl tracking-tight">StackLink</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("links")}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === "links" ? "bg-slate-100 text-[#2388ff]" : "text-slate-500 hover:bg-slate-50"}`}>
              Links
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === "design" ? "bg-slate-100 text-[#2388ff]" : "text-slate-500 hover:bg-slate-50"}`}>
              Design
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${activeTab === "insights" ? "bg-slate-100 text-[#2388ff]" : "text-slate-500 hover:bg-slate-50"}`}>
              Insights
            </button>
            <button className="w-full flex items-center px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed">
              Settings
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button
            onClick={async () => {
              await authService.logout();
              navigate("/login");
            }}
            className="text-sm font-medium text-slate-500 hover:text-red-500">
            Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-slate-500">
            Preview:{" "}
            <span className="text-slate-800 font-bold underline cursor-pointer">
              stacklink.me/{username}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200">
              Share / QR
            </button>
            <button
              onClick={handleSave}
              className="text-sm font-bold text-white bg-[#2388ff] px-6 py-2 rounded-full hover:bg-[#176fd5] shadow-sm">
              Publish
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {activeTab === "links" ? (
              <section className="space-y-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-teal-400" />
                  <div>
                    <h3 className="font-bold text-lg">@{username}</h3>
                    <p className="text-sm text-slate-500">{headline}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full py-4 bg-[#2388ff] text-white font-bold rounded-full flex items-center justify-center shadow-lg hover:scale-[1.01] transition transform">
                  <IconAdd /> Add Link
                </button>

                <div className="space-y-4">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, link.id)}
                      onDragOver={(e) => onDragOver(e, link.id)}
                      onDragLeave={() => onDragLeave(link.id)}
                      onDrop={(e) => onDrop(e, link.id)}
                      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group ${dragOverLinkId === link.id ? "ring-2 ring-[#2388ff]/50" : ""}`}>
                      <div className="p-5 flex gap-4">
                        <div className="flex-shrink-0 cursor-grab text-slate-300">
                          ⋮⋮
                        </div>
                        <div className="flex-1">
                          <input
                            className="block w-full font-bold text-slate-800 mb-1 focus:outline-none"
                            value={link.title}
                            onChange={(e) =>
                              setLinks(
                                links.map((l) =>
                                  l.id === link.id
                                    ? { ...l, title: e.target.value }
                                    : l,
                                ),
                              )
                            }
                            onBlur={() =>
                              updateLinkField(link.id, { title: link.title })
                            }
                          />
                          <input
                            className="block w-full text-sm text-slate-400 focus:outline-none"
                            value={link.url}
                            onChange={(e) =>
                              setLinks(
                                links.map((l) =>
                                  l.id === link.id
                                    ? { ...l, url: e.target.value }
                                    : l,
                                ),
                              )
                            }
                            onBlur={() =>
                              updateLinkField(link.id, { url: link.url })
                            }
                          />
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center text-emerald-500">
                              <IconChart /> {link.clicks} Clicks
                            </span>
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="hover:text-red-500 transition-colors">
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <div
                            onClick={() => toggleLinkActive(link.id)}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${link.active ? "bg-emerald-500" : "bg-slate-300"}`}>
                            <div
                              className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${link.active ? "right-1" : "left-1"}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : activeTab === "insights" ? (
              <section className="space-y-6">
                <Insights />
              </section>
            ) : (
              <section className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">Profile Info</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400">
                        Username
                      </label>
                      <input
                        value={username}
                        readOnly
                        className="mt-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#2388ff] outline-none"
                      />
                      <p className="mt-2 text-xs text-slate-400">
                        Username tidak dapat diubah dari dashboard.
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400">
                        Bio Headline
                      </label>
                      <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="mt-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#2388ff] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400">
                        Bio Description
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#2388ff] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-2">Appearance</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Pilih tema yang sesuai dengan karaktermu.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {THEMES.map((theme) => (
                      <div
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`cursor-pointer rounded-2xl border-2 p-1 transition ${selectedTheme === theme.id ? "border-[#2388ff] scale-[1.02]" : "border-transparent"}`}>
                        <div
                          className={`h-24 rounded-xl ${theme.bg} flex items-center justify-center font-bold text-xs`}>
                          {theme.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <h3 className="font-bold text-sm mb-3">
                      Custom Button Color
                    </h3>
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="h-12 w-full rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </section>
            )}

            {showQR && (
              <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border-2 border-[#2388ff] animate-bounce-short">
                <QRCodeSVG
                  value={`https://stacklink.me/${username}`}
                  size={180}
                />
                <p className="font-mono text-sm">stacklink.me/{username}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. RIGHT PERSISTENT PREVIEW */}
      <aside className="w-[440px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-8">
        <div className="relative w-[300px] h-[600px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
          <div
            className={`h-full w-full overflow-y-auto flex flex-col p-6 ${THEMES.find((t) => t.id === selectedTheme)?.bg}`}>
            <div className="flex-1 text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 border-2 border-white shadow-lg mt-4" />
              <h2 className="mt-4 text-xl font-bold">{username}</h2>
              <p className="text-xs opacity-70 mb-2">{headline}</p>
              <p className="text-[10px] opacity-60 px-4 mb-6 leading-relaxed">
                {bio}
              </p>

              <div className="space-y-3">
                {links
                  .filter((l) => l.active)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: customColor }}
                      className="block w-full py-3 px-4 rounded-xl text-white text-xs font-bold shadow-md animate-in slide-in-from-bottom-2 no-underline">
                      {link.title}
                    </a>
                  ))}
              </div>
            </div>
            <div className="mt-8 text-center text-[10px] font-bold opacity-30 tracking-widest uppercase">
              StackLink
            </div>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl" />
        </div>
        <p className="mt-6 text-slate-400 text-xs font-semibold">
          Your changes are live instantly
        </p>
      </aside>

      {/* MODAL ADD LINK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddLink}
            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">Create New Link</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  Title
                </label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My Website"
                  className="mt-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#2388ff] outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">
                  URL
                </label>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. google.com"
                  className="mt-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#2388ff] outline-none"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200">
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold text-white bg-[#2388ff] rounded-xl hover:bg-[#176fd5]">
                Add Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
