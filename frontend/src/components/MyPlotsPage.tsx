import React, { useState, useEffect } from 'react';
import { ChevronLeft, Ruler, Sprout, Sun, Droplets, Phone, Edit3, Save, X } from 'lucide-react';
import { Plot, User } from '../types';
import { fetchMyPlots, updatePlot } from '../api';

interface MyPlotsPageProps {
  user: User | null;
  onEditPlot: (plot: Plot) => void;
}

export default function MyPlotsPage({ user, onEditPlot }: MyPlotsPageProps) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.phone) {
      fetchMyPlots(user.phone)
        .then(data => {
          setPlots(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch my plots:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
        <p className="text-lg font-medium">请先登录</p>
        <p className="text-sm mt-2">登录后可查看和管理您的地块</p>
      </div>
    );
  }

  if (!user.isLandlord) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
        <p className="text-lg font-medium">您还不是地主</p>
        <p className="text-sm mt-2">注册成为地主后可管理地块</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (editingPlot) {
    return (
      <EditPlotForm
        plot={editingPlot}
        onSave={async (updatedPlot) => {
          try {
            await updatePlot(editingPlot.id, updatedPlot);
            setPlots(plots.map(p => p.id === editingPlot.id ? { ...p, ...updatedPlot } : p));
            setEditingPlot(null);
          } catch (err) {
            console.error('Failed to update plot:', err);
          }
        }}
        onCancel={() => setEditingPlot(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-lg font-bold text-green-900">我的地块</h1>
        </div>
        <div className="text-sm text-gray-500">{plots.length} 个地块</div>
      </div>

      {/* Plots List */}
      <div className="flex-1 overflow-y-auto p-4">
        {plots.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>暂无地块</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plots.map(plot => (
              <div
                key={plot.id}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={plot.images[0] || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=500'}
                      className="w-full h-full object-cover"
                      alt={plot.title}
                    />
                    <div className={`absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider ${
                      plot.status === 'available' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {plot.status === 'available' ? '可用' : '已租'}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900">{plot.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{plot.location}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-green-700 font-bold">{plot.annualRent}元</span>
                      <span className="text-[10px] text-gray-400">/ m²/年</span>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400">面积:</span>
                    <span className="text-gray-800 font-medium ml-1">{plot.area}m²</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400">土壤:</span>
                    <span className="text-gray-800 font-medium ml-1">{plot.soilType}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400">光照:</span>
                    <span className="text-gray-800 font-medium ml-1">{plot.lightCondition}</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-400">水费:</span>
                    <span className="text-gray-800 font-medium ml-1">{plot.waterPrice}元/吨</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditingPlot(plot)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-800 text-white py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                  >
                    <Edit3 size={16} />
                    编辑信息
                  </button>
                  <button
                    onClick={() => onEditPlot(plot)}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                  >
                    查看
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditPlotForm({ plot, onSave, onCancel }: { plot: Plot, onSave: (data: Partial<Plot>) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: plot.title,
    subTitle: plot.subTitle,
    location: plot.location,
    area: plot.area,
    soilType: plot.soilType,
    lightCondition: plot.lightCondition,
    waterPrice: plot.waterPrice,
    annualRent: plot.annualRent,
    description: plot.description,
    status: plot.status,
    tags: plot.tags.join(', '),
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white shadow-sm flex items-center justify-between">
        <button onClick={onCancel} className="p-2 text-gray-500">
          <X size={24} />
        </button>
        <h1 className="text-lg font-bold text-green-900">编辑地块</h1>
        <button
          onClick={() => onSave({
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
          })}
          className="flex items-center gap-1 bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
        >
          <Save size={16} />
          保存
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-500 block mb-2">地块名称</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 block mb-2">副标题</label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 block mb-2">位置</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">面积(m²)</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">年租金(元/m²)</label>
              <input
                type="number"
                value={formData.annualRent}
                onChange={(e) => setFormData({ ...formData, annualRent: parseFloat(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">土壤类型</label>
              <input
                type="text"
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">光照条件</label>
              <input
                type="text"
                value={formData.lightCondition}
                onChange={(e) => setFormData({ ...formData, lightCondition: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">水费(元/吨)</label>
              <input
                type="number"
                step="0.1"
                value={formData.waterPrice}
                onChange={(e) => setFormData({ ...formData, waterPrice: parseFloat(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-500 block mb-2">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'rented' })}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              >
                <option value="available">可用</option>
                <option value="rented">已租</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 block mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-500 block mb-2">标签(逗号分隔)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm"
              placeholder="蔬菜, 优质土壤"
            />
          </div>
        </div>
      </div>
    </div>
  );
}