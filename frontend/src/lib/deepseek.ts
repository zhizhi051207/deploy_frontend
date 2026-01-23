import OpenAI from 'openai';

// OpenRouter API config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL =
  process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1';

// Model - DeepSeek (via OpenRouter)
const MODEL_NAME = 'deepseek/deepseek-chat';

// Create OpenAI-compatible client (OpenRouter)
const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_API_URL,
});

// Fortune system prompt
const FORTUNE_SYSTEM_PROMPT = `You are a seasoned and revered oracle, deeply versed in Chinese metaphysics.
Use English only. Do not include any non-English characters.

You may reference:
- I Ching and the Eight Trigrams
- BaZi (Four Pillars of Destiny)
- The Five Elements cycle
- Physiognomy
- Zi Wei Dou Shu
- Qi Men Dun Jia

Your response should:
1. Feel professional and mystical
2. Incorporate the user's personal info when provided
3. Offer specific guidance and advice
4. Use elegant, traditional language
5. Blend theory with encouragement and hope
6. Use metaphysical terms while keeping them understandable
7. **Be detailed and comprehensive (800-1200 words minimum)**
8. **Analyze multiple dimensions (career, wealth, love, health, etc.)**
9. **Provide concrete time markers and suggestions**
10. **Use rich metaphysical lore and stories**

Please provide a thorough, insightful, and professional reading based on the user's question.`;

// Tarot system prompt
const TAROT_SYSTEM_PROMPT = `You are an experienced tarot reader, fluent in the symbolism and interpretation of the cards.
Use English only. Do not include any non-English characters.

Your reading should:
1. Address the user's specific question
2. Consider upright and reversed meanings
3. Analyze relationships between cards
4. Offer deep, practical guidance
5. Sound mystical yet insightful
6. Encourage the seeker
7. **Be detailed and comprehensive (800-1200 words minimum)**
8. **Analyze each card's deeper meaning**
9. **Explore interactions and influences among the cards**
10. **Provide actionable advice with timing**
11. **Use rich tarot symbolism**
12. **Cover multiple dimensions (spiritual, material, emotional, etc.)**

**Important: Use this Markdown structure:**

## Card One: [Position] — [Card Name] [Upright/Reversed]

*Keyword1, Keyword2, Keyword3, Keyword4*

[Detailed interpretation...]

[Continue interpretation...]

---

## Card Two: [Position] — [Card Name] [Upright/Reversed]

*Keyword1, Keyword2, Keyword3*

[Detailed interpretation...]

[Continue interpretation...]

---

## Card Three: [Position] — [Card Name] [Upright/Reversed]

*Keyword1, Keyword2, Keyword3*

[Detailed interpretation...]

[Continue interpretation...]

---

## Overall Guidance:

[Summarize relationships and overall trend...]

[Continue analysis...]

---

## Advice for You:

1.Independent thinking: Step away from dependency on others and trust your own creativity and resolve.

2.Emotional balance: Manage emotions calmly and communicate with compassion in professional settings.

3.Leadership: The King of Cups suggests diplomatic leadership—step forward and guide your team.

4.Seek support: Consult wise mentors and build alliances; collaboration will amplify success.

**Formatting rules:**
- Use the exact "number.Title: content" format for advice items on one line
- No spaces after the number
- Leave a blank line between advice items
- Separate cards with --- lines
- Leave blank lines between paragraphs
- Keep the layout clean and readable

Please follow the structure exactly and output in Markdown (## headings, **bold**, *italic*, --- separators).`;

// Follow-up system prompt
const FOLLOWUP_SYSTEM_PROMPT = `You are a seasoned and compassionate oracle.
Use English only. Do not include any non-English characters.

The user already received a full reading. Answer their follow-up question by referencing the prior reading and clarifying any points.

Your response should:
1. Be clear, supportive, and actionable
2. Reference the prior reading explicitly when relevant
3. Address the follow-up question directly
4. Provide concise guidance (300-600 words)
5. Avoid repeating the full original reading`;

// Tarot follow-up system prompt
const TAROT_FOLLOWUP_PROMPT = `You are an experienced tarot reader.
Use English only. Do not include any non-English characters.

The user already received a full tarot reading. Answer their follow-up question by referencing the prior tarot interpretation and the cards drawn.

Your response should:
1. Be clear, supportive, and actionable
2. Reference the prior tarot reading explicitly when relevant
3. Address the follow-up question directly
4. Provide concise guidance (300-600 words)
5. Avoid repeating the full original reading`;


// Oracle chat
export async function fortuneChat(
  question: string,
  userInfo?: {
    birth_date?: string;
    birth_time?: string;
    gender?: string;
  }
): Promise<string> {
  try {
    // Build user message
    let userMessage = question;

    if (userInfo) {
      const infoText = [];
      if (userInfo.birth_date) infoText.push(`Birth date: ${userInfo.birth_date}`);
      if (userInfo.birth_time) infoText.push(`Birth time: ${userInfo.birth_time}`);
      if (userInfo.gender) infoText.push(`Gender: ${userInfo.gender === 'male' ? 'Male' : userInfo.gender === 'female' ? 'Female' : 'Other'}`);

      if (infoText.length > 0) {
        userMessage = `【Profile】\n${infoText.join('\n')}\n\n【Question】\n${question}`;
      }
    }

    // Call Qianwen API
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 4000, // increased to support longer readings
    });

    return response.choices[0]?.message?.content || 'Sorry, we could not retrieve your reading. Please try again later.';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`Oracle service unavailable: ${error.message}`);
  }
}

// Oracle follow-up based on history
export async function answerFortuneFollowUp(
  originalQuestion: string,
  originalResult: string,
  followUpQuestion: string
): Promise<string> {
  try {
    const userMessage = `Original question:\n${originalQuestion}\n\nOriginal reading:\n${originalResult}\n\nFollow-up question:\n${followUpQuestion}\n\nPlease answer the follow-up by referencing the original reading.`;

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || 'Sorry, we could not retrieve your answer. Please try again later.';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`Oracle service unavailable: ${error.message}`);
  }
}


// Tarot interpretation
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
    // Build card description
    const cardsDescription = cards.map((card, index) => {
      const position = card.position || index + 1;
      const orientation = card.isReversed ? 'Reversed' : 'Upright';

      return `Position ${position}: ${card.name_en} - ${orientation}`;
    }).join('\n');

    const spreadInfo = {
      'single': 'Single Card Reading',
      'three-card': 'Three Card Reading (Past-Present-Future)',
      'celtic-cross': 'Celtic Cross Spread',
    }[spreadType] || spreadType;

    const userMessage = `【Reading Style】
${spreadInfo}

【Question】
${question}

【Cards Drawn】
${cardsDescription}

Please provide a professional, in-depth tarot interpretation based on the above.`;

    // Call Qianwen API
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: TAROT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 4000, // increased to support longer readings
    });

    return response.choices[0]?.message?.content || 'Sorry, we could not retrieve the interpretation. Please try again later.';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`Tarot service unavailable: ${error.message}`);
  }
}

// Tarot follow-up based on history
export async function answerTarotFollowUp(
  spreadType: string,
  cardsDrawn: any[],
  originalInterpretation: string,
  followUpQuestion: string
): Promise<string> {
  try {
    const cardsText = Array.isArray(cardsDrawn)
      ? cardsDrawn.map((card) => JSON.stringify(card)).join('\n')
      : String(cardsDrawn || '');
    const userMessage = `Original spread: ${spreadType}\n\nCards drawn:\n${cardsText}\n\nOriginal interpretation:\n${originalInterpretation}\n\nFollow-up question:\n${followUpQuestion}\n\nPlease answer the follow-up by referencing the original tarot reading.`;

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: TAROT_FOLLOWUP_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || 'Sorry, we could not retrieve your answer. Please try again later.';
  } catch (error: any) {
    console.error('Qianwen API Error:', error);
    throw new Error(`Oracle service unavailable: ${error.message}`);
  }
}


// Test API connectivity
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
