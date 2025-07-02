import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DASHBOARD_ENUM_MAPPINGS } from "./const.js";
// 添加DEFAULT_CONVERT_RULE的定义
const DEFAULT_CONVERT_RULE = {
  prompt: "请将以下Markdown格式的需求文档转换为TypeScript配置代码，生成一个符合需求的仪表盘配置对象。",
  examples: [
    {
      input: "示例输入",
      output: "示例输出"
    }
  ]
};



// 定义类型接口
interface DashboardConfig {
  title: string;
  dimensions?: {
    config: Array<{
      value: string;
      label: string;
      name?: string;
      fixed?: boolean;
      disabledSort?: boolean;
      children?: string[];
    }>
  };
  caliber?: {
    config: Array<{
      label: string;
      value: number | string;
    }>
  };
  dateGroup?: {
    config: Array<{
      label: string;
      value: string;
    }>
  };
  table?: {
    config: {
      tableBlock: {
        tableProps: {
          columns: Array<{
            field: string;
            title: string;
            fixed?: string;
            align?: string;
          }>
        }
      }
    }
  };
}

// 添加Markdown解析和转换函数
function parseMarkdownSections(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  if (!markdown) {
    console.error("Markdown内容为空");
    return sections;
  }
  
  try {
    // 分割行
    const lines = markdown.split('\n');
    let currentSection: string | null = null;
    let currentContent: string[] = [];
    
    console.log(`开始解析Markdown，共${lines.length}行`);
    
    // 查找顶级标题作为标题内容
    if (lines.length > 0 && lines[0].startsWith('# ')) {
      sections["_title_"] = lines[0].substring(2).trim();
      console.log(`找到顶级标题: ${sections["_title_"]}`);
    }
    
    // 逐行处理，查找三级标题和内容
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 如果是三级标题，开始一个新的部分
      if (line.startsWith('### ')) {
        // 如果之前有部分正在处理，保存它
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
          console.log(`保存部分 "${currentSection}" 内容长度: ${sections[currentSection].length}`);
        }
        
        // 开始新部分
        currentSection = line.substring(4).trim();
        currentContent = [];
        console.log(`发现新部分: ${currentSection}`);
      }
      // 如果不是标题且当前有活动的部分，添加到内容
      else if (currentSection && !line.startsWith('#')) {
        // 跳过空行
        if (line.trim()) {
          currentContent.push(line);
        }
      }
    }
    
    // 保存最后一个部分
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
      console.log(`保存最后部分 "${currentSection}" 内容长度: ${sections[currentSection].length}`);
    }
    
    console.log(`解析完成，共找到 ${Object.keys(sections).length} 个部分`);
  } catch (error) {
    console.error("解析Markdown部分失败:", error);
  }
  
  return sections;
}

// 查找匹配的枚举键
function findMatchingEnumKey(sectionTitle: string): string | null {
  for (const [key, config] of Object.entries(DASHBOARD_ENUM_MAPPINGS)) {
    if (config.patterns.some(pattern => sectionTitle.includes(pattern))) {
      return key;
    }
  }
  return null;
}

// 转换维度内容为配置
function dimensionsToConfig(content: string) {
  // 防御性检查
  if (!content) {
    return { config: [] };
  }
  
  const dimensions = (content || '').split(/，|,|\n/).map(dim => dim?.trim() || '').filter(Boolean);
  return {
    config: dimensions.map(dim => {
      // 检查是否有特殊处理
      if (DASHBOARD_ENUM_MAPPINGS.dimensions.specialCases && 
          dim && 
          DASHBOARD_ENUM_MAPPINGS.dimensions.specialCases[dim]) {
        return DASHBOARD_ENUM_MAPPINGS.dimensions.specialCases[dim];
      }
      
      // 默认格式
      const key = (dim || '').toLowerCase().replace(/[\s-]/g, '');
      return {
        value: `${key}_id`,
        label: dim,
        name: `${key}_name`
      };
    })
  };
}

// 转换口径内容为配置
function caliberToConfig(content: string) {
  // 防御性检查
  if (!content) {
    return { config: [] };
  }
  
  const calibers = (content || '').split(/，|,|\n/).map(cal => cal?.trim() || '').filter(Boolean);
  return {
    config: calibers.map(cal => {
      // 检查是否有特殊处理
      if (DASHBOARD_ENUM_MAPPINGS.caliber.mappings && 
          cal && 
          DASHBOARD_ENUM_MAPPINGS.caliber.mappings[cal]) {
        return DASHBOARD_ENUM_MAPPINGS.caliber.mappings[cal];
      }
      
      // 默认格式
      return {
        label: cal,
        value: 0
      };
    })
  };
}

// 转换日期分组内容为配置
function dateGroupToConfig(content: string) {
  // 防御性检查
  if (!content) {
    return { config: [] };
  }
  
  const dateTypes = (content || '').split(/，|,|\n/).map(type => type?.trim() || '').filter(Boolean);
  const mappings = DASHBOARD_ENUM_MAPPINGS.dateGroup.mappings || {};
  
  return {
    config: dateTypes
      .map(type => (type && mappings[type]) || { label: type || '', value: (type || '').toLowerCase() })
      .filter(item => item.label) // 确保有标签
  };
}

// 转换表格内容为配置
function tableToConfig(content: string) {
  // 防御性检查
  if (!content) {
    return { 
      config: { 
        tableBlock: { 
          tableProps: { 
            columns: [] 
          } 
        } 
      } 
    };
  }
  
  const columns = (content || '').split(/，|,|\n/).map(col => col?.trim() || '').filter(Boolean);
  const columnMappings = DASHBOARD_ENUM_MAPPINGS.table.columnMappings || {};
  
  return {
    config: {
      tableBlock: {
        tableProps: {
          columns: columns.map((col, index) => {
            // 检查是否有特殊处理
            if (columnMappings && col && columnMappings[col]) {
              return columnMappings[col];
            }
            
            // 默认格式
            const field = (col || '').toLowerCase().replace(/[\s-]/g, '');
            const column: {
              field: string;
              title: string;
              fixed?: string;
              align?: string;
            } = {
              field,
              title: col || ''
            };
            
            // 第一列通常是固定的ID列
            if (index === 0) {
              column.fixed = 'left';
              column.align = 'center';
            }
            
            return column;
          })
        }
      }
    }
  };
}

// 生成仪表盘配置
function generateDashboardConfig(markdown: string): DashboardConfig {
  const config: DashboardConfig = {
    title: '数据看板' // 默认标题
  };
  
  // 防御性检查
  if (!markdown) {
    return config;
  }
  
  // 解析Markdown各部分
  const sections = parseMarkdownSections(markdown || '');
  
  // 如果找到了主标题，使用它
  if (sections["_title_"]) {
    config.title = sections["_title_"];
    delete sections["_title_"]; // 处理完后删除，避免影响后续处理
  }
  
  // 查找"标题"部分作为备选
  for (const [sectionTitle, content] of Object.entries(sections)) {
    if (sectionTitle && (sectionTitle.includes("标题") || sectionTitle.includes("名称"))) {
      config.title = content || '数据看板';
      break;
    }
  }
  
  // 处理每个部分
  for (const [sectionTitle, sectionContent] of Object.entries(sections)) {
    if (!sectionTitle) continue;
    
    const enumKey = findMatchingEnumKey(sectionTitle);
    
    if (!enumKey) continue; // 如果不在枚举中，跳过处理
    
    // 根据不同的枚举类型进行处理
    switch (enumKey) {
      case 'dimensions':
        config.dimensions = dimensionsToConfig(sectionContent || '');
        break;
      case 'caliber':
        config.caliber = caliberToConfig(sectionContent || '');
        break;
      case 'dateGroup':
        config.dateGroup = dateGroupToConfig(sectionContent || '');
        break;
      case 'table':
        config.table = tableToConfig(sectionContent || '');
        break;
    }
  }
  
  return config;
}

async function main() {
    try {
        const server = new McpServer({
            name: "Tapd Analyser",
            version: "1.0.0",
        });

        server.tool(
            "summarizeWebPage",
            "获取并总结网页内容，提取主要信息",
            {
                url: { type: "string", description: "要获取内容的网页URL，需要包含http://或https://前缀" }
            },
            async ({ url }): Promise<any> => {
                console.log(`收到网页内容请求，URL: ${url}`);
            }
        );
        
        server.tool(
            "transformMarkdownToBIDashboard",
            "将Markdown格式的需求文档转换为仪表盘配置代码",
            {
                markdownContent: { type: "string", description: "Markdown格式的需求文档内容" },
                customRules: { type: "string", description: "自定义转换规则，JSON格式字符串，可选" }
            },
            async ({ markdownContent, customRules }): Promise<any> => {
                
                try {
                    console.log("收到Markdown转换请求，内容长度:", markdownContent?.length || 0);
                    
                    // 使用枚举规则直接转换
                    const dashboardConfig = generateDashboardConfig(markdownContent);
                    console.log("基于枚举规则生成的配置:", JSON.stringify(dashboardConfig, null, 2));
                    
                    // 始终使用枚举映射结果，无需大模型干预
                    console.log("使用枚举映射转换成功，直接返回配置");
                    // 生成最终的JavaScript配置代码
                    const configCode = `// 仪表盘配置
const dashboardConfig = ${JSON.stringify(dashboardConfig, null, 2)};

export default dashboardConfig;`;
                    
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: configCode
                            },
                        ],
                    };
                } catch (error: any) {
                    console.error("处理文档转换请求失败:", error);
                    // 直接返回简单的错误信息，不让大模型进一步处理
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: JSON.stringify({
                                    error: true,
                                    message: `处理失败: ${error.message || '未知错误'}`
                                })
                            },
                        ],
                    };
                }
            }
        );
        const transport = new StdioServerTransport();
        await server.connect(transport);
        process.on('SIGINT', async () => {
            await server.close();
            process.exit(0);
        });

    } catch (error: any) {
        console.error("服务器启动失败:", error);
        process.exit(1);
    }
}

main(); 