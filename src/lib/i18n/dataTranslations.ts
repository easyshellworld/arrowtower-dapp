// 数据库内容的翻译映射
// 由于数据库中的路线和POI名称是中文，我们在前端做翻译映射

export const dataTranslations: {
  routes: Record<string, string>;
  pois: Record<string, string>;
  descriptions: Record<string, string>;
} = {
  routes: {
    // 路线名称
    "箭塔村创业探索": "Arrow Tower Entrepreneurship Exploration",
    "箭塔村创业路径": "Arrow Tower Entrepreneurship Path",
    "箭塔村文化历史": "Arrow Tower Cultural History",
  },
  pois: {
    // POI 名称
    "箭塔": "Arrow Tower",
    "箭塔村村史馆": "Village History Museum",
    "周先生的百草园": "Mr. Zhou's Herb Garden",
    "吾乡乡村创业孵化器": "Rural Startup Incubator",
    "青年创客营地": "Youth Maker Camp",
    "猫鼻子餐厅": "Cat's Nose Restaurant",
    "山茶花社": "Camellia Society",
    // 带前缀的名称
    "箭塔村——吾乡乡村创业孵化器": "Arrow Tower - Rural Startup Incubator",
    "箭塔村——箭塔村村史馆": "Arrow Tower - Village History Museum",
    "箭塔村——周先生的百草园": "Arrow Tower - Mr. Zhou's Herb Garden",
    "箭塔村——青年创客营地": "Arrow Tower - Youth Maker Camp",
    "箭塔村——猫鼻子餐厅": "Arrow Tower - Cat's Nose Restaurant",
    "箭塔村——山茶花社": "Arrow Tower - Camellia Society",
  },
  descriptions: {
    // 路线描述
    "箭塔村创业路径": "Explore the entrepreneurship ecosystem of Arrow Tower Village",
    "箭塔村文化历史": "Discover the rich cultural history of Arrow Tower Village",
    // POI 描述
    "吾乡乡村创业孵化器是箭塔村的创业空间": "A startup incubator space in Arrow Tower Village for rural entrepreneurs",
    "箭塔村村史馆展示村庄历史": "The Village History Museum showcases the rich history of Arrow Tower",
    "周先生的百草园是一个中草药园": "Mr. Zhou's Herb Garden is a traditional Chinese herbal medicine garden",
    "青年创客营地是年轻人创业的基地": "Youth Maker Camp is a base for young entrepreneurs",
    "猫鼻子餐厅提供当地特色美食": "Cat's Nose Restaurant serves authentic local cuisine",
    "山茶花社是一个茶文化体验空间": "Camellia Society is a tea culture experience center",
  }
};

// 翻译函数：如果找到翻译则返回翻译，否则尝试部分匹配
export function translateData(text: string | null | undefined, type: 'routes' | 'pois' | 'descriptions', locale: 'en' | 'zh'): string {
  if (locale === 'zh' || !text) return text || '';
  
  // 直接匹配
  if (dataTranslations[type][text]) {
    return dataTranslations[type][text];
  }
  
  // 尝试在所有类型中查找
  for (const category of ['routes', 'pois', 'descriptions'] as const) {
    if (dataTranslations[category][text]) {
      return dataTranslations[category][text];
    }
  }
  
  // 尝试部分匹配（处理包含中文的情况）
  for (const [zhText, enText] of Object.entries(dataTranslations[type])) {
    if (text.includes(zhText)) {
      return text.replace(zhText, enText);
    }
  }
  
  return text;
}
