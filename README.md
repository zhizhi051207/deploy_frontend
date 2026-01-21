# AI算命网页应用

一个基于 Next.js 和 DeepSeek AI 的全栈算命占卜应用，提供AI对话式算命和塔罗牌占卜功能。

## 功能特点

- **AI对话算命**: 与AI算命大师对话，获得关于事业、感情、财运等方面的专业指导
- **塔罗牌占卜**: 抽取78张塔罗牌，AI智能解读牌面含义
- **用户系统**: 完整的注册登录功能，保护用户隐私
- **历史记录**: 保存所有算命和占卜历史，随时查看
- **生辰八字**: 支持输入生辰信息，提高算命准确度

## 技术栈

### 前端
- **Next.js 14** - React 全栈框架（App Router）
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架

### 后端
- **Next.js API Routes** - 后端API
- **MySQL 8.0** - 数据库
- **mysql2** - MySQL 驱动
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### AI服务
- **DeepSeek API** - AI对话能力（兼容OpenAI API）

## 项目结构

```
Fortune telling/
├── database/
│   └── schema.sql              # MySQL数据库初始化脚本（包含78张塔罗牌）
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   │   ├── api/           # API路由
│   │   │   │   ├── auth/      # 认证API（注册/登录）
│   │   │   │   ├── fortune/   # AI算命API
│   │   │   │   ├── tarot/     # 塔罗牌API
│   │   │   │   └── history/   # 历史记录API
│   │   │   ├── login/         # 登录页面
│   │   │   ├── register/      # 注册页面
│   │   │   ├── dashboard/     # 用户控制台
│   │   │   ├── fortune-chat/  # AI算命聊天页面
│   │   │   ├── tarot/         # 塔罗牌占卜页面
│   │   │   └── history/       # 历史记录页面
│   │   ├── components/        # 可复用组件
│   │   ├── lib/               # 工具库
│   │   │   ├── db.ts          # 数据库连接
│   │   │   ├── auth.ts        # 认证工具
│   │   │   └── deepseek.ts    # DeepSeek AI客户端
│   │   └── types/             # TypeScript类型定义
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── .env.local.example     # 环境变量示例
└── README.md
```

## 快速开始

### 1. 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- DeepSeek API Key

### 2. 数据库设置

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库初始化脚本
source database/schema.sql
```

这将创建：
- `fortune_telling` 数据库
- 4张数据表（users, fortune_history, tarot_cards, tarot_readings）
- 78张塔罗牌完整数据

### 3. 安装依赖

```bash
cd frontend
npm install
```

### 4. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填写配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fortune_telling

# JWT密钥（请使用强随机字符串）
JWT_SECRET=your_super_secret_jwt_key_change_this

# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

#### 获取 DeepSeek API Key

1. 访问 [DeepSeek 官网](https://www.deepseek.com/)
2. 注册并登录账号
3. 进入 API 管理页面
4. 创建 API Key 并复制到 `.env.local`

### 5. 运行应用

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

访问 `http://localhost:3000` 查看应用。

## 数据库结构

### users表 - 用户信息
```sql
- id: 用户ID
- username: 用户名
- email: 邮箱
- password_hash: 加密密码
- birth_date: 出生日期
- birth_time: 出生时辰
- gender: 性别
- created_at: 创建时间
- updated_at: 更新时间
```

### fortune_history表 - 算命历史
```sql
- id: 记录ID
- user_id: 用户ID
- fortune_type: 算命类型（chat/tarot）
- question: 用户问题
- result: 算命结果
- created_at: 创建时间
```

### tarot_cards表 - 塔罗牌数据（78张）
```sql
- id: 卡牌ID
- name_cn: 中文名称
- name_en: 英文名称
- card_number: 卡牌编号
- suit: 牌组类型
- upright_meaning: 正位含义
- reversed_meaning: 逆位含义
- description: 描述
```

### tarot_readings表 - 塔罗占卜记录
```sql
- id: 记录ID
- user_id: 用户ID
- spread_type: 牌阵类型
- cards_drawn: 抽取的牌（JSON）
- interpretation: AI解读
- created_at: 创建时间
```

## API 接口

### 认证API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/me` - 更新用户信息

### 算命API

- `POST /api/fortune/chat` - AI对话算命

### 塔罗牌API

- `POST /api/tarot/draw` - 抽取塔罗牌并解读
- `GET /api/tarot/cards` - 获取所有塔罗牌数据

### 历史记录API

- `GET /api/history?type=chat|tarot` - 获取历史记录
- `DELETE /api/history?type=fortune|tarot&id=xxx` - 删除历史记录

## 功能说明

### AI对话算命

1. 用户输入问题和个人信息（可选）
2. 系统调用 DeepSeek AI，结合命理知识生成回答
3. 保存到历史记录

### 塔罗牌占卜

支持三种牌阵：
- **单张牌**: 快速占卜
- **三张牌**: 过去-现在-未来
- **凯尔特十字**: 复杂占卜（10张牌）

流程：
1. 选择牌阵类型并输入问题
2. 系统随机抽取塔罗牌，确定正逆位
3. AI结合牌面含义和用户问题生成解读
4. 保存到历史记录

## 安全特性

- ✅ 密码 bcrypt 加密（salt rounds: 10）
- ✅ JWT token 认证（有效期7天）
- ✅ SQL 参数化查询防注入
- ✅ React 自动 XSS 防护
- ✅ API 路由认证中间件

## 注意事项

1. **仅供娱乐**: 本应用仅供娱乐参考，不应作为重大决策依据
2. **API成本**: DeepSeek API调用会产生费用，请注意控制使用量
3. **环境变量**: 生产环境请使用强随机字符串作为 JWT_SECRET
4. **数据库**: 生产环境建议使用独立的MySQL服务器

## 开发计划

- [ ] 支持更多AI模型（Claude, GPT等）
- [ ] 添加每日运势推送功能
- [ ] 实现社交分享功能
- [ ] 支持付费高级算命服务
- [ ] 添加移动端适配
- [ ] 支持多语言

## 许可证

本项目仅供学习和娱乐使用。

## 技术支持

如有问题，请参考：
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
