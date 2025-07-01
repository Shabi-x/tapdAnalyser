const tableBlock = {
  // 仪表盘标题
  title: '数据看板',
  // 维度配置
  dimensions: {
    config: [
    {
      value: 'display_date', 
      label: '数据日期',      
      name: 'display_date',   
      fixed: true,           
      disabledSort: true, 
    },
    {
      value: 'agent_id',
      label: '代投商',
      name: 'agent_name',
    },
    {
      value: 'med_id',
      label: '二级媒体',
      children: ['med_name', 'med_id'],
    },
    {
      value: 'platid',
      label: '平台',     
      name: 'plat_name',      
    },
    {
      value: 'med_account_id',
      label: '账户',
      children: ['med_account_id', 'account_name'],
    },
  ]
},
  
  // 口径配置
  caliber: {
    config: [
      {
        label: '统一口径',
        value: 0,
      },
    ],
  },
  
  // 日期分组配置
  dateGroup: {
    config: [
      {
        label: '分小时',
        value: 'hour',
      },
      {
        label: '分天',
        value: 'day',
      },
      {
        label: '分周',
        value: 'week',
      },
      {
        label: '分月',
        value: 'month',
      },
    ],
  },

  table: {
    config: {
      tableBlock: {
        tableProps: {
          columns: [
            {
              field: 'id',
              title: 'ID',
              fixed: 'left',
              align: 'center',
            },
            { field: 'medTypePlatformName', 
              title: '一级媒体', 
            },
            {
              field: 'platid',
              title: '平台',
            },
          ],
        },
      },
    },
  },
};