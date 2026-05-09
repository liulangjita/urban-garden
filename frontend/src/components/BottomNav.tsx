import { Map, LayoutGrid, MessageCircle, User } from 'lucide-react';
import { User as UserType } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  user: UserType | null;
}

export default function BottomNav({ activeTab, onTabChange, user }: BottomNavProps) {
  const tabs = [
    { id: 'discover', label: '发现', icon: Map, requireAuth: false },
    { id: 'my-plots', label: '我的地块', icon: LayoutGrid, requireAuth: true, requireLandlord: true },
    { id: 'messages', label: '消息', icon: MessageCircle, requireAuth: true },
    { id: 'profile', label: '个人中心', icon: User, requireAuth: false },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.requireAuth && !user) {
      onTabChange('profile');
      return;
    }
    if (tab.requireLandlord && user && !user.isLandlord) {
      return;
    }
    onTabChange(tab.id);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 px-4 shadow-lg z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = tab.requireAuth && !user || (tab.requireLandlord && user && !user.isLandlord);

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-green-700' : isDisabled ? 'text-gray-300' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-full ${isActive ? 'bg-green-50' : ''}`}>
              <Icon size={24} />
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}