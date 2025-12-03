import AIAgentChat from '@/components/ai/AIAgentChat';

export default function AIAgentPage() {
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 overflow-hidden">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
                    {/* Info Banner */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg
                                className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    AI-Powered CRUD Operations
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    I can help you <strong>create lectures</strong>, <strong>mark attendance</strong>, <strong>delete records</strong>, and <strong>query data</strong> using natural language. 
                                    All operations respect your permissions and are logged for audit purposes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Component */}
                    <div className="flex-1 overflow-hidden">
                        <AIAgentChat />
                    </div>
                </div>
            </div>
        </div>
    );
}
