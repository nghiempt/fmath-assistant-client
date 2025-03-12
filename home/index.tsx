"use client"

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, Loader, PaperclipIcon } from 'lucide-react';
import {
  Avatar,
  AvatarImage,
} from "@/components/ui/avatar"
import { CONSTANT } from '@/utils/constant';
import OpenAI from 'openai';
import { IMAGES } from '@/utils/image';
import { ROUTES } from '@/utils/route';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const sampleQuestions: any = [
  {
    title: "Xác suất cơ bản",
    subtitle: "Giải thích công thức xác suất cơ bản và cách áp dụng vào bài toán thực tế?"
  },
  {
    title: "Phân phối xác suất",
    subtitle: "Phân phối chuẩn là gì và các ứng dụng của nó trong thống kê?"
  },
  {
    title: "Biến ngẫu nhiên",
    subtitle: "Sự khác biệt giữa biến ngẫu nhiên rời rạc và liên tục là gì?"
  },
  {
    title: "Định lý giới hạn trung tâm",
    subtitle: "Giải thích ý nghĩa và áp dụng của định lý giới hạn trung tâm?"
  }
];

const MessageComponent = ({ message }: { message: any }) => {
  return (
    <div className={`flex ${message.role === 'human' ? 'justify-end' : 'justify-start gap-4'} mb-4`}>
      {message.role === 'human'
        ?
        null
        :
        <Avatar className='mt-8 border border-blue-900 p-2'>
          <AvatarImage src={IMAGES.CHATBOT} alt="@shadcn" />
        </Avatar>
      }
      <div className={`max-w-[80%] rounded-lg ${message.role === 'human'
        ? 'bg-gray-100 text-gray-800 p-4'
        : 'bg-white text-gray-800 py-4'
        }`}>
        {message.role === 'human'
          ?
          <div>{message.text}</div>
          :
          <div className="prose prose-sm md:prose max-w-none overflow-x-auto">
            <ReactMarkdown
              className="markdown-content"
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        }
      </div>
    </div>
  );
};

export default function ChatClient() {
  const [state, setState] = useState<any>({
    messages: [],
    isLoading: false,
    input: '',
    conversationId: CONSTANT.CHAT.CONVERSATION_ID,
    lastMessageId: null
  });
  const [streamLoading, setStreamLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  const addMessage = (message: any) => {
    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const updateLastMessage = (text: string) => {
    setState((prev: any) => {
      const newMessages = [...prev.messages];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          text
        };
      }
      return {
        ...prev,
        messages: newMessages
      };
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setStreamLoading(true);
    setState((prev: any) => ({ ...prev, input: '' }));

    const messageId = crypto.randomUUID();
    const parentMessageId = state.lastMessageId || '00000000-0000-0000-0000-000000000000';

    const userMessage: any = {
      text,
      role: 'human',
      messageId,
      parentMessageId,
      conversationId: state.conversationId || undefined
    };

    addMessage(userMessage);

    try {
      const openaiMessages = state.messages.map((msg: any) => ({
        role: msg.role === 'human' ? 'user' : 'assistant',
        content: msg.text
      }));

      openaiMessages.push({
        role: 'user',
        content: text
      });

      const aiMessageId = crypto.randomUUID();
      addMessage({
        text: '',
        role: 'ai',
        messageId: aiMessageId,
        parentMessageId: messageId,
        conversationId: state.conversationId
      });

      setStreamLoading(false);

      openaiMessages.unshift({
        role: 'system',
        content: 'Bạn là một trợ lý giáo dục chuyên về toán và xác suất. Khi đưa ra các công thức, hãy định dạng chúng bằng LaTeX với cú pháp Markdown. Sử dụng $...$ cho công thức inline và $$...$$ cho công thức block. Đảm bảo rằng các công thức toán học được viết chính xác.'
      });

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: openaiMessages,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          updateLastMessage(fullResponse);
        }
      }

      setState((prev: any) => ({
        ...prev,
        conversationId: prev.conversationId || crypto.randomUUID(),
        lastMessageId: aiMessageId,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error:', error);
      addMessage({
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        role: 'ai',
        messageId: crypto.randomUUID(),
        parentMessageId: messageId
      });
    } finally {
      setState((prev: any) => ({ ...prev, isLoading: false, input: '' }));
    }
  };

  const handleSubmit = async () => {
    if (state.isLoading) return;
    const text = state.input;
    setState((prev: any) => ({ ...prev, input: '' }));
    await sendMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.location.href = ROUTES.HOME}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            Xem tài liệu tham khảo
          </Button>
          <Button variant="default" className='px-6'>Đăng ký trải nghiệm</Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto px-4 pt-8 pb-32">
        <div className="max-w-3xl mx-auto space-y-8">
          {state.messages.length === 0 ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Trợ lý Toán học & Xác suất</h1>
                <p className="text-gray-600">Hãy đặt câu hỏi về các bài toán xác suất, thống kê và các công thức toán học.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleQuestions.map((question: any, index: any) => (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer hover:bg-gray-50 hover:border-gray-500 transition-colors"
                    onClick={() => {
                      setState((prev: any) => ({
                        ...prev,
                        input: question.title + ": " + question.subtitle
                      }));
                      sendMessage(question.title + ": " + question.subtitle)
                    }}
                  >
                    <h3 className="font-medium">{question.title}</h3>
                    <p className="text-gray-500 text-sm">{question.subtitle}</p>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {state.messages.map((message: any, index: any) => (
                <MessageComponent key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
              {
                streamLoading
                  ?
                  <div className='w-full flex justify-center items-center py-20'>
                    <Loader className='animate-spin' size={30} />
                  </div>
                  :
                  null
              }
            </div>
          )}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white to-white/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center w-full bg-gray-100 border border-gray-100 hover:border-gray-500 rounded-2xl transition-colors">
            <textarea
              value={state.input}
              onChange={(e) => setState((prev: any) => ({ ...prev, input: e.target.value }))}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi về toán xác suất của bạn..."
              disabled={state.isLoading}
              className="max-h-48 min-h-[56px] w-full resize-none bg-transparent px-4 pb-[1.3rem] pt-[1rem] focus-within:outline-none text-gray-600 placeholder:text-gray-600 disabled:opacity-50"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-gray-200"
                disabled={state.isLoading}
              >
                <PaperclipIcon className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                size="icon"
                variant={state.input.trim() === "" ? "ghost" : "default"}
                onClick={handleSubmit}
                disabled={state.isLoading || state.input.trim() === ""}
                className={
                  `h-8 w-8 rounded-full transition-colors duration-200
                    ${state.input.trim() === ""
                    ? "bg-gray-200 hover:bg-gray-300 cursor-not-allowed"
                    : ""
                  }
                `}
              >
                <ArrowUpIcon
                  className={`h-5 w-5 ${state.input.trim() === ""
                    ? "text-gray-500"
                    : "text-white"
                    }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}