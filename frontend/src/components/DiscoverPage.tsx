import { Search, SlidersHorizontal, MapPin, Plus, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { fetchRegions, AdministrativeRegion, GardenCenter, Plot } from '../api';
import MapComponent from './MapComponent';

interface DiscoverPageProps {
  onSelectPlot: (plot: Plot) => void;
}

export default function DiscoverPage({ onSelectPlot }: DiscoverPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionStack, setRegionStack] = useState<AdministrativeRegion[]>([]);
  const [selectedGarden, setSelectedGarden] = useState<GardenCenter | null>(null);
  const [regions, setRegions] = useState<AdministrativeRegion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions()
      .then(data => {
        setRegions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch regions:', err);
        setLoading(false);
      });
  }, []);

  // Helper to find all regions/gardens recursively
  const allSearchableItems = useMemo(() => {
    const results: { type: 'region' | 'garden', name: string, item: any, path: AdministrativeRegion[] }[] = [];

    function traverse(regions: AdministrativeRegion[], path: AdministrativeRegion[]) {
      regions.forEach(region => {
        results.push({ type: 'region', name: region.name, item: region, path: [...path, region] });
        if (region.gardens) {
          region.gardens.forEach(garden => {
            results.push({ type: 'garden', name: garden.name, item: garden, path: [...path, region] });
          });
        }
        if (region.children) {
          traverse(region.children, [...path, region]);
        }
      });
    }

    traverse(regions, []);
    return results;
  }, [regions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.type === 'garden' && (item.item as GardenCenter).address.toLowerCase().includes(query))
    );
  }, [allSearchableItems, searchQuery]);

  const handleSearchResultClick = (result: any) => {
    setSearchQuery('');
    setRegionStack(result.path);
    if (result.type === 'garden') {
      setSelectedGarden(result.item);
    } else {
      setSelectedGarden(null);
    }
  };

  const currentRegion = regionStack[regionStack.length - 1];

  // Get lists to display normally
  const displayList = useMemo(() => {
    if (!currentRegion) return regions;
    if (currentRegion.children) return currentRegion.children;
    return [];
  }, [currentRegion, regions]);

  const gardens = useMemo(() => {
    if (currentRegion) return currentRegion.gardens || [];
    return [];
  }, [currentRegion]);

  const handleRegionClick = (region: AdministrativeRegion) => {
    setRegionStack([...regionStack, region]);
    setSelectedGarden(null);
  };

  const handleBack = () => {
    if (selectedGarden) {
      setSelectedGarden(null);
    } else {
      setRegionStack(regionStack.slice(0, -1));
    }
  };

  const mapCenter = useMemo(() => {
    if (selectedGarden) return selectedGarden.coordinates;
    if (currentRegion?.coordinates) return currentRegion.coordinates;
    return { lat: 34.34127, lng: 108.93984 }; // Center of China (Xi'an approximate)
  }, [selectedGarden, currentRegion]);

  const mapZoom = useMemo(() => {
    if (selectedGarden) return 15;
    if (currentRegion) {
      if (currentRegion.level === 'province') return 6;
      if (currentRegion.level === 'city') return 11;
      if (currentRegion.level === 'district') return 13;
    }
    return 4; // China view
  }, [selectedGarden, currentRegion]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between z-10 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          {regionStack.length > 0 && (
            <button onClick={handleBack} className="p-1 -ml-1 text-gray-500">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center text-white">
            <Plus size={20} strokeWidth={3} className="rotate-45" />
          </div>
          <h1 className="text-lg font-bold text-green-900">
            {selectedGarden ? selectedGarden.name : currentRegion?.name || '城市菜地'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop"
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            alt="profile"
          />
        </div>
      </div>

      {/* Map Content */}
      <div className="relative flex-1 overflow-hidden">
        <MapComponent gardens={gardens} center={mapCenter} zoom={mapZoom} />

        {/* Floating Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="relative shadow-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索区域（省、市、县区）..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-0 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-medium focus:ring-2 focus:ring-green-500 transition-all shadow-md"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700">
               <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Bottom Sheet */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 z-[1000] flex flex-col"
          style={{ maxHeight: '70vh' }}
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        >
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full"></div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {selectedGarden ? '可用地块' : (currentRegion ? `${currentRegion.name}地块` : '选择区域')}
            </h2>
            {currentRegion && !selectedGarden && (
               <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-md">
                 {gardens.length} 个园区
               </div>
            )}
          </div>

          <div className="overflow-y-auto no-scrollbar flex-1 pb-10">
            {/* Search Results */}
            {searchQuery && (
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">搜索结果</h3>
                {searchResults.length > 0 ? (
                  searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchResultClick(res)}
                      className="w-full flex items-center justify-between p-4 bg-green-50/50 rounded-2xl hover:bg-green-100 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        {res.type === 'region' ? <MapPin size={16} className="text-green-600" /> : <Sprout size={16} className="text-green-600" />}
                        <div>
                          <p className="font-bold text-gray-900">{res.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{res.type === 'region' ? (res.item as AdministrativeRegion).level : '园艺中心'}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </button>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-400 text-sm italic">未找到匹配的区域或园区</p>
                )}
              </div>
            )}

            {/* Drill down list */}
            {!searchQuery && !selectedGarden && displayList.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {displayList.map(region => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionClick(region)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-800 transition-all text-left group"
                  >
                    <span className="font-bold text-sm">{region.name}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-green-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Gardens List */}
            {!searchQuery && !selectedGarden && gardens.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">推荐园区</h3>
                {gardens.map(garden => (
                  <div
                    key={garden.id}
                    onClick={() => setSelectedGarden(garden)}
                    className="flex gap-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <img src={garden.thumb} className="w-20 h-20 rounded-xl object-cover" alt={garden.name} />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900">{garden.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{garden.address}</p>
                      <div className="mt-2 text-xs font-bold text-green-700 flex items-center gap-1">
                        <MapPin size={10} />
                        {garden.plots.length} 个地块
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!searchQuery && !selectedGarden && gardens.length === 0 && displayList.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400 text-sm italic">该区域暂无入驻菜地</p>
                <button onClick={handleBack} className="mt-4 text-green-700 font-bold text-sm">返回上一级</button>
              </div>
            )}

            {/* Selected Garden Plots */}
            <AnimatePresence>
              {selectedGarden && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {selectedGarden.plots.map(plot => (
                    <div
                      key={plot.id}
                      onClick={() => onSelectPlot(plot)}
                      className="group flex gap-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
                        <img src={plot.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={plot.title} />
                        {plot.status === 'available' && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">可用</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-900">{plot.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{plot.subTitle}</p>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-green-700 font-bold">{plot.annualRent}元</span>
                          <span className="text-[10px] text-gray-400">/ 平/年</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setSelectedGarden(null)}
                    className="w-full py-3 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600"
                  >
                    返回园区列表
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-green-800 text-white rounded-full flex items-center justify-center shadow-xl z-[1001] transition-transform active:scale-90 ring-4 ring-white">
        <Plus size={32} />
      </button>
    </div>
  );
}