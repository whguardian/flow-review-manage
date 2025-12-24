
import { ProcessBaseInfo, ProcessSummary, ApiResponse, InspectionItem, PaginatedResponse } from './processTypes';

// Initial Mock Data (Extended for pagination demo)
let mockProcesses: ProcessBaseInfo[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `${i + 1}`,
  code: `PRC-${(i + 1).toString().padStart(3, '0')}`,
  name: i % 2 === 0 ? `自动化焊接工艺 ${i + 1}` : `精控切割流程 ${i + 1}`,
  version: `V${(i % 3) + 1}.0`,
  description: `这是关于工艺 ${i + 1} 的详细描述信息。`,
  isCheckActive: i % 5 !== 0,
  inspectionItems: [
    { id: `item-${i}-1`, originalName: '电压稳定性', displayName: '焊接电压偏差' },
  ],
}));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// A pool of common inspection items for mock search
const SUGGESTION_POOL = [
  '温度', '压力', '湿度', '外观尺寸', '硬度值', '清洁度', '螺栓扭矩', '转速', 
  '密封性', '绝缘电阻', '电流强度', '电压波动', '表面粗糙度', '厚度测量', 
  '振动频率', '润滑油位', '接口间隙', '喷涂均匀度', '色差', '抗拉强度'
];

export const processApis = {
  /**
   * 获取工艺列表（支持分页）
   */
  getProcessList: async (query: string = '', page: number = 1, pageSize: number = 15): Promise<ApiResponse<PaginatedResponse<ProcessSummary>>> => {
    await delay(500);
    const filtered = mockProcesses.filter(p => 
      p.name.includes(query) || p.code.includes(query)
    );
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end).map(p => ({ 
      id: p.id, code: p.code, name: p.name, version: p.version 
    }));

    return {
      success: true,
      data: {
        list,
        total: filtered.length,
        hasMore: end < filtered.length
      },
    };
  },

  /**
   * 获取工艺详情
   */
  getProcessDetail: async (id: string): Promise<ApiResponse<ProcessBaseInfo | null>> => {
    await delay(200);
    const process = mockProcesses.find(p => p.id === id);
    return {
      success: true,
      data: process ? JSON.parse(JSON.stringify(process)) : null, // Deep copy for mock
    };
  },

  /**
   * 更新复核激活状态
   */
  updateCheckStatus: async (id: string, active: boolean): Promise<ApiResponse<boolean>> => {
    await delay(200);
    const idx = mockProcesses.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockProcesses[idx].isCheckActive = active;
      return { success: true, data: true };
    }
    return { success: false, data: false };
  },

  /**
   * 添加检验项
   */
  addInspectionItem: async (processId: string, item: Omit<InspectionItem, 'id'>): Promise<ApiResponse<InspectionItem>> => {
    await delay(300);
    const idx = mockProcesses.findIndex(p => p.id === processId);
    if (idx !== -1) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      mockProcesses[idx].inspectionItems.push(newItem);
      return { success: true, data: newItem };
    }
    return { success: false, data: {} as any, message: '未找到工艺' };
  },

  /**
   * 删除检验项
   */
  deleteInspectionItem: async (processId: string, itemId: string): Promise<ApiResponse<boolean>> => {
    await delay(200);
    const idx = mockProcesses.findIndex(p => p.id === processId);
    if (idx !== -1) {
      mockProcesses[idx].inspectionItems = mockProcesses[idx].inspectionItems.filter(i => i.id !== itemId);
      return { success: true, data: true };
    }
    return { success: false, data: false };
  },

  /**
   * 获取常用检验项候选项（远程查询模式）
   */
  getInspectionSuggestions: async (query: string): Promise<ApiResponse<string[]>> => {
    await delay(300); // Simulate network latency for remote search
    const filtered = SUGGESTION_POOL.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      data: filtered,
    };
  },
};
