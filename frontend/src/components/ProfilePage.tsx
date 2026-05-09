import React, { useState } from 'react';
import { User, LogOut, LogIn, UserPlus, Phone, Lock, UserCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { login, register, checkUser } from '../api';

interface ProfilePageProps {
  user: UserType | null;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogin, onLogout }: ProfilePageProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('请输入手机号和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(phone, password);
      onLogin(loggedInUser);
      setShowLogin(false);
      setPhone('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!phone || !password || !name) {
      setError('请填写完整信息');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newUser = await register(phone, name, password);
      onLogin(newUser);
      setShowRegister(false);
      setPhone('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleCheckPhone = async () => {
    if (!phone) return;
    try {
      const result = await checkUser(phone);
      if (result.isLandlord) {
        setShowLogin(true);
      } else if (result.exists) {
        setShowLogin(true);
      } else {
        setShowRegister(true);
      }
    } catch (err) {
      setError('查询用户失败');
    }
  };

  if (user) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt={user.name} />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500">{user.phone}</p>
              {user.isLandlord && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded mt-1">
                  地主认证
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Info */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h3 className="font-bold text-gray-900 mb-4">个人信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserCircle size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">用户名</p>
                  <p className="text-sm text-gray-800">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">手机号</p>
                  <p className="text-sm text-gray-800">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">身份</p>
                  <p className="text-sm text-gray-800">{user.isLandlord ? '地主' : '游客'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            <LogOut size={20} />
            退出登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-lg font-bold text-green-900">个人中心</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!showLogin && !showRegister ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">登录 / 注册</h3>
            <p className="text-sm text-gray-500 mb-6">输入您的手机号，系统将判断您是新用户还是已有用户</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckPhone}
                disabled={!phone || loading}
                className="w-full bg-green-800 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                继续
              </button>
            </div>
          </div>
        ) : showLogin ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">登录</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="默认密码: 123456"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-green-800 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>

              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
                className="w-full text-green-700 text-sm font-bold"
              >
                没有账号？去注册
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">注册新用户</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">用户名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入您的名字"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-500 block mb-2">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="设置密码"
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-green-800 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册'}
              </button>

              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
                className="w-full text-green-700 text-sm font-bold"
              >
                已有账号？去登录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}