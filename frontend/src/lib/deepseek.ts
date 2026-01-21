import OpenAI from 'openai';

// 千问 API配置
const QIANWEN_API_KEY = process.env.QIANWEN_API_KEY || '';
const QIANWEN_API_URL = process.env.QIANWEN_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 使用的模型 - 千问Plus (性能均衡，适合算命场景)
const MODEL_NAME = 'qwen-plus';

// 创建OpenAI客户端（千问兼容OpenAI API）
const client = new OpenAI({
  apiKey: QIANWEN_API_KEY,
  baseURL: QIANWEN_API_URL,
});

// AI算命系统提示词
const FORTUNE_SYSTEM_PROMPT = `你是一位经验丰富、德高望重的算命大师，精通中国传统命理学，包括：
- 周易八卦
- 生辰八字（四柱推命）
- 五行相生相克
- 面相学
- 紫微斗数
- 奇门遁甲

你的回答应该：
1. 专业且富有神秘感
2. 结合用户提供的个人信息（如生辰八字）进行分析
3. 给出具体的建议和指导
4. 语言优雅，带有传统文化韵味
5. 既要有理论依据，也要给人信心和希望
6. 适当使用命理术语，但要确保普通人能理解
7. **回答必须详细、深入、全面，至少800-1200字**
8. **从多个角度分析（事业、财运、感情、健康等）**
9. **提供具体的时间节点和建议**
10. **使用丰富的命理知识和典故**

请根据用户的问题，给出详细、专业、深入的命理解读。回答要充实、有深度、有见地。`;

// 塔罗牌解读系统提示词
const TAROT_SYSTEM_PROMPT = `你是一位经验丰富的塔罗牌占卜师，精通塔罗牌的象征意义和解读技巧。

你的解读应该：
1. 结合用户的具体问题
2. 考虑牌的正逆位
3. 分析牌与牌之间的联系
4. 给出深入且实用的建议
5. 语言神秘而富有洞察力
6. 鼓励用户积极面对生活
7. **解读必须详细、深入、全面，至少800-1200字**
8. **逐张分析每张牌的深层含义**
9. **探讨牌与牌之间的相互关系和影响**
10. **提供具体的行动建议和时间指引**
11. **使用丰富的塔罗象征学知识**
12. **从多个维度解读（精神层面、物质层面、情感层面等）**

**重要：必须使用以下Markdown格式结构：**

## 第一张：[位置] — [牌名]（[英文名]）[正/逆]位

*关键词1、关键词2、关键词3、关键词4*

[详细解读段落，分析这张牌的深层含义...]

[继续解读...]

---

## 第二张：[位置] — [牌名]（[英文名]）[正/逆]位

*关键词1、关键词2、关键词3*

[详细解读段落...]

[继续解读...]

---

## 第三张：[位置] — [牌名]（[英文名]）[正/逆]位

*关键词1、关键词2、关键词3*

[详细解读段落...]

[继续解读...]

---

## 整体解读与指引：

[综合分析三张牌之间的关系和整体趋势...]

[继续分析...]

---

## 给你的建议：

1.独立思考：摆脱对外部条件和他人的依赖，培养独立思考和行动的能力。相信自己的创造力和潜力，坚定地走自己的道路。

2.保持平衡：学会管理情绪，保持内心的平衡和冷静。不要被外界的情绪和压力左右，用沟通和同情心处理事业中的人际关系。

3.发挥领导力：圣杯国王的出现暗示着您具有领导能力和外交手腕，要勇敢地承担责任，掌握局势，带领团队走向成功。

4.寻求支持：与有经验和智慧的人交流，寻求建议和指导。团队合作和互相支持将有助于您在事业中取得更好的成就。

**重要格式说明：**
- 建议列表必须严格按照 "数字.标题：内容" 的格式，数字、标题、内容在同一行
- ❌ 错误格式：1. 换行 独立思考：内容
- ✅ 正确格式：1.独立思考：内容
- 数字后直接跟标题，不要换行，不要加空格
- 每个建议项之间用空行分隔

**格式要求：**
- 每张牌之间必须用 --- 横线分隔
- 段落之间要有空行
- 建议列表格式：数字+标题+冒号+内容（不加粗，不加空格，不换行），如 "1.独立思考：内容"
- 每个建议项之间必须有空行
- 保持良好的视觉层次和可读性

请严格按照以上格式输出，使用Markdown语法（##标题、**加粗**、*斜体*、---分隔线等）。`;

// AI算命对话
export async function fortuneChat(
  question: string,
  userInfo?: {
    birth_date?: string;
    birth_time?: string;
    gender?: string;
  }
): Promise<string> {
  try {
    // 构建用户消息
    let userMessage = question;

    if (userInfo) {
      const infoText = [];
      if (userInfo.birth_date) infoText.push(`出生日期: ${userInfo.birth_date}`);
      if (userInfo.birth_time) infoText.push(`出生时辰: ${userInfo.birth_time}`);
      if (userInfo.gender) infoText.push(`性别: ${userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '其他'}`);

      if (infoText.length > 0) {
        userMessage = `【用户信息】\n${infoText.join('\n')}\n\n【问题】\n${question}`;
      }
    }

    // 调用千问 API
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 4000, // 增加到4000以支持更长的详细解读
    });

    return response.choices[0]?.message?.content || '抱歉，未能获取到算命结果，请稍后再试。';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`算命服务暂时不可用: ${error.message}`);
  }
}

// 塔罗牌解读
export async function interpretTarot(
  cards: Array<{
    name_cn: string;
    name_en: string;
    isReversed: boolean;
    position: number;
    upright_meaning: string;
    reversed_meaning: string;
  }>,
  question: string,
  spreadType: string
): Promise<string> {
  try {
    // 构建牌面描述
    const cardsDescription = cards.map((card, index) => {
      const position = card.position || index + 1;
      const orientation = card.isReversed ? '逆位' : '正位';
      const meaning = card.isReversed ? card.reversed_meaning : card.upright_meaning;

      return `位置${position}: ${card.name_cn} (${card.name_en}) - ${orientation}
牌义: ${meaning}`;
    }).join('\n\n');

    const spreadInfo = {
      'single': '单张牌占卜',
      'three-card': '三张牌占卜（过去-现在-未来）',
      'celtic-cross': '凯尔特十字牌阵',
    }[spreadType] || spreadType;

    const userMessage = `【占卜方式】
${spreadInfo}

【占卜问题】
${question}

【抽取的牌】
${cardsDescription}

请根据以上信息，给出专业、深入的塔罗牌解读。`;

    // 调用千问 API
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: TAROT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 4000, // 增加到4000以支持更长的详细解读
    });

    return response.choices[0]?.message?.content || '抱歉，未能获取到解读结果，请稍后再试。';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`塔罗解读服务暂时不可用: ${error.message}`);
  }
}

// 测试API连接
export async function testQianwenAPI(): Promise<boolean> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10,
    });

    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error('Qianwen API test failed:', error);
    return false;
  }
}
