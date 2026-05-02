import type { SiteText } from "./text-en";

export const zh: SiteText = {
  brand: {
    de: "D&E",
    product: "Property Pro",
    full: "D&E Property Pro"
  },
  nav: {
    mainAria: "主导航",
    nav_home: "首页",
    nav_about: "关于我们",
    nav_services: "服务",
    nav_projects: "项目",
    nav_properties: "房源",
    nav_house_package: "房源套餐",
    nav_labs: "D&E 实验室",
    nav_risk_report: "购房风险",
    nav_contact: "联系",
    button_start: "开始360"
  },
  common: {
    explore: "了解详情",
    featured: "精选",
    newBadge: "新品",
    yes: "是",
    no: "否",
    close: "关闭",
    submit: "提交",
    submitting: "提交中…",
    sending: "发送中…",
    residential: "住宅",
    commercial: "商业",
    retail: "零售",
    industrial: "工业",
    other: "其他",
    bookConsultation: "预约咨询"
  },
  errors: {
    invalidResponse: "服务器响应无效。",
    serverNoConfirm: "服务器未确认发送成功。",
    networkError: "网络错误，请检查连接后重试。",
    genericTryAgain: "发生错误，请重试。",
    submitFailed: "提交失败，请重试。",
    somethingWrong: "出现错误。",
    failedSaveRequest: "无法保存您的请求。",
    networkRetry: "网络错误，请重试。"
  },
  home: {
    heroKicker: "D&E Property Pro",
    heroTitle: "让您的房产变成360°沉浸式体验",
    heroSubtitle: "让客户在线浏览您的空间并通过AI获取真实客户",
    btn_demo: "开始360演示",
    btn_package: "查看房源套餐",
    btn_quote: "获取报价",
    investmentTitle: "探索投资机会",
    investmentLead: "发现墨尔本快速增长区域中精选的土地别墅套餐。",
    featuredKicker: "精选",
    featuredTitle: "精品土地别墅套餐",
    featuredPrice: "起价 $620,000",
    featuredSub: "高增长区域 • 拎包入住 • 适合投资",
    featuredCta: "查看房源 →",
    card360Title: "AI 互动式360体验",
    card360Body: "以沉浸式导览提升客户意向，在实地看房前完成筛选。",
    card360Cta: "体验360",
    packageTitle: "土地别墅投资套餐",
    packageBody: "以区位逻辑、生活细节与投资叙事呈现高端套餐。",
    packageCta: "查看套餐",
    affordLine: "不确定能承担多少？",
    affordCta: "运行 Compare AI",
    flagshipKicker: "旗舰产品",
    flagshipTitle: "AI 互动式360房产体验",
    flagshipBody: "以适合地产与商业场景的全互动360体验展示您的店铺或项目",
    liveDemo: "查看在线演示",
    requestPricing: "咨询报价",
    iframe360Preview: "AI 互动式360房产体验 — 在线预览",
    aiSectionTitle: "助力线索转化的 AI 工具",
    aiSectionLead: "与360体验配套的可选工具——等高卡片，清晰下一步。",
    aiTools: [
      {
        title: "CompareMe AI",
        description: "与同级人群对比收入与财务状况，优化房产决策。",
        href: "/compare"
      },
      {
        title: "Financial Personality AI",
        description: "了解金钱性格与行为模式，规划下一步。",
        href: "/personality"
      },
      {
        title: "Invoice Extract AI",
        description: "自动提取发票数据并结构化——即将上线。",
        href: "/labs"
      },
      {
        title: "AI 360",
        description: "面向地产与零售的热点与多媒体沉浸式360展示。",
        href: "/#interactive-360-home"
      }
    ],
    closingTitle: "准备获取更多线索？",
    closingBody: "了解360与AI如何帮助业务获客",
    closingCta: "预约免费咨询"
  },
  about: {
    kicker: "关于",
    title: "关于 D&E Property Pro",
    paragraphs: [
      "D&E Property Pro 是一家现代房产咨询与数字方案公司，将实践经验与AI工具结合，帮助业主、投资人与企业更聪明地决策、更好地展示资产，并获得真实业务成果。",
      "当下的房产不仅是地段与价格，更取决于呈现、分析与营销的效率。许多业主面临曝光不足、流程低效与缺乏数据决策的问题。我们以房产专业与可落地的AI方案弥合这一差距。",
      "我们的服务涵盖房产咨询、策略规划、AI自动化，以及360°互动数字体验。我们专注交付不仅创新、更能在真实业务中使用的工具。",
      "我们与地产专业人士、商业地产主、中小企业主及希望现代化运营、吸引更多客户的开发商合作。",
      "目标很简单：用技术创造真实商业价值。不炒作、不空谈——只提供能带来更多线索、提升效率、促成交易的方案。"
    ],
    ctaTitle: "准备一起合作？",
    ctaLead: "告诉我们您的房产或业务目标——我们将给出清晰的下一步。",
    ctaButton: "与我们合作"
  },
  services: {
    kicker: "服务",
    title: "我们的服务",
    lead: "我们将房产专业与AI驱动工具结合，助您更快成长。",
    flagshipLabel: "旗舰",
    cards: [
      {
        title: "房产咨询与策略",
        description: "在投资定位、资产呈现与商业策略上提供专业指导，以提升价值与表现。",
        highlight: false
      },
      {
        title: "AI 驱动方案",
        description: "定制AI工具，用于流程自动化、数据分析与提升决策效率。",
        highlight: false
      },
      {
        title: "360° 互动房产体验",
        description: "将您的房产打造为沉浸式360体验，吸引客户并产生真实线索。",
        highlight: true
      }
    ],
    learnMore: "了解更多",
    getQuote: "获取报价",
    bottomTitle: "不知道从哪里开始？",
    bottomLead: "预约简短沟通——我们将为您匹配合适的咨询、AI与360组合。",
    bottomCta: "联系我们"
  },
  projects: {
    kicker: "作品",
    title: "项目案例",
    lead: "真实方案，带来真实结果。",
    items: [
      {
        title: "AI 360° 商业空间体验",
        description: "互动式360商业空间，让客户远程探索并与品牌互动。",
        action: "查看演示",
        href: "/#interactive-360-home"
      },
      {
        title: "财务分析工具",
        description: "帮助用户理解财务位置并做出更优决策的智能工具。",
        action: "查看演示",
        href: "/compare"
      },
      {
        title: "发票自动化系统",
        description: "自动提取发票，提高效率并减少人工。",
        action: "了解详情",
        href: "/labs"
      }
    ],
    ctaTitle: "想要类似方案？",
    ctaLead: "分享您的需求——我们将梳理范围、时间线，以及360与AI如何契合目标。",
    ctaButton: "启动项目"
  },
  labs: {
    kicker: "D&E 实验室",
    title: "创造真实商业价值的 AI 工具",
    lead: "探索面向地产与商业场景的AI解决方案",
    featuredBadge: "精选",
    products: [
      {
        name: "AI 互动式360店铺",
        description: "沉浸式360、可点击热点与视频整合，让客户远程探索空间。",
        button: "查看在线演示",
        href: "#interactive-360-demo",
        active: true,
        tone: "featured",
        featured: true
      },
      {
        name: "CompareMe AI",
        description: "比较收入与财务状况，获得清晰参照。",
        button: "了解详情",
        href: "/compare",
        active: true,
        tone: "blue",
        featured: false
      },
      {
        name: "Financial Personality AI",
        description: "发现金钱性格与行为模式。",
        button: "开始",
        href: "/personality",
        active: true,
        tone: "purple",
        featured: false
      },
      {
        name: "Invoice Extract AI",
        description: "自动将发票数据提取到 Excel。",
        button: "即将推出",
        href: "#",
        active: false,
        tone: "slate",
        featured: false
      }
    ],
    demoTitle: "AI 互动式360店铺",
    demoLead:
      "以沉浸式360、可点击热点与富媒体展示空间——适用于地产与零售陈列。",
    iframeTitle: "AI 互动式360店铺 — Kuula 虚拟导览",
    featureWalkTitle: "360° 全景漫游",
    featureWalkBody: "顺畅导览整体环境，让客户在到店前就有在场感。",
    featureHotspotsTitle: "可点击热点",
    featureHotspotsBody: "以可点信息突出产品、装修或房源，展示规格与下一步。",
    featureVideoTitle: "导览内嵌视频",
    featureVideoBody: "叠加讲解视频与叙事，让体验不仅展示空间，更能教育并转化。",
    businessValueTitle: "业务价值",
    businessBullets: [
      "以互动、自助式体验提升客户参与度。",
      "以高级数字首印象脱颖而出。",
      "在实地到访前以透明与清晰建立信任。",
      "打造24/7数字展厅，持续工作。"
    ],
    bookDemo: "预约演示",
    getQuote: "获取报价",
    requestDemo: "申请演示",
    modalDemoTitle: "预约演示",
    modalQuoteTitle: "获取报价",
    modalHint: "填写信息，我们将在24小时内联系您。",
    formName: "姓名",
    formEmail: "邮箱",
    formPhone: "电话",
    formMessage: "留言",
    formSuccess: "感谢，我们将在24小时内联系您。"
  },
  personality: {
    landingKicker: "性格测试",
    landingTitle: "发现你的财务性格",
    landingLead: "完成简短测评，了解主导金钱行为类型。",
    startTest: "开始测试",
    questionProgress: "第 {{current}} / {{total}} 题",
    emailPrompt: "输入邮箱以获取完整报告",
    placeholderEmail: "you@example.com",
    sending: "发送中...",
    getReport: "获取完整报告",
    successEmail: "报告已发送至您的邮箱。",
    errorEmail: "发送失败，请重试。",
    retake: "重新测试",
    questions: [
      {
        text: "当你获得一笔意外额外收入时，通常会先做哪件事？",
        options: [
          { key: "A", label: "转入储蓄或长期规划。" },
          { key: "B", label: "一部分用于增长，一部分保留备用。" },
          { key: "C", label: "用于生活方式升级或体验消费。" },
          { key: "D", label: "留在账户里，以后再决定。" }
        ]
      },
      {
        text: "你会如何描述自己的财务决策风格？",
        options: [
          { key: "A", label: "系统化、有计划、风险可控。" },
          { key: "B", label: "兼顾算计与灵活，偏向成长。" },
          { key: "C", label: "情绪化且偏短期。" },
          { key: "D", label: "被动应对，取决于当下压力。" }
        ]
      },
      {
        text: "你通常如何管理月度预算？",
        options: [
          { key: "A", label: "每月执行清晰、可追踪的预算。" },
          { key: "B", label: "跟踪趋势并按机会调整。" },
          { key: "C", label: "先花再说，有必要才复盘。" },
          { key: "D", label: "没有稳定的预算结构。" }
        ]
      },
      {
        text: "你如何对待投资或财富积累？",
        options: [
          { key: "A", label: "稳健、低波动、长期。" },
          { key: "B", label: "策略性、选择性、成长导向。" },
          { key: "C", label: "只有非常有动力时才会行动。" },
          { key: "D", label: "尚未形成清晰方法。" }
        ]
      },
      {
        text: "面对大额购买决策时，你通常会：",
        options: [
          { key: "A", label: "先评估长期影响再行动。" },
          { key: "B", label: "比较收益、时机与机会成本。" },
          { key: "C", label: "若感觉值得就快速决定。" },
          { key: "D", label: "拖延到压力迫使决策。" }
        ]
      },
      {
        text: "面对财务不确定性时，你如何回应？",
        options: [
          { key: "A", label: "强化计划并降低不必要风险。" },
          { key: "B", label: "快速调整以保护并寻求增长。" },
          { key: "C", label: "消费习惯基本不变。" },
          { key: "D", label: "停顿回避明确决策。" }
        ]
      },
      {
        text: "哪一项最符合你与财务目标的关系？",
        options: [
          { key: "A", label: "设定清晰里程碑并持续执行。" },
          { key: "B", label: "根据市场机会设定动态目标。" },
          { key: "C", label: "偏好灵活胜过硬性指标。" },
          { key: "D", label: "目标笼统且很少复盘。" }
        ]
      },
      {
        text: "你会如何描述当前财务走势？",
        options: [
          { key: "A", label: "稳定受控，稳步前进。" },
          { key: "B", label: "向上，并有意识推动增长。" },
          { key: "C", label: "起伏不定，时进时退。" },
          { key: "D", label: "方向不清，尚未固定轨道。" }
        ]
      }
    ],
    profiles: {
      A: {
        title: "你是规划者型（The Architect）",
        description: "你重视结构、控制与长期财务安全。",
        image:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad64e?auto=format&fit=crop&w=900&q=80"
      },
      B: {
        title: "你是策略者型（The Strategist）",
        description: "你前瞻思考，在增长与审慎决策之间取得平衡。",
        image:
          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80"
      },
      C: {
        title: "你是消费导向型（The Spender）",
        description: "你优先考虑生活方式、速度与即时结果。",
        image:
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=80"
      },
      D: {
        title: "你是漂流者型（The Drifter）",
        description: "你保持灵活，但资金流缺乏固定方向。",
        image:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
      }
    }
  },
  compare: {
    pageKicker: "Compare AI",
    title: "了解您的财务位置",
    subtitle: "30秒获取个性化房产准备度评分",
    age: "年龄段",
    income: "年收入（税前）",
    savings: "当前存款",
    property: "是否已有房产？",
    email: "邮箱",
    submit: "生成我的报告",
    generating: "生成中…",
    success: "报告已发送至您的邮箱",
    reportTitle: "您的房产投资报告",
    score: "房产准备度评分",
    summary: "摘要",
    snapshot: "财务快照",
    strategy: "AI 策略",
    timing: "入市时机",
    risks: "风险提示",
    recommended: "推荐房源",
    nextAction: "下一步",
    book: "预约咨询",
    contactAgent: "联系顾问",
    viewProps: "查看匹配房源",
    leadHot: "高意向",
    leadWarm: "温和",
    leadCold: "培育期",
    leadLevel: "客户分级",
    salesAdvice: "AI 销售话术",
    preferredCity: "偏好区域/城市（选填）",
    budgetHint: "参考可买预算 ≈ 存款×5 + 年收入×3",
    salesInsight: "销售建议",
    cityPlaceholder: "例如：Melbourne",
    yes: "是",
    no: "否"
  },
  riskReport: {
    pageKicker: "决策前评估",
    title: "购房风险报告",
    subtitle: "在出手前自动识别风险维度，并给出综合安全分。",
    income: "年收入（澳元，税前）",
    savings: "可用存款 / 首付",
    ownership: "是否已有房产？",
    userLocation: "意向区域 / 偏好地段",
    propPrice: "房源价格（澳元）",
    propLocation: "房源所在区域 / 地址",
    propType: "物业类型",
    typeHouse: "独栋别墅",
    typeApt: "公寓 / 单元房",
    submit: "生成风险报告",
    analyzing: "分析中…",
    scoreLabel: "安全分",
    breakdownTitle: "风险分解",
    financial: "财务风险",
    cashflow: "现金流风险",
    location: "地段匹配",
    property: "物业类型风险",
    liquidity: "流动性风险",
    aiTitle: "智能总结",
    recTitle: "建议",
    tierFull: "完整报告",
    tierFree: "仅分数（免费预览）",
    upgradeHint: "升级可查看完整分解、智能解读与专业建议。",
    riskHigh: "高",
    riskMedium: "中",
    riskLow: "低"
  },
  contact: {
    kicker: "联系",
    title: "联系我们",
    lead: "与我们探讨房产增长与商业合作机会。",
    asideTitle: "直接联系",
    asideBody: "商务合作、渠道或房产咨询，欢迎邮件或表单留言。",
    businessLabel: "商务联系",
    response: "我们通常在24小时内回复。",
    back360: "← 返回360°演示",
    formTitle: "发送咨询",
    formHint: "简短留言即可，我们会邮件回复。",
    name: "姓名",
    email: "邮箱",
    propertyType: "物业类型",
    message: "留言",
    send: "发送咨询",
    sending: "发送中…",
    thanks: "已收到您的留言，我们将在24小时内回复。",
    errorTitle: "发送失败。",
    errorEmailIntro: "您也可以发送邮件至 ",
    errorEmailOutro: "。"
  },
  properties: {
    kicker: "房源",
    title: "房源列表",
    subtitle: "精选投资机会，匹配不同买家画像。",
    empty: "暂无房源，请稍后再试。",
    from: "起价",
    footerConsultation: "私人咨询预约 →"
  },
  house: {
    heroTitle: "精品土地别墅套餐",
    heroLead: "为墨尔本现代居住与长期投资而设计",
    heroTag: "高增长区域的限时机会",
    ctaDetails: "了解详情",
    cta360: "查看360°体验",
    galleryKicker: "图库",
    galleryTitle: "精心雕琢的空间",
    galleryBody:
      "从外立面到起居、厨房与休憩空间——如同高端开发商展厅般的叙事节奏。",
    heroAlt: "日落时分带景观前院的现代澳洲住宅",
    galleryAlts: [
      "暮色草坪旁的现代住宅外观",
      "自然采光充沛的开放式起居空间",
      "石材台面的当代厨房",
      "柔和日光下的主卧空间",
      "精致饰面与设计感卫浴"
    ],
    keyInfoKicker: "关键信息",
    keyInfoTitle: "支撑决策的核心数字",
    stats: [
      { label: "价格", value: "起价 $620,000", note: "套餐指导价" },
      { label: "区位", value: "墨尔本", note: "高增长走廊" },
      { label: "卧室", value: "4", note: "宽裕居住空间" },
      { label: "卫浴", value: "2", note: "含主卧套卫" },
      { label: "车位", value: "2", note: "安全停放" },
      { label: "土地面积", value: "300–400 m²", note: "以地块为准" }
    ],
    snapshotTitle: "投资快照",
    snapshotCards: [
      { label: "价格", value: "$62万–$68万" },
      { label: "租金回报", value: "4–5%" },
      { label: "土地面积", value: "300–400 平米" },
      { label: "户型配置", value: "4 卧 / 2 卫 / 2 车位" }
    ],
    lifestyleTitle: "为生活方式而设计",
    lifestyle: [
      {
        title: "现代建筑语言",
        text: "简洁线条、体面街景与贴合真实日常动线的户型。"
      },
      {
        title: "功能分区",
        text: "娱乐与休憩分区明确，从最初平面就考虑储物与动线。"
      },
      {
        title: "材质品质",
        text: "兼顾耐久与经典审美的饰面——二次看房仍能打动买家的细节。"
      }
    ],
    whyTitle: "为何值得关注",
    whyIntro:
      "下列因素是买家比较新建土地别墅时常评估的维度——此处仅作结构化快照，不构成业绩承诺。",
    whyPoints: [
      "基建与就业节点支撑走廊的长期增值潜力。",
      "专业人士与小家庭对新房的租赁需求旺盛。",
      "邻近学校、零售与交通，有助于长期流动性。",
      "兼顾自住积累净资产与追求租金收益及土地增值的投资者。"
    ],
    experience360Kicker: "360° 体验",
    experience360Title: "360° 探索该物业",
    experience360Line1: "到访前先沉浸式感受空间。",
    experience360Line2: "以更自信的观摩支撑决策。",
    iframe360Title: "物业 360° 导览",
    compareBannerTitle: "不确定这套是否适合您？",
    compareBannerBody: "在索取完整资料前，先运行 Compare AI 快速了解准备度。",
    compareBannerCta: "运行 Compare AI",
    leadTitle: "获取完整物业报告",
    leadBody: "获取详细解读、价格拆解与投资分析。",
    leadPreferEmailPrefix: "更倾向邮件？",
    stickyGetPackage: "获取完整资料",
    stickyCompare: "运行 Compare AI",
    leadForm: {
      name: "姓名",
      email: "邮箱",
      message: "留言",
      messagePlaceholder: "请说明您最希望了解哪些信息。",
      submit: "获取完整资料与价格拆解",
      sending: "发送中…",
      thanks: "感谢，我们将尽快把完整报告发送至您的邮箱。",
      errorFallback: "出现错误。"
    },
    leadSource: "房源套餐",
    inquiryRecordName: "房源套餐咨询"
  }
};
