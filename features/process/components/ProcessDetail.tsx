
import React, { useState, useEffect, useRef } from 'react';
import { ProcessBaseInfo, InspectionItem, ProcessStage } from '../api/processTypes';
import { processApis } from '../api/processApis';

interface ProcessDetailProps {
  id: string | null;
}

const ProcessDetail: React.FC<ProcessDetailProps> = ({ id }) => {
  const [data, setData] = useState<ProcessBaseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  
  const [newItemOriginal, setNewItemOriginal] = useState('');
  const [newItemDisplay, setNewItemDisplay] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const addRowRef = useRef<HTMLTableRowElement>(null);
  const originalInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [detailRes, stagesRes] = await Promise.all([
        processApis.getProcessDetail(id),
        processApis.getProcessStages(id)
      ]);
      
      if (detailRes.success) setData(detailRes.data);
      if (stagesRes.success) setStages(stagesRes.data);
    } finally {
      setLoading(false);
      setIsAdding(false);
      resetForm();
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!newItemOriginal.trim() || !showSuggestions) {
      if (!newItemOriginal.trim()) setSuggestions([]);
      return;
    }
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    setIsSearchingSuggestions(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const res = await processApis.getInspectionSuggestions(newItemOriginal);
        if (res.success) setSuggestions(res.data);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);
    return () => { if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current); };
  }, [newItemOriginal, showSuggestions]);

  const resetForm = () => {
    setNewItemOriginal('');
    setNewItemDisplay('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleToggleActive = async () => {
    if (!data) return;
    const newStatus = !data.isCheckActive;
    const res = await processApis.updateCheckStatus(data.id, newStatus);
    if (res.success) setData({ ...data, isCheckActive: newStatus });
  };

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!data) return;
    const newStageId = e.target.value;
    const res = await processApis.updateTriggerStage(data.id, newStageId);
    if (res.success) setData({ ...data, triggerStageId: newStageId });
  };

  const onStartAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      addRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      originalInputRef.current?.focus();
    }, 100);
  };

  const handleAddItem = async () => {
    if (!data || !newItemOriginal.trim() || !newItemDisplay.trim()) return;
    const res = await processApis.addInspectionItem(data.id, { 
      originalName: newItemOriginal.trim(), 
      displayName: newItemDisplay.trim() 
    });
    if (res.success) {
      setData({ ...data, inspectionItems: [...data.inspectionItems, res.data] });
      resetForm();
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!data) return;
    const res = await processApis.deleteInspectionItem(data.id, itemId);
    if (res.success) {
      setData({ ...data, inspectionItems: data.inspectionItems.filter(i => i.id !== itemId) });
    }
  };

  const handleSelectSuggestion = (s: string) => {
    setNewItemOriginal(s);
    if (!newItemDisplay.trim()) setNewItemDisplay(s);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p>请从左侧选择一个工艺以查看详情</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
          <span className="text-gray-500 text-sm">加载详情中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6 pb-64">
        {/* Basic Info Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
            <h2 className="font-semibold text-gray-800">工艺基本信息</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">复核激活状态</span>
              <button
                onClick={handleToggleActive}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  data.isCheckActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.isCheckActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1">工艺代码</label>
              <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded inline-block">{data.code}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1">工艺名称</label>
              <p className="text-gray-900 font-semibold">{data.name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1">触发复核工序</label>
              <select
                value={data.triggerStageId || ''}
                onChange={handleStageChange}
                className="w-full mt-0.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              >
                <option value="" disabled>请选择该工艺下的触发工序</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Inspection Management Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
            <h2 className="font-semibold text-gray-800">复核检验项管理</h2>
            <button
              onClick={onStartAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm shadow-blue-100 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加新项
            </button>
          </div>
          
          <div className="overflow-visible">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原始检验项名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">显示名称 (别名)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 overflow-visible">
                {data.inspectionItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate">{item.originalName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium truncate">{item.displayName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="删除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Inline Add Row */}
                <tr ref={addRowRef} className={`transition-all duration-300 relative ${isAdding ? 'bg-blue-50/50' : 'hidden'}`}>
                  <td className="px-6 py-4 overflow-visible">
                    <div className="relative" ref={suggestionRef}>
                      <input
                        ref={originalInputRef}
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white pr-8 text-gray-900 placeholder-gray-400"
                        placeholder="输入关键字搜索..."
                        value={newItemOriginal}
                        onChange={(e) => { setNewItemOriginal(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)}
                      />
                      {isSearchingSuggestions && (
                        <div className="absolute right-2 top-2.5">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                        </div>
                      )}
                      {showSuggestions && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-10">
                          {!newItemOriginal.trim() ? (
                            <div className="px-4 py-4 text-xs text-gray-500 italic text-center">请输入检验项名称进行搜索...</div>
                          ) : isSearchingSuggestions ? (
                            <div className="px-4 py-4 text-xs text-gray-600 flex items-center justify-center gap-2">
                               <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>正在查询...
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div className="py-1">
                              {suggestions.map((s, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-between group"
                                  onClick={() => handleSelectSuggestion(s)}
                                >
                                  <span className="font-medium">{s}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-4 text-xs text-gray-500 italic text-center">未查询到相关结果</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 overflow-visible">
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 placeholder-gray-400"
                      placeholder="设置显示别名..."
                      value={newItemDisplay}
                      onChange={(e) => setNewItemDisplay(e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={handleAddItem} disabled={!newItemOriginal.trim() || !newItemDisplay.trim()} className="text-blue-600 hover:text-blue-800 disabled:opacity-30 p-1" title="保存">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 p-1" title="取消">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {!isAdding && (
            <div className="p-4 bg-gray-50/30 border-t border-gray-100 text-center">
              <button onClick={onStartAdd} className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">+ 继续添加复核项</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProcessDetail;
