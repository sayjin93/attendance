'use client';

import "./AiAgentChat.scss";

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Chat, { Editing } from 'devextreme-react/chat';
import { Button } from 'devextreme-react/button';
import { Popover } from 'devextreme-react/popover';
import { List } from 'devextreme-react/list';
import { Popup } from 'devextreme-react/popup';
import type { Message, User, MessageEnteredEvent, MessageUpdatedEvent } from 'devextreme/ui/chat';

//#region Types
type ChatMessage = Message & {
    role?: 'user' | 'assistant' | 'system';
};

interface DbMessage {
    id: number;
    role: string;
    content: string;
    createdAt: string;
}

interface DbSession {
    id: number;
    title: string;
    messages: DbMessage[];
    updatedAt: string;
}

const assistant: User = {
    id: 'assistant',
    name: 'AI Assistant',
};

const currentUser: User = {
    id: 'user',
    name: 'You',
};
//#endregion

//#region constants
const WELCOME_TEXT =
    'Përshëndetje! Jam asistenti AI për sistemin e menaxhimit të prezencës. Mund të të ndihmoj me studentë, profesorë, klasa, lëndë, leksione, dhe regjistrin e prezencës.\n\nPyetni diçka si: "Sa mungesa ka studenti X?" ose "Nxirr listën NK për klasën Y"';

const initialMessages: ChatMessage[] = [
    {
        author: assistant,
        id: 'welcome',
        role: 'system',
        text: WELCOME_TEXT,
        timestamp: new Date(),
    },
];
//#endregion

//#region helper functions
function dbToChat(dbMessages: DbMessage[]): ChatMessage[] {
    return dbMessages.map((m) => ({
        author: m.role === 'user' ? currentUser : assistant,
        id: m.id,
        role: m.role as ChatMessage['role'],
        text: m.content,
        timestamp: new Date(m.createdAt),
    }));
}

function formatInline(text: string): React.ReactNode {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        if (match[2]) {
            parts.push(<strong key={key++}>{match[2]}</strong>);
        } else if (match[3]) {
            parts.push(<em key={key++}>{match[3]}</em>);
        } else if (match[4]) {
            parts.push(
                <code key={key++} className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs font-mono">
                    {match[4]}
                </code>
            );
        }
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
}

function FormattedContent({ content }: { content: string }) {
    const blocks = content.split(/\n\n+/);

    return (
        <div className="space-y-2">
            {blocks.map((block, blockIdx) => {
                const lines = block.split('\n');
                const listLines = lines.filter((l) => l.trim());
                const isBulletList =
                    listLines.length > 0 && listLines.every((l) => /^[-•*]\s/.test(l));
                const isNumberedList =
                    listLines.length > 0 && listLines.every((l) => /^\d+[.)]\s/.test(l));

                if (isBulletList) {
                    return (
                        <ul key={blockIdx} className="list-disc list-inside space-y-0.5 ml-1">
                            {listLines.map((line, i) => (
                                <li key={i}>{formatInline(line.replace(/^[-•*]\s/, ''))}</li>
                            ))}
                        </ul>
                    );
                }

                if (isNumberedList) {
                    return (
                        <ol key={blockIdx} className="list-decimal list-inside space-y-0.5 ml-1">
                            {listLines.map((line, i) => (
                                <li key={i}>{formatInline(line.replace(/^\d+[.)]\s/, ''))}</li>
                            ))}
                        </ol>
                    );
                }

                return (
                    <p key={blockIdx}>
                        {lines.map((line, i) => (
                            <Fragment key={i}>
                                {i > 0 && <br />}
                                {formatInline(line)}
                            </Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}

function renderMessage({ message }: { message?: Message }) {
    const text = (message as ChatMessage)?.text || '';
    return <FormattedContent content={text} />;
}

function generateChatTitle(message: string): string {
    const maxLength = 30;
    const cleaned = message.trim();
    return cleaned.length > maxLength ? `${cleaned.substring(0, maxLength)}...` : cleaned;
}
//#endregion

const AIAgentChat = () => {
    //#region states
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [chatHistory, setChatHistory] = useState<DbSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const [historyPopoverVisible, setHistoryPopoverVisible] = useState(false);
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    //#endregion

    //#region refs
    const historyButtonRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    //#endregion

    //#region Derived values
    const hasActiveChat = currentChatId !== null;
    //#endregion

    //#region Effects
    useEffect(() => {
        // Load chat history on mount

        fetch('/api/ai-chat/sessions')
            .then((res) => (res.ok ? res.json() : []))
            .then((sessions: DbSession[]) => setChatHistory(sessions))
            .catch(() => { });
    }, []);

    useEffect(() => {
        // Scroll chat to bottom when messages change or typing indicator appears
        const timer = setTimeout(() => {
            const scrollable = chatContainerRef.current?.querySelector('.dx-scrollable-container');
            if (scrollable) {
                scrollable.scrollTop = scrollable.scrollHeight;
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [messages, typingUsers]);
    //#endregion

    //#region functions
    const handleMessageEntered = useCallback(
        async (e: MessageEnteredEvent) => {
            const userMessage = e.message as ChatMessage;
            userMessage.role = 'user';
            const userText = userMessage.text || '';

            setMessages((prev) => [...prev, userMessage]);
            setTypingUsers([assistant]);

            try {
                // Call AI API
                const aiResponse = await fetch('/api/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messages
                            .map((m) => ({
                                role: m.role || (m.author?.id === 'user' ? 'user' : 'assistant'),
                                content: m.text || '',
                            }))
                            .concat([{ role: 'user', content: userText }]),
                    }),
                });

                if (!aiResponse.ok) throw new Error(`API error: ${aiResponse.status}`);

                const data = await aiResponse.json();

                const assistantMessage: ChatMessage = {
                    author: assistant,
                    id: Date.now(),
                    role: 'assistant',
                    text: data.response,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);

                // Persist to DB
                const newMessages = [
                    { role: 'user', content: userText },
                    { role: 'assistant', content: data.response },
                ];

                if (currentChatId) {
                    // Append to existing session
                    const res = await fetch(`/api/ai-chat/sessions/${currentChatId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ messages: newMessages }),
                    });
                    if (res.ok) {
                        const updated: DbSession = await res.json();
                        setChatHistory((prev) =>
                            prev.map((s) => (s.id === currentChatId ? updated : s))
                        );
                    }
                } else {
                    // Create new session — include the welcome system message
                    const allMessages = [
                        { role: 'system', content: WELCOME_TEXT },
                        ...newMessages,
                    ];
                    const title = generateChatTitle(userText);
                    const res = await fetch('/api/ai-chat/sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, messages: allMessages }),
                    });
                    if (res.ok) {
                        const created: DbSession = await res.json();
                        setCurrentChatId(created.id);
                        setChatHistory((prev) => [created, ...prev]);
                    }
                }
            } catch (error) {
                console.error('Error sending message:', error);
                const errorMessage: ChatMessage = {
                    author: assistant,
                    id: Date.now(),
                    role: 'assistant',
                    text: 'Na vjen keq, ndodhi një gabim gjatë përpunimit të kërkesës suaj. Ju lutem provoni përsëri.',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setTypingUsers([]);
            }
        },
        [currentChatId, messages]
    );

    const handleMessageUpdated = useCallback((e: MessageUpdatedEvent) => {
        setMessages((prev) =>
            prev.map((msg) => (msg.id === e.message.id ? { ...msg, text: e.text } : msg))
        );
    }, []);

    const handleHistoryToggle = useCallback(() => {
        setHistoryPopoverVisible((prev) => !prev);
    }, []);

    const handleHistoryItemClick = useCallback(
        (e: { itemData?: DbSession }) => {
            if (!e.itemData) return;
            setCurrentChatId(e.itemData.id);
            setMessages(dbToChat(e.itemData.messages));
            setHistoryPopoverVisible(false);
        },
        []
    );

    const handleNewChat = useCallback(() => {
        setCurrentChatId(null);
        setMessages(initialMessages);
    }, []);

    const handleDeleteChat = useCallback(() => {
        if (!hasActiveChat) return;
        setDeletePopupVisible(true);
    }, [hasActiveChat]);

    const confirmDeleteChat = useCallback(async () => {
        if (!currentChatId) return;
        try {
            await fetch(`/api/ai-chat/sessions/${currentChatId}`, { method: 'DELETE' });
            setChatHistory((prev) => prev.filter((s) => s.id !== currentChatId));
        } catch (error) {
            console.error('Error deleting session:', error);
        }
        setCurrentChatId(null);
        setMessages(initialMessages);
        setDeletePopupVisible(false);
    }, [currentChatId]);

    const renderHistoryItem = (item: DbSession) => (
        <div className="py-1">
            <span className="text-sm">{item.title}</span>
        </div>
    );
    //#endregion

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            AI Assistant
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Attendance Management
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div ref={historyButtonRef}>
                        <Button
                            hint="History"
                            icon="clock"
                            onClick={handleHistoryToggle}
                            stylingMode="text"
                        />
                    </div>
                    <Button
                        hint="New Chat"
                        icon="plus"
                        onClick={handleNewChat}
                        stylingMode="text"
                    />
                    <Button
                        disabled={!hasActiveChat}
                        hint="Delete Chat"
                        icon="trash"
                        onClick={handleDeleteChat}
                        stylingMode="text"
                    />
                </div>
            </div>

            {/* History Popover */}
            <Popover
                hideOnOutsideClick={true}
                onHiding={() => setHistoryPopoverVisible(false)}
                showTitle={true}
                target={historyButtonRef.current || undefined}
                title="History"
                visible={historyPopoverVisible}
                width={280}
            >
                {chatHistory.length > 0 ? (
                    <List
                        dataSource={chatHistory}
                        itemRender={renderHistoryItem}
                        onItemClick={handleHistoryItemClick as (e: { itemData?: unknown }) => void}
                    />
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Nuk ka histori bisedash.
                    </div>
                )}
            </Popover>

            {/* Delete Confirmation Popup */}
            <Popup
                visible={deletePopupVisible}
                onHiding={() => setDeletePopupVisible(false)}
                title="Konfirmo Fshirjen"
                showCloseButton={true}
                width={360}
                height="auto"
            >
                <div className="p-4">
                    <p className="text-sm mb-4">
                        Jeni i sigurt që dëshironi të fshini këtë bisedë? Ky veprim nuk mund të zhbëhet.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            text="Anulo"
                            stylingMode="outlined"
                            onClick={() => setDeletePopupVisible(false)}
                        />
                        <Button
                            text="Fshi"
                            type="danger"
                            stylingMode="contained"
                            onClick={confirmDeleteChat}
                        />
                    </div>
                </div>
            </Popup>

            {/* DevExtreme Chat */}
            <div className="flex-1 overflow-hidden" ref={chatContainerRef}>
                <Chat
                    className="ai-assistant"
                    items={messages}
                    messageRender={renderMessage}
                    onMessageEntered={handleMessageEntered}
                    onMessageUpdated={handleMessageUpdated}
                    showDayHeaders={true}
                    typingUsers={typingUsers}
                    user={currentUser}
                >
                    <Editing allowUpdating={true} />
                </Chat>
            </div>
        </div>
    );
}

export default AIAgentChat;