import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ChevronLeft, User } from 'lucide-react';
import { Message, User as UserType, Plot } from '../types';
import { fetchMessages, sendMessage, markMessageRead } from '../api';

interface MessagesPageProps {
  user: UserType | null;
}

export default function MessagesPage({ user }: MessagesPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      fetchMessages(user.id, user.phone)
        .then(data => {
          console.log('Messages fetched:', data);
          setMessages(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch messages:', err);
          setError('获取消息失败');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
        <MessageCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">请先登录</p>
        <p className="text-sm mt-2">登录后可查看和发送消息</p>
      </div>
    );
  }

  // 按对话分组消息
  const conversations = messages.reduce((acc, msg) => {
    // 判断当前用户是发送者还是接收者（支持UUID和手机号匹配）
    const isSender = msg.senderId === user.id || msg.senderId === user.phone || msg.senderPhone === user.phone;
    const isReceiver = msg.receiverId === user.id || msg.receiverId === user.phone;

    const key = isSender ? msg.receiverId : msg.senderId;
    if (!acc[key]) {
      acc[key] = {
        userId: key,
        userName: (isSender ? msg.receiverName : msg.senderName) || 'Unknown',
        userPhone: isSender ? '' : msg.senderPhone || '',
        messages: [],
        unread: 0,
      };
    }
    acc[key].messages.push(msg);
    if (isReceiver && !msg.read) {
      acc[key].unread++;
    }
    return acc;
  }, {} as Record<string, { userId: string; userName: string; userPhone: string; messages: Message[]; unread: number }>);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations[selectedConversation];
    try {
      const msg = await sendMessage({
        senderId: user.id,
        senderPhone: user.phone,
        senderName: user.name,
        receiverId: selectedConversation,
        receiverName: conversation.userName,
        content: newMessage.trim(),
      });
      setMessages([...messages, msg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
        <p className="text-lg font-medium text-red-500">{error}</p>
        <button
          onClick={() => {
            if (user?.id) {
              setLoading(true);
              fetchMessages(user.id, user.phone)
                .then(data => {
                  setMessages(data);
                  setError(null);
                  setLoading(false);
                })
                .catch(err => {
                  setError('获取消息失败');
                  setLoading(false);
                });
            }
          }}
          className="mt-4 bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          重试
        </button>
      </div>
    );
  }

  if (selectedConversation) {
    const conversation = conversations[selectedConversation];
    return (
      <ChatView
        conversation={conversation}
        currentUserId={user.id}
        currentUserPhone={user.phone}
        messages={conversation.messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={handleSend}
        onBack={() => setSelectedConversation(null)}
        onMarkRead={(msgId) => {
          markMessageRead(msgId);
          setMessages(messages.map(m => m.id === msgId ? { ...m, read: true } : m));
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-green-800" />
          <h1 className="text-lg font-bold text-green-900">消息</h1>
        </div>
        <div className="text-sm text-gray-500">
          {Object.values(conversations).filter(c => c.unread > 0).length} 条未读
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(conversations).length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无消息</p>
            <p className="text-sm mt-2">您可以在地块详情页给地主留言</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.values(conversations).map(conv => (
              <button
                key={conv.userId}
                onClick={() => setSelectedConversation(conv.userId)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex items-center gap-3 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold">
                  {(conv.userName || 'U').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">{conv.userName || 'Unknown'}</h4>
                    {conv.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv.messages[conv.messages.length - 1]?.content}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {conv.messages[conv.messages.length - 1]?.createdAt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({
  conversation,
  currentUserId,
  currentUserPhone,
  messages,
  newMessage,
  setNewMessage,
  onSend,
  onBack,
  onMarkRead,
}: {
  conversation: { userId: string; userName: string; messages: Message[] };
  currentUserId: string;
  currentUserPhone: string;
  messages: Message[];
  newMessage: string;
  setNewMessage: (s: string) => void;
  onSend: () => void;
  onBack: () => void;
  onMarkRead: (id: string) => void;
}) {
  // 判断是否是当前用户发送的消息
  const isCurrentUserSender = (msg: Message) => {
    return msg.senderId === currentUserId || msg.senderId === currentUserPhone || msg.senderPhone === currentUserPhone;
  };

  // 标记所有未读消息为已读
  useEffect(() => {
    messages.forEach(msg => {
      if ((msg.receiverId === currentUserId || msg.receiverId === currentUserPhone) && !msg.read) {
        onMarkRead(msg.id);
      }
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold">
          {(conversation.userName || 'U').charAt(0)}
        </div>
        <h1 className="text-lg font-bold text-gray-900">{conversation.userName || 'Unknown'}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${isCurrentUserSender(msg) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                isCurrentUserSender(msg)
                  ? 'bg-green-800 text-white'
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${
                isCurrentUserSender(msg) ? 'text-green-200' : 'text-gray-400'
              }`}>
                {msg.createdAt}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 border border-gray-200 rounded-xl p-3 text-sm"
          />
          <button
            onClick={onSend}
            disabled={!newMessage.trim()}
            className="bg-green-800 text-white p-3 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}