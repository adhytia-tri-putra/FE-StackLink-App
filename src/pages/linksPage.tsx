import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkService, LinkItem } from "../services/linkService";
import { authService } from "../services/authService";
import {
  analyticsService,
  AnalyticsUpdatePayload,
} from "../services/analyticsService";
import { profileService, ProfileData } from "../services/profileService";
import { PreviewSidebar } from "./livePreview";
import AddLinkModal from "../components/AddLinkModal";

type IconProps = React.SVGProps<SVGSVGElement>;
type LinkWithClicks = LinkItem & { clicks?: number };

const IconPlus = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
  </svg>
);

const IconGrip = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M8 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-5 6.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
  </svg>
);

const IconArrowUp = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 0l-6 6m6-6l6 6" />
  </svg>
);

const IconArrowDown = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m0 0l6-6m-6 6l-6-6" />
  </svg>
);

const IconGlobe = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </svg>
);

const IconBag = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8V7a4 4 0 018 0v1m-9 0h10l1 11H6L7 8z" />
  </svg>
);

const IconCalendar = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V4m8 3V4M5 11h14M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm4 10h4" />
  </svg>
);

const IconTarget = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.8-5.8l-2.1 2.1M8.3 15.7l-2.1 2.1m11.6 0l-2.1-2.1M8.3 8.3L6.2 6.2M12 16a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const IconEdit = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 4.487l1.65-1.65a1.875 1.875 0 112.651 2.651L8.25 18.401 4.5 19.5l1.099-3.75L16.862 4.487z" />
  </svg>
);

const IconExternal = ({ className = "h-4 w-4", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 6H18m0 0v4.5M18 6l-8.25 8.25M6 9v9h9" />
  </svg>
);

const IconTrash = ({ className = "h-5 w-5", ...props }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12m-9 0V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0l-.8 12a2 2 0 01-2 1.9H8.8a2 2 0 01-2-1.9L6 7z" />
  </svg>
);

const iconStyles = [
  { bg: "bg-primary-container", text: "text-primary", icon: IconGlobe },
  { bg: "bg-secondary-container", text: "text-secondary", icon: IconBag },
  { bg: "bg-surface-container-highest", text: "text-outline", icon: IconCalendar },
];

const normalizeUrl = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

const LinksPage: React.FC = () => {
  const navigate = useNavigate();
  const [links, setLinks] = useState<LinkWithClicks[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!authService.getToken()) {
        navigate("/login");
        return;
      }

      try {
        const [fetchedLinks, summary, fetchedProfile] = await Promise.all([
          linkService.getLinks(),
          analyticsService.getSummary(),
          profileService.getMyProfile().catch(() => null),
        ]);

        const clicksById = new Map(summary.links.map((link) => [link.id, link.totalClicks]));
        setLinks(
          fetchedLinks.map((link, index) => ({
            ...link,
            position: link.position ?? index,
            clicks: clicksById.get(link.id) ?? 0,
          }))
        );
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Failed to load links:", error);
        if (error instanceof Error && error.message.includes("401")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);

  useEffect(() => {
    const socket = analyticsService.subscribe((event) => {
      if (event.type !== "analytics-update") return;
      const payload = event.payload as AnalyticsUpdatePayload | undefined;
      if (!payload?.linkId) return;

      setLinks((current) =>
        current.map((link) =>
          link.id === payload.linkId
            ? { ...link, clicks: (link.clicks ?? 0) + 1 }
            : link
        )
      );
    });

    return () => {
      socket.close();
    };
  }, []);

  const handleStartEdit = (link: LinkWithClicks) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      alert("Title and URL are required");
      return;
    }

    const nextUrl = normalizeUrl(editUrl.trim());

    try {
      await linkService.updateLink(id, { title: editTitle.trim(), url: nextUrl });
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, title: editTitle.trim(), url: nextUrl } : link
        )
      );
      setEditingId(null);
    } catch (error) {
      alert((error as Error).message || "Failed to update link");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, isActive: !currentActive } : link))
    );

    try {
      await linkService.updateLink(id, { isActive: !currentActive });
    } catch (error) {
      setLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, isActive: currentActive } : link))
      );
      alert((error as Error).message || "Failed to toggle link");
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Delete this link?")) return;

    try {
      await linkService.deleteLink(id);
      setLinks((prev) => prev.filter((link) => link.id !== id).map((link, index) => ({ ...link, position: index })));
    } catch (error) {
      alert((error as Error).message || "Failed to delete link");
    }
  };

  const withPositions = (items: LinkWithClicks[]) =>
    items.map((link, index) => ({ ...link, position: index }));

  const handleCreatedLink = (created: LinkItem) => {
    setLinks((prev) =>
      withPositions([
        ...prev,
        {
          ...created,
          clicks: 0,
          isActive: created.isActive ?? true,
          position: created.position ?? prev.length,
        },
      ])
    );
  };

  const moveByIndex = (items: LinkWithClicks[], fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
      return items;
    }

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return withPositions(next);
  };

  const saveOrder = async (nextLinks: LinkWithClicks[], fallbackLinks: LinkWithClicks[]) => {
    setOrderStatus("Saving order...");

    try {
      await linkService.reorderLinks(nextLinks.map((link, index) => ({ id: link.id, position: index })));
      setOrderStatus("Order saved.");
      window.setTimeout(() => setOrderStatus(""), 1800);
    } catch (error) {
      setLinks(fallbackLinks);
      setOrderStatus("");
      alert((error as Error).message || "Failed to save link order");
    }
  };

  const handleMoveLink = async (id: string, direction: -1 | 1) => {
    const fromIndex = links.findIndex((link) => link.id === id);
    const toIndex = fromIndex + direction;
    const nextLinks = moveByIndex(links, fromIndex, toIndex);

    if (nextLinks === links) return;

    const previousLinks = links;
    setLinks(nextLinks);
    await saveOrder(nextLinks, previousLinks);
  };

  const handleDragStart = (event: React.DragEvent, id: string) => {
    setDraggedLinkId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (event: React.DragEvent, id: string) => {
    event.preventDefault();
    if (!draggedLinkId || draggedLinkId === id) return;
    setDragOverLinkId(id);
  };

  const handleDrop = async (event: React.DragEvent, targetId: string) => {
    event.preventDefault();
    const sourceId = draggedLinkId || event.dataTransfer.getData("text/plain");
    setDraggedLinkId(null);
    setDragOverLinkId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = links.findIndex((link) => link.id === sourceId);
    const toIndex = links.findIndex((link) => link.id === targetId);
    const nextLinks = moveByIndex(links, fromIndex, toIndex);

    if (nextLinks === links) return;

    const previousLinks = links;
    setLinks(nextLinks);
    await saveOrder(nextLinks, previousLinks);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-4 text-on-surface-variant">Loading links...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-surface px-4 py-5 sm:px-5 lg:px-6 xl:px-7">
      <div className="w-full max-w-none">
        <div className="grid gap-6 min-[1280px]:grid-cols-[minmax(0,1fr)_430px] min-[1280px]:items-start">
          <div className="min-w-0">
            <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-[30px] font-semibold leading-tight text-on-surface sm:text-[36px]">
                  Links
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Drag links to reorder them on your public page.
                </p>
                {orderStatus && <p className="mt-2 text-sm font-semibold text-primary">{orderStatus}</p>}
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-on shadow-[0_10px_20px_rgba(73,101,77,0.18)] transition-all hover:bg-primary/95 active:translate-y-0.5"
              >
                <IconPlus className="h-5 w-5" />
                Add New Link
              </button>
            </header>

            {links.length === 0 ? (
              <div className="rounded-[20px] border border-outline-variant/60 bg-surface-container-lowest p-6 text-center shadow-soft">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary">
              <IconTarget className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-on-surface">No links yet</h2>
            <p className="mx-auto mt-2 max-w-md text-on-surface-variant">
              Create your first destination so your audience has somewhere calm to land.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-5 rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-on"
            >
              Create First Link
            </button>
              </div>
            ) : (
              <div className="space-y-3">
            {links.map((link, index) => {
              const style = iconStyles[index % iconStyles.length];
              const Icon = style.icon;

              return (
                <article
                  key={link.id}
                  onDragOver={(event) => handleDragOver(event, link.id)}
                  onDragLeave={() => setDragOverLinkId(null)}
                  onDrop={(event) => handleDrop(event, link.id)}
                  className={`rounded-[20px] border bg-surface-container-lowest shadow-soft transition-all ${
                    link.isActive
                      ? "border-outline-variant/70"
                      : "border-outline-variant/40 opacity-65"
                  } ${dragOverLinkId === link.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                >
                  {editingId === link.id ? (
                    <div className="space-y-4 p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-sm font-semibold text-on-surface">Title</span>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-2.5 text-on-surface outline-none transition focus:border-primary"
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-on-surface">URL</span>
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(event) => setEditUrl(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-2.5 text-on-surface outline-none transition focus:border-primary"
                          />
                        </label>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-full bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(link.id)}
                          className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-on transition-colors hover:bg-primary/95"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="flex min-w-0 items-center gap-4">
                        <span
                          draggable
                          onDragStart={(event) => handleDragStart(event, link.id)}
                          onDragEnd={() => {
                            setDraggedLinkId(null);
                            setDragOverLinkId(null);
                          }}
                          className="hidden cursor-grab rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container active:cursor-grabbing sm:inline-flex"
                          title="Drag to reorder"
                        >
                          <IconGrip />
                        </span>
                        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-on-surface">
                            {link.title}
                            {!link.isActive && <span className="text-on-surface-variant"> (Paused)</span>}
                          </h2>
                          <a
                            href={normalizeUrl(link.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-semibold text-on-surface hover:text-primary"
                          >
                            <span className="truncate">{link.url}</span>
                            <IconExternal className="h-4 w-4 flex-shrink-0" />
                          </a>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center justify-between gap-2 pl-[60px] sm:pl-0">
                        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 text-sm font-semibold text-on-surface">
                          <IconTarget className="h-4 w-4 text-primary" />
                          {(link.clicks ?? 0).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveLink(link.id, -1)}
                            disabled={index === 0}
                            className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-35"
                            title="Move up"
                          >
                            <IconArrowUp />
                          </button>
                          <button
                            onClick={() => handleMoveLink(link.id, 1)}
                            disabled={index === links.length - 1}
                            className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-35"
                            title="Move down"
                          >
                            <IconArrowDown />
                          </button>
                          <button
                            onClick={() => handleStartEdit(link)}
                            className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-container"
                            title="Edit link"
                          >
                            <IconEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="rounded-full p-2 text-error transition-colors hover:bg-error/10"
                            title="Delete link"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(link.id, link.isActive)}
                            className={`relative h-7 w-12 rounded-full transition-colors ${
                              link.isActive ? "bg-primary" : "bg-surface-container-highest"
                            }`}
                            title={link.isActive ? "Pause link" : "Resume link"}
                            aria-pressed={link.isActive}
                          >
                            <span
                              className={`absolute left-0 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                link.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <PreviewSidebar profile={profile} links={links} />
          </div>
        </div>
      </div>

      <AddLinkModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreatedLink}
      />
    </section>
  );
};

export default LinksPage;
