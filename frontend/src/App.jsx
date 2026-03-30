import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  loadTickets,
  loginUser,
  setError,
  submitTicketForAnalysis,
  updateTicketStatus
} from "./store/ticketsSlice";

const PRODUCTS = ["Dashboard", "API", "Billing Portal", "Mobile App", "Other"];
const STATUS_KEYS = {
  INCOMING: "incoming",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  ARCHIVED: "archived"
};
const AUTH_STORAGE_KEY = "support-auth-session";
const LOGIN_VIDEO_URL = "https://www.pexels.com/download/video/36291053/";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function countByStatus(items, getStatus) {
  return {
    total: items.length,
    inProgress: items.filter((item) => getStatus(item) === STATUS_KEYS.IN_PROGRESS).length,
    resolved: items.filter((item) => getStatus(item) === STATUS_KEYS.RESOLVED).length
  };
}

function TicketTable({
  title,
  tickets,
  loading,
  error,
  emptyLabel,
  showCustomer = true,
  showActions = false,
  onMove,
  onSelectTicket,
  onRetry,
  onClearError
}) {
  const colSpan = showCustomer ? (showActions ? 9 : 8) : (showActions ? 8 : 7);

  return (
    <section className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[18px] p-6 card-shadow overflow-hidden reveal-animation">
      <h2 className="text-xl font-bold mb-4 font-headline">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[13px] border-collapse">
          <thead>
            <tr className="text-[#576163] text-left border-b border-[#d4c5ad]">
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Time (UTC)</th>
              {showCustomer && <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Customer</th>}
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Product</th>
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Message</th>
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Category</th>
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Priority</th>
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Urgent</th>
              <th className="pb-3 pr-4 font-medium uppercase tracking-tighter">Keywords</th>
              {showActions && <th className="pb-3 pl-4 font-medium uppercase tracking-tighter">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4c5ad]/50">
            {error ? (
              <tr>
                <td colSpan={colSpan} className="py-6">
                  <div className="rounded-[12px] border border-[#f2c9b7] bg-[#fff3ec] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#9f2d2d]">Unable to load ticket data</p>
                      <p className="text-xs text-[#7d4d3b] mt-1">{error}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-3 py-1.5 rounded-[8px] text-xs bg-[#cc5a35] text-white"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={onClearError}
                        className="px-3 py-1.5 rounded-[8px] text-xs border border-[#d4c5ad] bg-white text-[#576163]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : loading ? (
              [...Array(3)].map((_, index) => (
                <tr key={`loading-row-${index}`} className="animate-pulse">
                  <td className="py-3 pr-4"><div className="h-3 w-20 bg-[#eadfcd] rounded"></div></td>
                  {showCustomer && (
                    <td className="py-3 pr-4">
                      <div className="h-3 w-24 bg-[#eadfcd] rounded mb-2"></div>
                      <div className="h-3 w-32 bg-[#f1e8d9] rounded"></div>
                    </td>
                  )}
                  <td className="py-3 pr-4"><div className="h-3 w-20 bg-[#eadfcd] rounded"></div></td>
                  <td className="py-3 pr-4"><div className="h-3 w-40 bg-[#eadfcd] rounded"></div></td>
                  <td className="py-3 pr-4"><div className="h-3 w-16 bg-[#eadfcd] rounded"></div></td>
                  <td className="py-3 pr-4"><div className="h-3 w-10 bg-[#eadfcd] rounded"></div></td>
                  <td className="py-3 pr-4"><div className="h-3 w-8 bg-[#eadfcd] rounded"></div></td>
                  <td className="py-3 pr-4"><div className="h-3 w-28 bg-[#eadfcd] rounded"></div></td>
                  {showActions && <td className="py-3 pl-4"><div className="h-6 w-28 bg-[#eadfcd] rounded"></div></td>}
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-8 text-center text-[#576163] italic">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                (() => {
                  const isSecurityTriggered = (ticket.signals || []).includes("custom_security_rule_triggered");
                  const currentStatus = ticket.status || STATUS_KEYS.INCOMING;
                  return (
                <tr
                  key={ticket.id}
                  className={`hover:bg-[#fcf7f1] hover:-translate-y-[1px] transition-all cursor-pointer ${
                    isSecurityTriggered ? "bg-[#fff0ef]" : ""
                  }`}
                  onClick={() => onSelectTicket?.(ticket)}
                >
                  <td className="py-3 pr-4 whitespace-nowrap">{ticket.createdAt}</td>
                  {showCustomer && (
                    <td className="py-3 pr-4">
                      <span className="block font-bold text-[#1f2a2c]">{ticket.customerName || "-"}</span>
                      <span className="text-[11px] text-[#576163]">{ticket.customerEmail || "-"}</span>
                    </td>
                  )}
                  <td className="py-3 pr-4">{ticket.product || "-"}</td>
                  <td
                    className={`py-3 pr-4 max-w-xs truncate ${isSecurityTriggered ? "text-[#9f2d2d] font-semibold" : ""}`}
                    title={ticket.message}
                  >
                    {ticket.message}
                  </td>
                  <td className="py-3 pr-4">{ticket.category}</td>
                  <td className="py-3 pr-4 font-bold">{ticket.priority}</td>
                  <td className="py-3 pr-4">{ticket.urgency ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4 text-[#576163]">{(ticket.keywords || []).join(", ")}</td>
                  {showActions && (
                    <td className="py-3 pl-4">
                      <div className="flex gap-2 text-[11px]">
                        {currentStatus === STATUS_KEYS.INCOMING && (
                          <>
                            <button
                              type="button"
                              className="px-2 py-1 rounded border border-[#d4c5ad] hover:bg-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMove(ticket.id, STATUS_KEYS.IN_PROGRESS);
                              }}
                            >
                              Start
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 rounded border border-[#d4c5ad] hover:bg-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMove(ticket.id, STATUS_KEYS.ARCHIVED);
                              }}
                            >
                              Archive
                            </button>
                          </>
                        )}

                        {currentStatus === STATUS_KEYS.IN_PROGRESS && (
                          <>
                            <button
                              type="button"
                              className="px-2 py-1 rounded border border-[#d4c5ad] hover:bg-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMove(ticket.id, STATUS_KEYS.RESOLVED);
                              }}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 rounded border border-[#d4c5ad] hover:bg-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMove(ticket.id, STATUS_KEYS.ARCHIVED);
                              }}
                            >
                              Archive
                            </button>
                          </>
                        )}

                        {currentStatus === STATUS_KEYS.RESOLVED && (
                          <span className="px-2 py-1 rounded border border-[#1f7a57]/40 text-[#1f7a57] bg-[#eef8f2]">
                            Completed
                          </span>
                        )}

                        {currentStatus === STATUS_KEYS.ARCHIVED && (
                          <span className="px-2 py-1 rounded border border-[#576163]/40 text-[#576163] bg-[#f3f4f4]">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                  );
                })()
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const {
    tickets,
    latestResult,
    loadingTickets,
    submitting,
    error
  } = useSelector((state) => state.tickets);

  const [authSession, setAuthSession] = useState(null);
  const [loginRole, setLoginRole] = useState("client");
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [isLoginVideoReady, setIsLoginVideoReady] = useState(false);
  const [isLoginVideoFailed, setIsLoginVideoFailed] = useState(false);
  const [isLoginLoaderMinTimeDone, setIsLoginLoaderMinTimeDone] = useState(false);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);

  function showToast(message, tone = "info") {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2400);
  }

  useEffect(() => {
    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawAuth) {
      setIsAuthHydrated(true);
      return;
    }

    try {
      setAuthSession(JSON.parse(rawAuth));
    } catch (_error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    setIsAuthHydrated(true);
  }, []);

  function getTicketScope(session = authSession) {
    if (session?.role === "client" && session.email) {
      return { customerEmail: normalizeEmail(session.email) };
    }
    return {};
  }

  useEffect(() => {
    if (!isAuthHydrated) {
      return;
    }
    dispatch(loadTickets(getTicketScope(authSession)));
  }, [dispatch, authSession, isAuthHydrated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoginLoaderMinTimeDone(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  function getTicketStatus(ticket) {
    return ticket.status || STATUS_KEYS.INCOMING;
  }

  function persistSession(session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuthSession(session);
  }

  async function handleLogin(event) {
    event.preventDefault();

    const action = await dispatch(
      loginUser({
        role: loginRole,
        name: loginName,
        email: loginEmail
      })
    );

    if (loginUser.fulfilled.match(action)) {
      persistSession(action.payload);
      await dispatch(loadTickets(getTicketScope(action.payload)));
      dispatch(clearError());
      showToast(`Signed in as ${action.payload.role}`, "success");
    }
  }

  function handleLogout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthSession(null);
    setLoginName("");
    setLoginEmail("");
    setMessage("");
    setProduct("");
    dispatch(clearError());
  }

  async function handleMove(ticketId, status) {
    const action = await dispatch(updateTicketStatus({ ticketId, status, reloadParams: getTicketScope(authSession) }));
    if (updateTicketStatus.fulfilled.match(action)) {
      showToast(`Ticket #${ticketId} moved to ${status.replace("_", " ")}`, "success");
    }
  }

  async function handleClientRequestSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      dispatch(setError("Please enter a support ticket message."));
      return;
    }

    if (!authSession || authSession.role !== "client") {
      dispatch(setError("Client session is required."));
      return;
    }

    dispatch(clearError());
    const actionResult = await dispatch(
      submitTicketForAnalysis({
        message,
        customerName: authSession.name,
        customerEmail: authSession.email,
        product,
        reloadParams: getTicketScope(authSession)
      })
    );

    if (submitTicketForAnalysis.fulfilled.match(actionResult)) {
      setMessage("");
      setProduct("");
      showToast("Ticket submitted and analyzed", "success");
    }
  }

  const adminFilteredTickets = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return tickets;
    }

    return tickets.filter((ticket) => {
      const searchable = [
        ticket.customerName,
        ticket.customerEmail,
        ticket.product,
        ticket.message,
        ticket.category,
        ticket.priority,
        ...(ticket.keywords || [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [tickets, searchText]);

  const allRequests = useMemo(() => {
    return adminFilteredTickets.filter((ticket) => {
      const status = getTicketStatus(ticket);
      if (status === STATUS_KEYS.ARCHIVED) {
        return false;
      }
      if (adminStatusFilter === "all") {
        return true;
      }
      return status === adminStatusFilter;
    });
  }, [adminFilteredTickets, adminStatusFilter]);

  const inProgressRequests = useMemo(() => {
    return adminFilteredTickets.filter((ticket) => getTicketStatus(ticket) === STATUS_KEYS.IN_PROGRESS);
  }, [adminFilteredTickets]);

  const resolvedRequests = useMemo(() => {
    return adminFilteredTickets.filter((ticket) => getTicketStatus(ticket) === STATUS_KEYS.RESOLVED);
  }, [adminFilteredTickets]);

  const archivedRequests = useMemo(() => {
    return adminFilteredTickets.filter((ticket) => getTicketStatus(ticket) === STATUS_KEYS.ARCHIVED);
  }, [adminFilteredTickets]);

  const clientTickets = useMemo(() => {
    if (!authSession || authSession.role !== "client") {
      return [];
    }
    const email = normalizeEmail(authSession.email);
    return tickets.filter((ticket) => normalizeEmail(ticket.customerEmail) === email);
  }, [tickets, authSession]);

  const clientCounts = useMemo(() => countByStatus(clientTickets, getTicketStatus), [clientTickets]);
  const adminCounts = useMemo(() => countByStatus(tickets, getTicketStatus), [tickets]);
  const latestClientResult = useMemo(() => {
    if (!authSession || authSession.role !== "client") {
      return latestResult;
    }
    return clientTickets[0] || null;
  }, [authSession, latestResult, clientTickets]);
  const isLatestSecurityTriggered = Boolean(
    latestClientResult && (latestClientResult.signals || []).includes("custom_security_rule_triggered")
  );

  if (!authSession) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {!isLoginVideoFailed && (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setIsLoginVideoReady(true)}
            onError={() => {
              setIsLoginVideoFailed(true);
            }}
          >
            <source src={LOGIN_VIDEO_URL} type="video/mp4" />
          </video>
        )}
        {isLoginVideoFailed && (
          <div className="absolute inset-0 digital-curator-gradient"></div>
        )}
        <div className="absolute inset-0 bg-[#1f2a2c]/45"></div>
        {(!isLoginVideoFailed && (!isLoginVideoReady || !isLoginLoaderMinTimeDone)) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-[#fff9f0]/95 border border-[#d4c5ad] rounded-[14px] px-5 py-4 flex items-center gap-3 card-shadow">
              <span className="w-5 h-5 rounded-full border-2 border-[#d4c5ad] border-t-[#a03a18] animate-spin"></span>
              <span className="text-sm text-[#576163] font-body">Loading login experience...</span>
            </div>
          </div>
        )}
        <section className="relative z-10 w-full max-w-md bg-[#fff9f0]/95 border border-[#d4c5ad] rounded-[18px] p-7 card-shadow reveal-animation backdrop-blur-sm">
          <h1 className="text-3xl font-bold tracking-tight font-headline text-[#1f2a2c]">Support Access</h1>
          <p className="text-[#576163] mt-2 font-body">Sign in to continue as Client or Admin.</p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 rounded-[10px] border text-sm font-headline ${
                  loginRole === "client"
                    ? "bg-[#a03a18] text-white border-[#a03a18]"
                    : "bg-white text-[#576163] border-[#d4c5ad]"
                }`}
                onClick={() => setLoginRole("client")}
              >
                Client
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-[10px] border text-sm font-headline ${
                  loginRole === "admin"
                    ? "bg-[#a03a18] text-white border-[#a03a18]"
                    : "bg-white text-[#576163] border-[#d4c5ad]"
                }`}
                onClick={() => setLoginRole("admin")}
              >
                Admin
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#576163] uppercase tracking-wider font-headline">Name</label>
              <input
                type="text"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                placeholder="Enter your name"
                className="w-full border border-[#d4c5ad] rounded-[12px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#cc5a35]/20 focus:border-[#cc5a35] outline-none transition-all font-body"
              />
            </div>

            {loginRole === "client" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#576163] uppercase tracking-wider font-headline">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-[#d4c5ad] rounded-[12px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#cc5a35]/20 focus:border-[#cc5a35] outline-none transition-all font-body"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#cc5a35] text-white font-bold py-3 rounded-[12px] hover:bg-[#b84a27] active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={submitting || loadingTickets}
            >
              {submitting ? "Authenticating..." : "Continue"}
            </button>
            {error && <p className="text-[#9f2d2d] text-sm">{error}</p>}
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen digital-curator-gradient">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 bg-[#fff8f0]/80 backdrop-blur-md border-b border-[#d4c5ad]/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline text-[#1f2a2c]">Support Operations Console</h1>
          <p className="text-[#576163] font-body text-sm mt-1">
            {authSession.role === "admin" ? "Admin View" : "Client View"} | Signed in as {authSession.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-[10px] border border-[#d4c5ad] text-[#576163] hover:bg-white text-sm"
            onClick={() => dispatch(loadTickets(getTicketScope(authSession)))}
          >
            Reload
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-[10px] bg-[#a03a18] text-white text-sm font-semibold"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="px-6 py-7">
        <div className="max-w-7xl mx-auto space-y-7">
          {authSession.role === "client" ? (
            <>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 reveal-animation">
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">My Tickets</div>
                  <div className="text-3xl font-bold text-[#1f2a2c] mt-2">{clientCounts.total}</div>
                  <div className="h-1.5 rounded-full bg-[#eadfcd] mt-3 overflow-hidden">
                    <div className="h-full bg-[#a03a18] rounded-full transition-all" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">In Progress</div>
                  <div className="text-3xl font-bold text-[#d97018] mt-2">{clientCounts.inProgress}</div>
                  <div className="h-1.5 rounded-full bg-[#eadfcd] mt-3 overflow-hidden">
                    <div className="h-full bg-[#d97018] rounded-full transition-all" style={{ width: `${clientCounts.total ? (clientCounts.inProgress / clientCounts.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">Resolved</div>
                  <div className="text-3xl font-bold text-[#1f7a57] mt-2">{clientCounts.resolved}</div>
                  <div className="h-1.5 rounded-full bg-[#eadfcd] mt-3 overflow-hidden">
                    <div className="h-full bg-[#1f7a57] rounded-full transition-all" style={{ width: `${clientCounts.total ? (clientCounts.resolved / clientCounts.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                <section className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[18px] p-6 card-shadow reveal-animation">
                  <h2 className="text-xl font-bold mb-5 font-headline">Create New Ticket</h2>
                  <form onSubmit={handleClientRequestSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#576163] uppercase tracking-wider font-headline">Product</label>
                      <select
                        className="w-full border border-[#d4c5ad] rounded-[12px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#cc5a35]/20 focus:border-[#cc5a35] outline-none transition-all bg-white font-body"
                        value={product}
                        onChange={(event) => setProduct(event.target.value)}
                      >
                        <option value="" disabled>Select a product...</option>
                        {PRODUCTS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#576163] uppercase tracking-wider font-headline">Issue Description</label>
                      <textarea
                        className="w-full border border-[#d4c5ad] rounded-[12px] px-4 py-2.5 text-sm min-h-[140px] focus:ring-2 focus:ring-[#cc5a35]/20 focus:border-[#cc5a35] outline-none transition-all resize-none font-body"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Describe the issue in detail..."
                      />
                    </div>
                    <button
                      className="w-full bg-[#cc5a35] text-white font-bold py-3 rounded-[12px] hover:bg-[#b84a27] active:scale-[0.98] transition-all disabled:opacity-50"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </button>
                    {error && <p className="text-[#9f2d2d] text-sm">{error}</p>}
                  </form>
                </section>

                <section className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[18px] p-6 card-shadow flex flex-col reveal-animation">
                  <h2 className="text-xl font-bold mb-5 font-headline">Latest Ticket Analysis</h2>
                  {!latestClientResult ? (
                    submitting ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-full max-w-sm rounded-[12px] border border-[#d4c5ad] bg-white p-4 animate-pulse space-y-3">
                          <div className="h-3 w-32 bg-[#eadfcd] rounded"></div>
                          <div className="h-3 w-24 bg-[#eadfcd] rounded"></div>
                          <div className="h-3 w-40 bg-[#f1e8d9] rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-[#576163] text-sm italic font-body">
                        Submit a ticket to see analysis details.
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className={`bg-white border rounded-[12px] p-4 space-y-3 font-body ${
                        isLatestSecurityTriggered ? "border-[#e08f8f] bg-[#fff3f3]" : "border-[#d4c5ad]"
                      }`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className={`rounded-[10px] border border-[#d4c5ad] p-3 p${latestClientResult.priority.replace(/\D/g, "")}-border`}>
                            <strong className="block text-[10px] uppercase text-[#576163] font-headline">Priority</strong>
                            <span className="font-bold">{latestClientResult.priority}</span>
                          </div>
                          <div className="rounded-[10px] border border-[#d4c5ad] p-3">
                            <strong className="block text-[10px] uppercase text-[#576163] font-headline">Category</strong>
                            <span className="font-bold">{latestClientResult.category}</span>
                          </div>
                          <div className="rounded-[10px] border border-[#d4c5ad] p-3">
                            <strong className="block text-[10px] uppercase text-[#576163] font-headline">Confidence</strong>
                            <span className="font-bold">{latestClientResult.confidence}</span>
                          </div>
                        </div>
                        <div className={`text-sm ${isLatestSecurityTriggered ? "text-[#7a2f2f]" : "text-[#576163]"}`}>
                          <strong className="text-[#1f2a2c]">Signals:</strong> {(latestClientResult.signals || []).join(", ") || "None detected"}
                        </div>
                        {isLatestSecurityTriggered && (
                          <div className="text-xs font-semibold text-[#9f2d2d] uppercase tracking-wide">
                            Security escalation rule triggered
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(latestClientResult.keywords || []).map((keyword) => (
                          <span key={keyword} className="bg-[#f2c9b7] text-[#66341f] px-3 py-1 rounded-full text-xs font-medium font-body">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </section>

              <TicketTable
                title="My Tickets"
                tickets={clientTickets.filter((ticket) => getTicketStatus(ticket) !== STATUS_KEYS.ARCHIVED)}
                loading={loadingTickets}
                error={error}
                emptyLabel="No tickets created by you yet."
                showCustomer={false}
                onSelectTicket={setSelectedTicket}
                onRetry={() => dispatch(loadTickets(getTicketScope(authSession)))}
                onClearError={() => dispatch(clearError())}
              />
            </>
          ) : (
            <>
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 reveal-animation">
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">All Client Tickets</div>
                  <div className="text-3xl font-bold text-[#1f2a2c] mt-2">{adminCounts.total}</div>
                </div>
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">All In Progress</div>
                  <div className="text-3xl font-bold text-[#d97018] mt-2">{adminCounts.inProgress}</div>
                </div>
                <div className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[14px] p-5 card-shadow">
                  <div className="text-[10px] uppercase text-[#576163] font-headline">All Resolved</div>
                  <div className="text-3xl font-bold text-[#1f7a57] mt-2">{adminCounts.resolved}</div>
                </div>
              </section>

              <section className="bg-[#fff9f0] border border-[#d4c5ad] rounded-[18px] p-6 card-shadow reveal-animation">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2 className="text-xl font-bold font-headline">Admin Filters</h2>
                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <input
                      className="w-full md:w-80 border border-[#d4c5ad] rounded-[12px] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#cc5a35]/20 focus:border-[#cc5a35] outline-none transition-all font-body"
                      type="text"
                      placeholder="Search by client, message, product, keyword..."
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                    />
                    <div className="flex gap-2">
                      {[
                        { key: "all", label: "All" },
                        { key: STATUS_KEYS.IN_PROGRESS, label: "In Progress" },
                        { key: STATUS_KEYS.RESOLVED, label: "Resolved" },
                        { key: STATUS_KEYS.INCOMING, label: "Incoming" }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setAdminStatusFilter(item.key)}
                          className={`px-3 py-2 rounded-[10px] text-xs border transition-all ${
                            adminStatusFilter === item.key
                              ? "bg-[#a03a18] text-white border-[#a03a18]"
                              : "bg-white text-[#576163] border-[#d4c5ad]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <TicketTable
                title="All Client Tickets"
                tickets={allRequests}
                loading={loadingTickets}
                error={error}
                emptyLabel="No client tickets found."
                showCustomer={true}
                showActions={true}
                onMove={handleMove}
                onSelectTicket={setSelectedTicket}
                onRetry={() => dispatch(loadTickets(getTicketScope(authSession)))}
                onClearError={() => dispatch(clearError())}
              />

              <TicketTable
                title="In Progress Tickets (All Clients)"
                tickets={inProgressRequests}
                loading={loadingTickets}
                error={error}
                emptyLabel="No tickets are currently in progress."
                showCustomer={true}
                showActions={true}
                onMove={handleMove}
                onSelectTicket={setSelectedTicket}
                onRetry={() => dispatch(loadTickets(getTicketScope(authSession)))}
                onClearError={() => dispatch(clearError())}
              />

              <TicketTable
                title="Resolved Tickets (All Clients)"
                tickets={resolvedRequests}
                loading={loadingTickets}
                error={error}
                emptyLabel="No resolved tickets found."
                showCustomer={true}
                showActions={true}
                onMove={handleMove}
                onSelectTicket={setSelectedTicket}
                onRetry={() => dispatch(loadTickets(getTicketScope(authSession)))}
                onClearError={() => dispatch(clearError())}
              />

              <TicketTable
                title="Archived Tickets (All Clients)"
                tickets={archivedRequests}
                loading={loadingTickets}
                error={error}
                emptyLabel="No archived tickets found."
                showCustomer={true}
                showActions={true}
                onMove={handleMove}
                onSelectTicket={setSelectedTicket}
                onRetry={() => dispatch(loadTickets(getTicketScope(authSession)))}
                onClearError={() => dispatch(clearError())}
              />
            </>
          )}
        </div>
      </main>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1f2a2c]/45" onClick={() => setSelectedTicket(null)}></div>
          <section className="relative w-full max-w-2xl bg-[#fff9f0] border border-[#d4c5ad] rounded-[18px] p-6 card-shadow reveal-animation">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold font-headline text-[#1f2a2c]">Ticket #{selectedTicket.id}</h3>
                <p className="text-xs text-[#576163] mt-1">{selectedTicket.createdAt}</p>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-[10px] border border-[#d4c5ad] text-[#576163] hover:bg-white"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white border border-[#d4c5ad] rounded-[10px] p-3">
                <div className="text-[10px] uppercase text-[#576163]">Category</div>
                <div className="font-semibold">{selectedTicket.category}</div>
              </div>
              <div className="bg-white border border-[#d4c5ad] rounded-[10px] p-3">
                <div className="text-[10px] uppercase text-[#576163]">Priority</div>
                <div className="font-semibold">{selectedTicket.priority}</div>
              </div>
              <div className="bg-white border border-[#d4c5ad] rounded-[10px] p-3">
                <div className="text-[10px] uppercase text-[#576163]">Status</div>
                <div className="font-semibold">{getTicketStatus(selectedTicket).replace("_", " ")}</div>
              </div>
              <div className="bg-white border border-[#d4c5ad] rounded-[10px] p-3">
                <div className="text-[10px] uppercase text-[#576163]">Confidence</div>
                <div className="font-semibold">{selectedTicket.confidence}</div>
              </div>
            </div>
            <div className={`mt-4 bg-white border rounded-[12px] p-4 ${
              (selectedTicket.signals || []).includes("custom_security_rule_triggered")
                ? "border-[#e08f8f] bg-[#fff3f3]"
                : "border-[#d4c5ad]"
            }`}>
              <p className="text-[10px] uppercase text-[#576163] mb-1">Message</p>
              <p className={`text-sm leading-relaxed ${(selectedTicket.signals || []).includes("custom_security_rule_triggered") ? "text-[#9f2d2d] font-semibold" : "text-[#1f2a2c]"}`}>
                {selectedTicket.message}
              </p>
            </div>
            <div className="mt-4 text-sm text-[#576163]">
              <strong className="text-[#1f2a2c]">Signals:</strong> {(selectedTicket.signals || []).join(", ") || "None detected"}
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 reveal-animation">
          <div className={`rounded-[12px] px-4 py-3 text-sm text-white shadow-lg ${toast.tone === "success" ? "bg-[#1f7a57]" : "bg-[#1f2a2c]"}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
