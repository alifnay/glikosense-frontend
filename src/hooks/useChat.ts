// src/hooks/useChat.ts
import { useState } from 'react';
import { type Message } from '../types/chat';

export function useChat() {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
        id: '1',
        role: 'assistant',
        content: 'Halo Alif! Saya siap bantu ngerjain skripsi. Mau bahas apa hari ini? 🤖',
        createdAt: new Date(),
        },
    ]);

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        // 1. Tambah chat user ke layar
        const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: input,
        createdAt: new Date()
        };
        
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // 2. Simulasi "Mikir" (Nanti diganti API Python di sini)
        setTimeout(() => {
        const botMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: 'Ini adalah respon dummy. Nanti kita sambungkan ke backend Python kamu untuk prediksi diabetes! 🐍',
            createdAt: new Date()
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        }, 1500);
    };

    return {
        input,
        setInput,
        messages,
        isLoading,
        sendMessage
    };
}