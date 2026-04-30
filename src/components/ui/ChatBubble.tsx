import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Import library markdown
import remarkGfm from 'remark-gfm'; // Import plugin support tabel/link
import { type Message } from '../../types/chat';

interface ChatBubbleProps {
    message: Message;
    }

    export default function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm 
            ${!isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-900 text-white'}`}>
            {!isUser ? <Bot size={20} /> : <User size={20} />}
        </div>

        {/* Bubble Content */}
        <div className={`relative max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm overflow-hidden
        ${isUser 
            ? 'bg-slate-900 text-white rounded-tr-none' 
            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
        }`}>
        
        {/* Render Markdown */}
        {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
            // ✅ PERBAIKAN: Bungkus ReactMarkdown dengan div
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 prose-pre:p-0">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({className, children, ...props}: any) {
                            return (
                                <code className={`${className} bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono text-xs`} {...props}>
                                    {children}
                                </code>
                            )
                        }
                    }}
                >
                    {message.content}
                </ReactMarkdown>
            </div>
        )}
    </div>
    </div>
    );
}