
import { ProcessBaseInfo, ProcessSummary, ApiResponse, InspectionItem, PaginatedResponse, ProcessStage } from './processTypes';

// Initial Mock Data
let mockProcesses: ProcessBaseInfo[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `${i + 1}`,
  code: `PRC-${(i + 1).toString().padStart(3, '0')}`,
  name: i % 2 === 0 ? `自动化焊接工艺 ${i + 1}` : `精控切割流程 ${i + 1}`,
  version: `V${(i % 3) + 1}.0`,
  description: `这是关于工艺 ${i + 1} 的详细描述信息。`,
  isCheckActive: i % 5 !== 0,
  triggerStageId: undefined, // Initialized as undefined to test selection
  inspectionItems: [
    { id: `item-${i}-1`, originalName: '电压稳定性', displayName: '焊接电压偏差' },
  ],
}));

const MOCK_STAGES_POOL: ProcessStage[] = [
  { id: '1', name: '上料准备工序' },
  { id: '2', name: '核心焊接工序' },
  { id: '3', name: '精密组装工序' },
  { id: '4', name: '最终质检工序' },
  { id: '5', name: '包装入库工序' },
  { id: '6', name: '表面喷涂工序' },
  { id: '7', name: '激光雕刻工序' },
  { id: '8', name: '二次复检工序' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SUGGESTION_POOL = [
  '温度', '压力', '湿度', '外观尺寸', '硬度值', '清洁度', '螺栓扭矩', '转速', 
  '密封性', '绝缘电阻', '电流强度', '电压波动', '表面粗糙度', '厚度测量', 
  '振动频率', '润滑油位', '接口间隙', '喷涂均匀度', '色差', '抗拉强度'
];

export const processApis = {
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
      data: { list, total: filtered.length, hasMore: end < filtered.length },
    };
  },

  getProcessDetail: async (id: string): Promise<ApiResponse<ProcessBaseInfo | null>> => {
    await delay(200);
    const process = mockProcesses.find(p => p.id === id);
    return {
      success: true,
      data: process ? JSON.parse(JSON.stringify(process)) : null,
    };
  },

  /**
   * 根据工艺 ID 获取该工艺支持的工序列表
   */
  getProcessStages: async (processId: string): Promise<ApiResponse<ProcessStage[]>> => {
    await delay(150);
    // 模拟根据工艺不同返回不同的工序集合
    // 这里使用简单的取模算法来生成差异化的工序
    const idNum = parseInt(processId) || 0;
    const startIdx = idNum % MOCK_STAGES_POOL.length;
    const result: ProcessStage[] = [];
    
    // 每个工艺返回固定 4 个工序
    for (let i = 0; i < 4; i++) {
      result.push(MOCK_STAGES_POOL[(startIdx + i) % MOCK_STAGES_POOL.length]);
    }

    return {
      success: true,
      data: result,
    };
  },

  updateTriggerStage: async (processId: string, stageId: string): Promise<ApiResponse<boolean>> => {
    await delay(200);
    const idx = mockProcesses.findIndex(p => p.id === processId);
    if (idx !== -1) {
      mockProcesses[idx].triggerStageId = stageId;
      return { success: true, data: true };
    }
    return { success: false, data: false };
  },

  updateCheckStatus: async (id: string, active: boolean): Promise<ApiResponse<boolean>> => {
    await delay(200);
    const idx = mockProcesses.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockProcesses[idx].isCheckActive = active;
      return { success: true, data: true };
    }
    return { success: false, data: false };
  },

  addInspectionItem: async (processId: string, item: Omit<InspectionItem, 'id'>): Promise<ApiResponse<InspectionItem>> => {
    await delay(300);
    const idx = mockProcesses.findIndex(p => p.id === processId);
    if (idx !== -1) {
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      mockProcesses[idx].inspectionItems.push(newItem);
      return { success: true, data: newItem };
    }
    return { success: false, data: {} as any };
  },

  deleteInspectionItem: async (processId: string, itemId: string): Promise<ApiResponse<boolean>> => {
    await delay(200);
    const idx = mockProcesses.findIndex(p => p.id === processId);
    if (idx !== -1) {
      mockProcesses[idx].inspectionItems = mockProcesses[idx].inspectionItems.filter(i => i.id !== itemId);
      return { success: true, data: true };
    }
    return { success: false, data: false };
  },

  getInspectionSuggestions: async (query: string): Promise<ApiResponse<string[]>> => {
    await delay(300);
    const filtered = SUGGESTION_POOL.filter(s => s.toLowerCase().includes(query.toLowerCase()));
    return { success: true, data: filtered };
  },
};
