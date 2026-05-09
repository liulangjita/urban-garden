import React, { useState } from 'react';
import { ChevronLeft, Share2, Ruler, Sprout, Sun, Droplets, Phone, Calendar, MessageCircle, X, Send } from 'lucide-react';
import { Plot, User } from '../types';
import { sendMessage } from '../api';

interface DetailPageProps {
  plot: Plot;
  onBack: () => void;
  currentUser?: User | null;
}

export default function DetailPage({ plot, onBack, currentUser }: DetailPageProps) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!currentUser || !messageContent.trim()) return;

    setSending(true);
    try {
      // 地主的ID使用手机号作为标识
      await sendMessage({
        senderId: currentUser.id,
        senderPhone: currentUser.phone,
        senderName: currentUser.name,
        receiverId: plot.owner.phone,
        receiverName: plot.owner.name,
        content: messageContent.trim(),
      });
      setMessageContent('');
      setShowMessageModal(false);
      alert('留言已发送！');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('发送失败，请重试');
    }
    setSending(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Header View */}
      <div className="relative h-[45vh] flex-shrink-0">
        <img src={plot.images[0]} className="w-full h-full object-cover" alt={plot.title} />

        {/* Top Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/40 to-transparent">
          <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
             <div className="bg-green-800 text-white px-3 py-1 rounded-lg text-sm font-bold">城市菜地</div>
          </div>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
            <Share2 size={24} />
          </button>
        </div>

        {/* Carousel Indicator */}
        <div className="absolute bottom-16 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">
          1/3
        </div>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        </div>
      </div>

      {/* Content View */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mt-10 bg-white rounded-t-3xl p-6 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 mb-4">
          {plot.tags.map(tag => (
            <span key={tag} className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-md">{tag}</span>
          ))}
        </div>

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{plot.title}</h1>
            <div className="flex items-center gap-1 text-gray-400 mt-1">
              <MapPinIcon size={14} className="text-gray-300" />
              <span className="text-xs font-medium">{plot.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">年租金</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-green-700 tracking-tighter">{plot.annualRent}元/</span>
              <span className="text-lg font-bold text-green-800 tracking-tighter">平方米</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 my-8">
           <InfoItem icon={<Ruler size={24} />} label="地块面积" value={`${plot.area} 平方米`} />
           <InfoItem icon={<Sprout size={24} />} label="土壤类型" value={plot.soilType} />
           <InfoItem icon={<Sun size={24} />} label="光照条件" value={plot.lightCondition} />
           <InfoItem icon={<Droplets size={24} />} label="浇地水费" value={`${plot.waterPrice}元/吨`} />
        </div>

        {/* Owner Section */}
        <div className="bg-blue-50/50 rounded-3xl p-4 flex items-center justify-between mb-8 border border-blue-50">
          <div className="flex items-center gap-3">
            <img src={plot.owner.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="owner" />
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">地块持有者</p>
              <h4 className="font-bold text-gray-900 -mt-0.5">{plot.owner.name}</h4>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center gap-2 border border-blue-200 bg-white px-3 py-2 rounded-2xl text-xs font-bold text-blue-900 shadow-sm active:scale-95 transition-transform hover:bg-blue-50/50"
            >
              <MessageCircle size={14} />
              留言
            </button>
            <button
              onClick={() => {
                if (plot.owner.phone) {
                  window.open(`tel:${plot.owner.phone}`, '_self');
                }
              }}
              className="flex items-center gap-2 border border-orange-200 bg-white px-3 py-2 rounded-2xl text-xs font-bold text-orange-900 shadow-sm active:scale-95 transition-transform hover:bg-orange-50/50"
            >
              <Phone size={14} />
              联系业主
            </button>
          </div>
        </div>

        <section className="mb-24">
          <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">详细描述</h3>
          <p className="text-gray-500 text-sm leading-relaxed leading-extra-loose">
            {plot.description}
          </p>
        </section>
      </div>

      {/* Bottom Button */}
      <div className="p-4 bg-white border-t border-gray-100 flex justify-center pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <button className="w-full bg-green-800 hover:bg-green-900 text-white flex items-center justify-center gap-3 py-4 rounded-3xl font-black text-lg shadow-xl shadow-green-100 transition-all active:scale-95">
          <Calendar size={22} strokeWidth={2.5} />
          预约参观
        </button>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">给地主留言</h3>
              <button onClick={() => setShowMessageModal(false)} className="p-2 text-gray-400">
                <X size={20} />
              </button>
            </div>

            {!currentUser ? (
              <div className="text-center py-4">
                <p className="text-gray-500">请先登录后再留言</p>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="mt-4 bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  确定
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">发送给: {plot.owner.name}</p>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="输入您的留言内容..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[100px]"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sending}
                  className="w-full bg-green-800 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {sending ? '发送中...' : '发送留言'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="text-green-700 mb-3 bg-green-50 w-fit p-1 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-gray-800 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function MapPinIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    )
}
