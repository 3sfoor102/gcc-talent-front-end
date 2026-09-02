import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "react-router"
import {
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    startConversation,
} from "../services/messages-service"
import { uploadToCloudinary } from "../services/upload-service"

const MessagesPage = ({ user }) => {
    const [searchParams] = useSearchParams()
    const targetRecipientId = searchParams.get("userId")
    const targetJobId = searchParams.get("jobId")

    const [conversations, setConversations] = useState([])
    const [activeConversation, setActiveConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [messageText, setMessageText] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const [chatError, setChatError] = useState(null)

    const messagesEndRef = useRef(null)
    const currentUserId = user?._id || user?.id || user?.userId

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Auto-dismiss in-app notification banner after 4 seconds
    useEffect(() => {
        if (!chatError) return
        const timer = setTimeout(() => setChatError(null), 4000)
        return () => clearTimeout(timer)
    }, [chatError])

    useEffect(() => {
        const pollInbox = async () => {
            try {
                const convList = await getConversations();
                if (Array.isArray(convList)) {
                    setConversations(convList);
                }
            } catch (err) {
                console.error("Failed to poll conversations:", err);
            }
        };

        const interval = setInterval(pollInbox, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const initInbox = async () => {
            try {
                setLoading(true)
                let convList = await getConversations()
                if (!Array.isArray(convList)) convList = []

                if (targetRecipientId && targetRecipientId !== currentUserId) {
                    const existing = convList.find((c) =>
                        c.participants?.some(
                            (p) => (p._id || p).toString() === targetRecipientId.toString()
                        )
                    )

                    if (existing) {
                        setActiveConversation(existing)
                    } else {
                        const context = targetJobId ? { job: targetJobId } : {}
                        const created = await startConversation(targetRecipientId, context)
                        convList = [created, ...convList]
                        setActiveConversation(created)
                    }
                } else if (window.innerWidth >= 768 && convList.length > 0) {
                    setActiveConversation(convList[0])
                }

                setConversations(convList)
            } catch (err) {
                console.error("Failed to initialize inbox:", err)
            } finally {
                setLoading(false)
            }
        }

        if (currentUserId) initInbox()
    }, [targetRecipientId, targetJobId, currentUserId])

    useEffect(() => {
        if (!activeConversation?._id) return

        const fetchThread = async () => {
            try {
                const data = await getMessages(activeConversation._id)
                setMessages(data || [])
                await markAsRead(activeConversation._id)
            } catch (err) {
                console.error("Failed to load thread messages:", err)
            }
        }

        fetchThread()
        const interval = setInterval(fetchThread, 2000)

        return () => clearInterval(interval)
    }, [activeConversation?._id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e?.preventDefault()
        setChatError(null)

        const textToSend = messageText.trim()
        if (!textToSend || sending || !activeConversation?._id) return

        setMessageText("")
        setSending(true)

        try {
            const newMsg = await sendMessage(activeConversation._id, {
                text: textToSend,
            })
            setMessages((prev) => [...prev, newMsg])
        } catch (err) {
            setChatError(err.response?.data?.error?.message || err.message || "Failed to send message.")
            setMessageText(textToSend)
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !activeConversation?._id) return

        // Logical Restriction: File size limit (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setChatError("Attachment size cannot exceed 10MB.")
            e.target.value = ""
            return
        }

        setUploadingFile(true)
        setChatError(null)
        try {
            const uploadRes = await uploadToCloudinary(file)
            const newMsg = await sendMessage(activeConversation._id, {
                text: file.name,
                attachments: [{ url: uploadRes.url, name: file.name }],
            })
            setMessages((prev) => [...prev, newMsg])
        } catch (err) {
            setChatError(err.response?.data?.error?.message || err.message || "File upload failed.")
        } finally {
            setUploadingFile(false)
            e.target.value = ""
        }
    }

    const getOtherParticipant = (conv) => {
        return (
            conv?.participants?.find(
                (p) => (p._id || p).toString() !== currentUserId?.toString()
            ) || { name: "Participant" }
        )
    }

    const filteredConversations = conversations.filter((conv) => {
        const other = getOtherParticipant(conv)
        return other.name?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-[16px] text-teal-600 animate-pulse font-medium">
                    Loading conversations...
                </p>
            </div>
        )
    }

    const activePartner = activeConversation
        ? getOtherParticipant(activeConversation)
        : null

    return (
        <main
            className="flex-grow flex overflow-hidden w-full max-w-[1280px] mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 gap-6 relative"
            style={{ height: "calc(100vh - 80px)" }}
        >
            <aside
                className={`${activeConversation ? "hidden md:flex" : "flex"
                    } w-full md:w-80 flex-shrink-0 flex-col bg-white rounded-xl border border-cream-200 shadow-xs overflow-hidden`}
            >
                <div className="p-4 border-b border-cream-200 bg-white">
                    <h2 className="font-semibold text-xl text-ink mb-4">Messages</h2>
                    <div className="relative w-full">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search conversations"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#f4f7f6] border border-cream-200 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal focus:border-brand-teal transition-all text-ink placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar divide-y divide-cream-100">
                    {filteredConversations.length === 0 ? (
                        <p className="p-4 text-xs text-gray-400 italic">
                            No conversations found.
                        </p>
                    ) : (
                        filteredConversations.map((conv) => {
                            const partner = getOtherParticipant(conv);
                            const isActive = activeConversation?._id === conv._id;

                            let unreadCount = 0;
                            if (conv.unread) {
                                if (conv.unread instanceof Map) {
                                    unreadCount = conv.unread.get(currentUserId?.toString()) || 0;
                                } else if (typeof conv.unread === 'object') {
                                    unreadCount = conv.unread[currentUserId?.toString()] || 0;
                                }
                            }

                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => {
                                        setActiveConversation(conv);
                                        if (conv.unread) {
                                            if (conv.unread instanceof Map) conv.unread.set(currentUserId?.toString(), 0);
                                            else conv.unread[currentUserId?.toString()] = 0;
                                        }
                                    }}
                                    className={`flex items-center gap-3 p-4 border-l-4 cursor-pointer transition-colors ${isActive
                                        ? "bg-brand-cream/60 border-brand-teal"
                                        : "border-transparent hover:bg-brand-cream/20"
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-200 flex items-center justify-center text-brand-teal font-bold text-base border border-cream-200">
                                            {partner.avatarUrl ? (
                                                <img
                                                    src={partner.avatarUrl}
                                                    alt={partner.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                partner.name?.charAt(0).toUpperCase() || "U"
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span
                                                className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-ink" : isActive ? "font-bold text-ink" : "font-medium text-ink"
                                                    }`}
                                            >
                                                {partner.name || "User"}
                                            </span>
                                            {conv.lastMessage?.at && (
                                                <span
                                                    className={`text-[11px] ${unreadCount > 0 ? "font-bold text-brand-teal" : "text-gray-400"
                                                        }`}
                                                >
                                                    {new Date(conv.lastMessage.at).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                            <p
                                                className={`text-xs truncate mb-0 ${unreadCount > 0 ? "font-semibold text-ink" : "text-gray-500"
                                                    }`}
                                            >
                                                {conv.lastMessage?.text || "Conversation started"}
                                            </p>

                                            {unreadCount > 0 && (
                                                <span className="shrink-0 bg-brand-teal text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                                                    {unreadCount > 9 ? "9+" : unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            <section
                className={`${activeConversation ? "flex" : "hidden md:flex"
                    } flex-grow flex-col bg-white rounded-xl border border-cream-200 shadow-xs overflow-hidden w-full relative`}
            >
                {activeConversation && activePartner ? (
                    <>
                        <header className="p-3.5 sm:p-4 border-b border-cream-200 bg-white flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-1 -ml-1 text-gray-500 hover:text-brand-teal cursor-pointer bg-transparent border-0 flex items-center"
                                    aria-label="Back to conversations"
                                >
                                    <span className="material-symbols-outlined text-2xl">
                                        arrow_back
                                    </span>
                                </button>

                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-cream-200 flex items-center justify-center text-brand-teal font-bold text-sm border border-cream-200">
                                        {activePartner.avatarUrl ? (
                                            <img
                                                src={activePartner.avatarUrl}
                                                alt={activePartner.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            activePartner.name?.charAt(0).toUpperCase() || "U"
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-ink leading-tight m-0">
                                        {activePartner.name}
                                    </h3>
                                    <p className="text-[11px] text-brand-teal font-medium mt-0.5 m-0">
                                        {activeConversation.context?.job?.title
                                            ? `Job: ${activeConversation.context.job.title}`
                                            : "Direct Message"}
                                    </p>
                                </div>
                            </div>
                        </header>

                        {/* In-App Notification Toast */}
                        {chatError && (
                            <div className="absolute top-16 left-4 right-4 z-20 p-3 bg-red-50 text-brand-danger text-xs rounded-lg border border-red-200 shadow-sm flex items-center justify-between animate-fadeIn">
                                <span>{chatError}</span>
                                <button
                                    type="button"
                                    onClick={() => setChatError(null)}
                                    className="text-brand-danger font-bold text-xs bg-transparent border-0 cursor-pointer p-0"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex-grow p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZjBmY2ZkIiAvPgo8Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0iI2Q5ZTVlNiIgLz4KPC9zdmc+')] bg-repeat">
                            <div className="flex justify-center w-full my-1">
                                <span className="bg-[#e4eff0] text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full shadow-2xs">
                                    Today
                                </span>
                            </div>

                            {messages.map((msg, index) => {
                                const isMine =
                                    (msg.sender?._id || msg.sender).toString() === currentUserId?.toString()
                                const senderPartner = isMine ? user : activePartner

                                const recipientId = activePartner?._id || activePartner?.id
                                const isReadByRecipient =
                                    Array.isArray(msg.readBy) &&
                                    msg.readBy.some((r) => (r?._id || r).toString() === recipientId?.toString())

                                return (
                                    <div
                                        key={msg._id || index}
                                        className={`flex gap-2 sm:gap-3 max-w-[88%] sm:max-w-[80%] ${isMine ? "self-end flex-row-reverse" : "self-start"
                                            }`}
                                    >
                                        {!isMine && (
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-cream-200 flex items-center justify-center text-brand-teal font-bold text-xs shrink-0 mt-auto border border-cream-200">
                                                {senderPartner?.avatarUrl ? (
                                                    <img
                                                        src={senderPartner.avatarUrl}
                                                        alt={senderPartner.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    senderPartner?.name?.charAt(0).toUpperCase() || "U"
                                                )}
                                            </div>
                                        )}

                                        <div
                                            className={`flex flex-col gap-1 ${isMine ? "items-end" : "items-start"
                                                }`}
                                        >
                                            <div
                                                className={`p-3 sm:p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-2xs whitespace-pre-line ${isMine
                                                    ? "bg-brand-teal text-white rounded-br-xs"
                                                    : "bg-[#eaf4f5] text-ink border border-cream-200/60 rounded-bl-xs"
                                                    }`}
                                            >
                                                {msg.text}

                                                {msg.attachments?.length > 0 && (
                                                    <div className="mt-2 space-y-2">
                                                        {msg.attachments.map((att, attIdx) => (
                                                            <a
                                                                key={attIdx}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs no-underline transition-colors max-w-full sm:w-64 ${isMine
                                                                    ? "bg-teal-900/40 border-teal-700 text-white hover:bg-teal-900/60"
                                                                    : "bg-white border-cream-200 text-ink hover:bg-brand-cream/30"
                                                                    }`}
                                                            >
                                                                <div
                                                                    className={`p-1.5 rounded flex items-center justify-center ${isMine
                                                                        ? "bg-teal-800 text-white"
                                                                        : "bg-brand-cream text-brand-teal"
                                                                        }`}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">
                                                                        description
                                                                    </span>
                                                                </div>
                                                                <div className="flex-grow overflow-hidden text-left">
                                                                    <p className="font-semibold truncate mb-0">
                                                                        {att.name || "Attachment"}
                                                                    </p>
                                                                    <p className="text-[10px] opacity-75 mb-0">
                                                                        Click to view
                                                                    </p>
                                                                </div>
                                                                <span className="material-symbols-outlined text-[18px] opacity-75">
                                                                    download
                                                                </span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 px-1">
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                {isMine && (
                                                    <span
                                                        className={`material-symbols-outlined text-[15px] ${isReadByRecipient ? "text-brand-teal font-semibold" : "text-gray-400"
                                                            }`}
                                                        title={isReadByRecipient ? "Read" : "Sent"}
                                                    >
                                                        {isReadByRecipient ? "done_all" : "check"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div ref={messagesEndRef} />
                        </div>

                        <footer className="p-3 sm:p-4 border-t border-cream-200 bg-white flex-shrink-0">
                            <form
                                onSubmit={handleSend}
                                className="flex items-end gap-2 bg-[#f4f7f6] border border-cream-200 rounded-xl p-1.5 sm:p-2 focus-within:border-brand-teal focus-within:ring-1 focus-within:ring-brand-teal transition-all"
                            >
                                <label className="p-1.5 sm:p-2 text-gray-500 hover:text-brand-teal transition-colors rounded-full shrink-0 cursor-pointer">
                                    <span className="material-symbols-outlined text-xl">
                                        attach_file
                                    </span>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={uploadingFile}
                                        className="hidden"
                                    />
                                </label>

                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        uploadingFile ? "Uploading file..." : "Type a message..."
                                    }
                                    rows={1}
                                    disabled={uploadingFile}
                                    className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[38px] py-2 text-xs sm:text-sm text-ink placeholder:text-gray-400 outline-none"
                                />

                                <button
                                    type="submit"
                                    disabled={sending || uploadingFile || !messageText.trim()}
                                    className="p-2 sm:p-2.5 bg-brand-teal text-white rounded-full hover:bg-teal-900 transition-opacity shrink-0 flex items-center justify-center disabled:opacity-40 cursor-pointer border-0"
                                >
                                    <span
                                        className="material-symbols-outlined text-base sm:text-lg"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        send
                                    </span>
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">
                            chat
                        </span>
                        <p className="text-sm m-0">Select a conversation to start chatting.</p>
                    </div>
                )}
            </section>
        </main>
    )
}

export default MessagesPage