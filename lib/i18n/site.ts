import type { Lang } from "./home-hero";

export const siteCopy = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      projects: "Projects",
      properties: "Properties",
      housePackage: "House Package",
      labs: "D&E Labs",
      contact: "Contact",
      start360: "Start 360"
    },
    compare: {
      title: "See Where You Stand Financially",
      subtitle: "Get your personalised property readiness score in 30 seconds",
      age: "Your Age Range",
      income: "Annual Income (before tax)",
      savings: "Current Savings",
      property: "Do you own property?",
      email: "Email",
      submit: "Generate My Report",
      generating: "Generating…",
      success: "Report sent to your email",
      reportTitle: "Your Property Investment Report",
      score: "Property Readiness Score",
      summary: "Summary",
      snapshot: "Financial snapshot",
      strategy: "AI strategy",
      timing: "Timing",
      risks: "Risk notes",
      recommended: "Recommended properties",
      nextAction: "Next action",
      book: "Book Consultation",
      contactAgent: "Contact Agent",
      viewProps: "View Matching Properties",
      leadHot: "Hot",
      leadWarm: "Warm",
      leadCold: "Cold",
      leadLevel: "Lead level",
      salesAdvice: "AI sales advice",
      preferredCity: "Preferred area / city (optional)",
      budgetHint: "Matching budget ≈ savings × 5",
      yes: "Yes",
      no: "No"
    },
    contact: {
      kicker: "Contact",
      title: "Contact Us",
      lead: "Let's discuss how we can help your property or business grow.",
      asideTitle: "Reach us directly",
      asideBody:
        "For business inquiries, partnerships, or property consulting, reach out via email or the form.",
      businessLabel: "Business Contact",
      response: "We usually respond within 24 hours.",
      back360: "← Back to 360° demo",
      formTitle: "Send an inquiry",
      formHint: "A short note is enough — we'll reply by email.",
      name: "Name",
      email: "Email",
      propertyType: "Property Type",
      message: "Message",
      send: "Send Inquiry",
      sending: "Sending…",
      thanks: "Thanks — we received your inquiry and will reply within 24 hours.",
      errorTitle: "Could not send your inquiry."
    },
    properties: {
      kicker: "Listings",
      title: "Properties",
      subtitle: "Curated opportunities matched to investor profiles.",
      empty: "No listings available yet. Please check back soon.",
      from: "From"
    },
    house: {
      heroTitle: "Premium House & Land Package",
      heroLead: "Designed for modern living and long-term investment in Melbourne",
      heroTag: "Limited opportunity in a high-growth suburb",
      ctaDetails: "Get Full Details",
      cta360: "View 360 Experience",
      galleryKicker: "Gallery",
      galleryTitle: "Crafted spaces, inside and out",
      galleryBody:
        "A curated sequence of moments — façade, living, kitchen, rest, and retreat — composed like a premium developer sales suite."
    }
  },
  zh: {
    nav: {
      home: "首页",
      about: "关于",
      services: "服务",
      projects: "项目",
      properties: "房源",
      housePackage: "房源套餐",
      labs: "D&E 实验室",
      contact: "联系",
      start360: "开始360"
    },
    compare: {
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
      budgetHint: "匹配预算 ≈ 存款 × 5",
      yes: "是",
      no: "否"
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
      errorTitle: "发送失败。"
    },
    properties: {
      kicker: "房源",
      title: "房源列表",
      subtitle: "精选投资机会，匹配不同买家画像。",
      empty: "暂无房源，请稍后再试。",
      from: "起价"
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
        "从外立面到起居、厨房与休憩空间——如同高端开发商展厅般的叙事节奏。"
    }
  }
} as const;

export function t<K extends keyof (typeof siteCopy)["en"]>(
  lang: Lang,
  section: K,
  key: keyof (typeof siteCopy)["en"][K]
): string {
  const sec = siteCopy[lang][section] as Record<string, string>;
  const fallback = siteCopy.en[section] as Record<string, string>;
  return (sec[key as string] ?? fallback[key as string] ?? "") as string;
}
