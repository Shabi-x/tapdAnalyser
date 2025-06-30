// 定义枚举类型和映射关系
export interface EnumMapping {
  [key: string]: {
    [key: string]: string | number | boolean | object;
  };
}

// 产品枚举示例
const productEnums: EnumMapping = {
  // 产品类型枚举
  productTypes: {
    A: { label: '产品A', value: 'A', code: 'PROD_A' },
    B: { label: '产品B', value: 'B', code: 'PROD_B' },
    C: { label: '产品C', value: 'C', code: 'PROD_C' }
  },
  // 地区枚举
  regions: {
    east: { label: '华东', value: 'east', code: 'REGION_EAST' },
    south: { label: '华南', value: 'south', code: 'REGION_SOUTH' },
    north: { label: '华北', value: 'north', code: 'REGION_NORTH' },
    west: { label: '华西', value: 'west', code: 'REGION_WEST' }
  },
  // 渠道枚举
  channels: {
    online: { label: '线上', value: 'online', code: 'CHANNEL_ONLINE' },
    offline: { label: '线下', value: 'offline', code: 'CHANNEL_OFFLINE' },
    agent: { label: '代理商', value: 'agent', code: 'CHANNEL_AGENT' }
  },
  // 图表类型枚举
  chartTypes: {
    line: { label: '折线图', value: 'line' },
    bar: { label: '柱状图', value: 'bar' },
    pie: { label: '饼图', value: 'pie' }
  },
  // 时间维度枚举
  dateGroup: {
    day: { label: '按日', value: 'day' },
    week: { label: '按周', value: 'week' },
    month: { label: '按月', value: 'month' },
    quarter: { label: '按季度', value: 'quarter' },
    year: { label: '按年', value: 'year' }
  }
};

// 默认转换规则
export const DEFAULT_CONVERT_RULE = {
  id: 'dashboard-config-generator',
  name: '产研需求转换配置生成器',
  description: '将Markdown需求文档转换为前端仪表盘配置代码',
  prompt: `你是一个专业的产品需求文档分析工具。你的任务是将Markdown格式的需求文档转换为前端TypeScript配置对象，用于构建数据仪表盘和可视化界面。

请按照以下步骤处理：

1. 仔细分析提供的Markdown需求文档内容
2. 识别文档中的关键需求信息，包括但不限于：
   - 筛选条件与表单要素
   - 表格展示的维度与指标
   - 图表类型与展示要求
   - 数据分组和计算方式
   - 辅助信息与交互逻辑

3. 根据识别到的需求，生成一个符合以下结构的TypeScript配置对象：
   - formBlock: 表单筛选区域配置
   - tableBlock: 表格及维度配置
   - chartBlock: 图表配置
   - tipsBlock: 提示信息配置

4. 生成代码时应注意：
   - 使用规范的TypeScript语法，包括适当的类型注解
   - 配置项应反映需求文档中指定的功能和数据要求
   - 字段名和结构需遵循示例中的格式规范
   - 确保生成的配置能直接用于前端渲染

5. 返回的代码必须是有效的TypeScript对象，以"const 配置名称 = {...}"格式开头
6. 确保配置结构与示例相符，即使需求文档中未明确指定某些细节
7. 必须包含formBlock、tableBlock和至少一个chartBlock

配置代码应考虑前端实际使用场景，确保结构清晰，字段命名规范，类型定义准确。

请生成完整的TypeScript配置代码，不要包含任何其他解释或描述。`,
  examples: [
    {
      input: `# 销售数据分析仪表盘需求

## 功能概述
开发一个销售数据分析仪表盘，用于查看和分析公司各产品在不同地区、不同渠道的销售情况。

## 筛选条件
1. 日期范围选择：支持选择查询的起止日期
2. 产品选择：可选择产品A、产品B或全部产品
3. 地区选择：可选择华东、华南、华北或全部地区

## 数据表格
表格需要展示以下数据：
- 日期
- 产品名称
- 地区名称
- 渠道名称
- 销售额（元）
- 销售量（件）
- 利润率（%）

用户可自定义选择展示的维度（产品、地区、渠道）。
支持按日、按周、按月查看数据。

## 数据图表
需要一个销售趋势图，展示不同时间周期的销售数据变化。

## 其他信息
添加数据更新时间说明，以及销售额单位和利润率计算方式的说明。`,
      output: `const salesDashboardConfig = {
  // 表单筛选区域
  formBlock: {
    filterConfig: {
      fields: [
        {
          formItemProps: {
            name: 'dateRange',
            label: '日期范围'
          },
          props: {
            type: 'dateRange',
            defaultValue: ['2023-01-01', '2023-12-31']
          }
        },
        {
          formItemProps: {
            name: 'product',
            label: '产品'
          },
          props: {
            type: 'select',
            defaultValue: '',
            options: [
              { label: '全部', value: '' },
              { label: '产品A', value: 'A' },
              { label: '产品B', value: 'B' }
            ]
          }
        },
        {
          formItemProps: {
            name: 'region',
            label: '地区'
          },
          props: {
            type: 'select',
            defaultValue: '',
            options: [
              { label: '全部', value: '' },
              { label: '华东', value: 'east' },
              { label: '华南', value: 'south' },
              { label: '华北', value: 'north' }
            ]
          }
        }
      ]
    }
  },
  
  // 表格及维度配置
  tableBlock: {
    title: '销售数据分析',
    
    // 维度配置
    dimension: {
      config: [
        {
          value: 'product',
          label: '产品',
          name: 'productName',
          fixed: true,
          default: true
        },
        {
          value: 'region',
          label: '地区',
          name: 'regionName',
          default: true
        },
        {
          value: 'channel',
          label: '渠道',
          name: 'channelName'
        }
      ]
    },
    
    // 口径配置
    caliber: {
      config: [
        { label: '销售额', value: 'sales' },
        { label: '销售量', value: 'volume' },
        { label: '利润率', value: 'profit' }
      ]
    },
    
    // 日期分组配置
    dateGroup: {
      config: [
        { label: '按日', value: 'day' },
        { label: '按周', value: 'week' },
        { label: '按月', value: 'month' }
      ]
    },
    
    // 表格配置
    table: {
      config: {
        columns: [
          { colKey: 'date', title: '日期', width: 120 },
          { colKey: 'productName', title: '产品', width: 150 },
          { colKey: 'regionName', title: '地区', width: 120 },
          { colKey: 'channelName', title: '渠道', width: 120 },
          { colKey: 'sales', title: '销售额(元)', width: 150, align: 'right' },
          { colKey: 'volume', title: '销售量(件)', width: 150, align: 'right' },
          { colKey: 'profit', title: '利润率(%)', width: 120, align: 'right' }
        ],
        rowKey: 'id',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }
    }
  },
  
  // 提示信息
  tipsBlock: {
    textList: [
      '数据更新时间：每日凌晨3点',
      '销售额单位：人民币元',
      '利润率 = (销售额 - 成本) / 销售额 × 100%'
    ]
  },
  
  // 图表配置
  chartBlock: {
    title: '销售趋势',
    chartType: 'line',
    dataKeys: ['date', 'sales'],
    config: {
      xAxis: {
        type: 'category',
        data: [] // 由后端填充
      },
      yAxis: {
        type: 'value',
        name: '销售额(元)'
      },
      tooltip: {
        trigger: 'axis'
      },
      series: [] // 由后端填充
    }
  }
};`
    }
  ]
};

// 高级复杂配置示例 - 用于帮助大模型理解复杂的配置结构
export const COMPLEX_CONFIG_EXAMPLE = `
const complexDashboardConfig = {
  // 表单筛选区域
  formBlock: {
    filterConfig: {
      layout: 'horizontal',
      labelAlign: 'right',
      labelWidth: 80,
      fields: [
        {
          formItemProps: {
            name: 'dateRange',
            label: '日期范围',
            rules: [{ required: true, message: '请选择日期范围' }]
          },
          props: {
            type: 'dateRange',
            defaultValue: ['2023-01-01', '2023-12-31'],
            placeholder: ['开始日期', '结束日期'],
            clearable: true
          }
        },
        {
          formItemProps: {
            name: 'productCategory',
            label: '产品类别'
          },
          props: {
            type: 'cascader',
            defaultValue: [],
            options: [
              {
                label: '电子产品',
                value: 'electronics',
                children: [
                  { label: '手机', value: 'phone' },
                  { label: '电脑', value: 'computer' }
                ]
              },
              {
                label: '服装',
                value: 'clothing',
                children: [
                  { label: '男装', value: 'men' },
                  { label: '女装', value: 'women' }
                ]
              }
            ],
            multiple: true
          }
        },
        {
          formItemProps: {
            name: 'region',
            label: '销售区域'
          },
          props: {
            type: 'select',
            defaultValue: [],
            options: [
              { label: '华东', value: 'east' },
              { label: '华南', value: 'south' },
              { label: '华北', value: 'north' },
              { label: '华西', value: 'west' }
            ],
            multiple: true,
            filterable: true
          }
        },
        {
          formItemProps: {
            name: 'salesThreshold',
            label: '销售额阈值'
          },
          props: {
            type: 'slider',
            defaultValue: [0, 100000],
            range: true,
            step: 1000,
            marks: {
              0: '0',
              50000: '5万',
              100000: '10万'
            }
          }
        }
      ],
      buttons: [
        {
          text: '查询',
          type: 'primary',
          action: 'query'
        },
        {
          text: '重置',
          action: 'reset'
        },
        {
          text: '导出',
          action: 'export'
        }
      ]
    }
  },
  
  // 表格及维度配置
  tableBlock: {
    title: '销售数据详情',
    titleExtra: {
      refreshButton: true,
      exportButton: true,
      columnSettingButton: true
    },
    
    // 维度配置
    dimension: {
      title: '维度选择',
      config: [
        {
          value: 'product',
          label: '产品',
          name: 'productName',
          fixed: true,
          default: true
        },
        {
          value: 'category',
          label: '类别',
          name: 'categoryName',
          default: true
        },
        {
          value: 'region',
          label: '地区',
          name: 'regionName',
          default: true
        },
        {
          value: 'channel',
          label: '渠道',
          name: 'channelName'
        },
        {
          value: 'department',
          label: '部门',
          name: 'departmentName'
        }
      ]
    },
    
    // 口径配置
    caliber: {
      title: '指标选择',
      config: [
        { label: '销售额', value: 'sales', default: true },
        { label: '销售量', value: 'volume', default: true },
        { label: '利润率', value: 'profit', default: true },
        { label: '客单价', value: 'avgPrice' },
        { label: '转化率', value: 'conversionRate' },
        { label: '退货率', value: 'returnRate' }
      ]
    },
    
    // 日期分组配置
    dateGroup: {
      title: '时间粒度',
      config: [
        { label: '按日', value: 'day' },
        { label: '按周', value: 'week' },
        { label: '按月', value: 'month', default: true },
        { label: '按季', value: 'quarter' },
        { label: '按年', value: 'year' }
      ]
    },
    
    // 表格配置
    table: {
      config: {
        columns: [
          { colKey: 'date', title: '日期', width: 120, fixed: 'left' },
          { colKey: 'productName', title: '产品', width: 150 },
          { colKey: 'categoryName', title: '类别', width: 120 },
          { colKey: 'regionName', title: '地区', width: 120 },
          { colKey: 'channelName', title: '渠道', width: 120 },
          { colKey: 'departmentName', title: '部门', width: 150 },
          { 
            colKey: 'sales', 
            title: '销售额(元)', 
            width: 150, 
            align: 'right',
            sorter: true,
            filter: {
              type: 'input',
              resetValue: null,
            }
          },
          { 
            colKey: 'volume', 
            title: '销售量(件)', 
            width: 150, 
            align: 'right',
            sorter: true
          },
          { 
            colKey: 'profit', 
            title: '利润率(%)', 
            width: 120, 
            align: 'right',
            sorter: true,
            cell: { type: 'progress' }
          },
          { 
            colKey: 'avgPrice', 
            title: '客单价(元)', 
            width: 130, 
            align: 'right' 
          },
          { 
            colKey: 'conversionRate', 
            title: '转化率(%)', 
            width: 120, 
            align: 'right' 
          },
          { 
            colKey: 'returnRate', 
            title: '退货率(%)', 
            width: 120, 
            align: 'right' 
          },
          { 
            colKey: 'operation', 
            title: '操作', 
            width: 120,
            fixed: 'right',
            cell: {
              type: 'button',
              buttons: [
                { content: '详情', type: 'link', action: 'detail' },
                { content: '编辑', type: 'link', action: 'edit' }
              ]
            }
          }
        ],
        rowKey: 'id',
        pagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
          total: 0
        },
        summary: {
          show: true,
          columns: ['sales', 'volume', 'profit'],
          calcFunc: 'sum'
        },
        bordered: true,
        stripe: true,
        size: 'medium',
        scroll: { x: 1600 },
        dragSort: 'col'
      }
    }
  },
  
  // 多图表配置
  chartBlocks: [
    {
      id: 'salesTrend',
      title: '销售趋势分析',
      chartType: 'line',
      dataKeys: ['date', 'sales', 'volume'],
      showLegend: true,
      config: {
        xAxis: {
          type: 'category',
          data: [] // 动态填充
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            position: 'left'
          },
          {
            type: 'value',
            name: '销售量(件)',
            position: 'right'
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['销售额', '销售量']
        },
        series: [] // 动态填充
      }
    },
    {
      id: 'regionSales',
      title: '区域销售分布',
      chartType: 'pie',
      dataKeys: ['regionName', 'sales'],
      config: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '区域销售额',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [] // 动态填充
          }
        ]
      }
    },
    {
      id: 'productPerformance',
      title: '产品销售表现',
      chartType: 'bar',
      dataKeys: ['productName', 'sales', 'profit'],
      config: {
        xAxis: {
          type: 'category',
          data: [] // 动态填充
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)'
          },
          {
            type: 'value',
            name: '利润率(%)',
            min: 0,
            max: 100,
            position: 'right'
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['销售额', '利润率']
        },
        series: [] // 动态填充
      }
    }
  ],
  
  // 提示信息
  tipsBlock: {
    title: '数据说明',
    collapsible: true,
    defaultCollapsed: false,
    textList: [
      '数据更新时间：每日凌晨3点',
      '销售额单位：人民币元',
      '利润率 = (销售额 - 成本) / 销售额 × 100%',
      '转化率 = 下单用户数 / 访问用户数 × 100%',
      '退货率 = 退货商品数 / 销售商品数 × 100%'
    ]
  },
  
  // 权限配置
  permissionConfig: {
    exportPermission: 'BI_EXPORT_DATA',
    editPermission: 'BI_EDIT_CONFIG',
    viewDetailPermission: 'BI_VIEW_DETAIL'
  },
  
  // 高级配置
  advancedConfig: {
    autoRefresh: {
      enabled: false,
      interval: 5 // 分钟
    },
    dataSource: {
      type: 'api',
      url: '/api/sales/dashboard'
    },
    exportConfig: {
      fileName: '销售数据分析报表',
      includeAllData: true,
      formats: ['xlsx', 'csv', 'pdf']
    }
  }
};
`;

/**
 * 辅助函数：根据产品需求自动生成配置代码
 * @param markdownContent 产品需求Markdown内容
 * @param enumMappings 枚举映射关系
 * @returns 生成的配置代码
 */
export async function generateConfigFromMarkdown(markdownContent: string, enumMappings: EnumMapping = productEnums) {
  // 这里可以实现直接调用大模型生成代码的逻辑
  // 或者在这里对大模型生成的配置进行预处理和后处理
  
  // 示例实现，实际可能需要更复杂的逻辑
  const prompt = `${DEFAULT_CONVERT_RULE.prompt}\n\n以下是需要转换的Markdown内容：\n\n${markdownContent}`;
  
  // 这里可以调用大模型API
  // const response = await callLLMApi(prompt);
  
  // 返回处理后的结果
  return {
    content: markdownContent,
    generatedConfig: "// 这里将是生成的配置代码",
    enumMappings
  };
}
