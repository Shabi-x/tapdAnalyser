// 添加仪表盘配置枚举映射
export const DASHBOARD_ENUM_MAPPINGS = {
  // 映射维度
  dimensions: {
    patterns: ["维度", "维度配置", "分析维度"], 
    outputKey: "dimensions",
    valueType: "array",
    specialCases: {
      "数据日期": {
        value: "display_date",
        label: "数据日期",
        name: "display_date",
        fixed: true,
        disabledSort: true
      },
      "代投商": {
        value: "agent_id",
        label: "代投商",
        name: "agent_name"
      },
      "二级媒体": {
        value: "med_id",
        label: "二级媒体",
        children: ["med_name", "med_id"]
      },
      "平台": {
        value: "platid",
        label: "平台",
        name: "plat_name"
      },
      "账户": {
        value: "med_account_id",
        label: "账户",
        children: ["med_account_id", "account_name"]
      }
    }
  },
  
  // 映射口径
  caliber: {
    patterns: ["口径", "统计口径", "数据口径"],
    outputKey: "caliber",
    valueType: "object",
    mappings: {
      "统一口径": {
        label: "统一口径",
        value: 0
      }
    }
  },
  
  // 映射日期分组
  dateGroup: {
    patterns: ["数据日期", "日期分组", "时间维度", "时间粒度"],
    outputKey: "dateGroup",
    valueType: "object",
    mappings: {
      "分小时": { label: "分小时", value: "hour" },
      "分时": { label: "分小时", value: "hour" },
      "分日": { label: "分天", value: "day" },
      "分天": { label: "分天", value: "day" },
      "分周": { label: "分周", value: "week" },
      "分月": { label: "分月", value: "month" }
    }
  },
  
  // 映射表格配置
  table: {
    patterns: ["表格", "数据表", "表格配置"],
    outputKey: "table",
    valueType: "object",
    columnMappings: {
      "id": {
        field: "id",
        title: "ID",
        fixed: "left",
        align: "center"
      },
      "一级媒体": {
        field: "medTypePlatformName",
        title: "一级媒体"
      },
      "平台": {
        field: "platid",
        title: "平台"
      }
    }
  }
};