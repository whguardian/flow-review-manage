
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessSummary } from '../api/processTypes';
import { processApis } from '../api/processApis';

interface ProcessSidebarProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const ProcessSidebar: React.FC<ProcessSidebarProps> = ({ onSelect, selectedId }) => {
  const [query, setQuery] = useState('');
  const [list, setList] = useState<ProcessSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchList = useCallback(async (q: string, p: number, append: boolean = false) => {
    setLoading(true);
    const res = await processApis.getProcessList(q, p);
    if (res.success) {
      setList(prev => append ? [...prev, ...res.data.list] : res.data.list);
      setHasMore(res.data.hasMore);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(1);
    fetchList(query, 1, false);
  }, [query, fetchList]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchList(query, nextPage, true);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, query, fetchList]);

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            placeholder="查询工艺名称/代码..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {list.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {list.map((item, index) => (
              <div key={`${item.id}-${index}`} ref={index === list.length - 1 ? lastElementRef : null}>
                <button
                  onClick={() => onSelect(item.id)}
                  className={`w-full text-left p-4 hover:bg-blue-50 transition-colors border-l-4 ${
                    selectedId === item.id ? 'bg-blue-50 border-blue-600' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 truncate pr-2">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-mono uppercase">
                      {item.version}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{item.code}</div>
                </button>
              </div>
            ))}
            {loading && (
              <div className="p-4 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                加载中...
              </div>
            )}
          </div>
        ) : !loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">未找到相关工艺</div>
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm italic">初始化加载...</div>
        )}
      </div>
    </div>
  );
};

export default ProcessSidebar;
