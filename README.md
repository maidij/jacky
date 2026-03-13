# 宠物管理系统

一个前后端分离的宠物管理系统，支持宠物展示、购物车、订单、评价等功能。

## 技术栈

- **前端**: Next.js 14 + React + TypeScript
- **后端**: FastAPI + SQLAlchemy + MySQL
- **数据库**: MySQL

## 项目结构

```
.
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── app/       # Next.js 页面
│   │   ├── components/  # React 组件
│   │   ├── context/   # 状态管理
│   │   ├── lib/       # 工具函数
│   │   └── styles/    # 样式文件
│   └── package.json
│
├── backend/           # 后端 API
│   ├── app/
│   │   ├── main.py    # FastAPI 主应用
│   │   ├── models.py  # 数据库模型
│   │   ├── schemas.py # Pydantic 模型
│   │   └── database.py # 数据库配置
│   ├── requirements.txt
│   └── show_db.py
│
├── crawler.py         # 数据爬虫
├── init_data.py       # 数据初始化脚本
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.8+
- MySQL 5.7+

### 1. 克隆项目

```bash
git clone <repository-url>
cd opencode
```

### 2. 配置数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE pet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

修改后端数据库连接配置（`backend/app/database.py`）：

```python
DATABASE_URL = "mysql+pymysql://username:password@localhost:3306/pet_db"
```

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

后端服务将在 http://localhost:8000 运行

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端应用将在 http://localhost:3000 运行

### 5. 初始化数据（可选）

```bash
python init_data.py
```

## 功能列表

- [x] 用户注册/登录
- [x] 宠物/商品展示（分页、分类）
- [x] 搜索功能
- [x] 购物车
- [x] 订单创建
- [x] 评价系统
- [x] 宠物详情页
- [x] 添加/编辑宠物

## API 文档

启动后端后访问：http://localhost:8000/docs

### 主要接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/pets | 获取宠物列表 |
| GET | /api/pets/search | 搜索宠物 |
| GET | /api/pets/{id} | 获取宠物详情 |
| POST | /api/pets | 添加宠物 |
| PUT | /api/pets/{id} | 更新宠物 |
| DELETE | /api/pets/{id} | 删除宠物 |
| GET | /api/cart | 获取购物车 |
| POST | /api/cart | 添加到购物车 |
| DELETE | /api/cart/{id} | 移除购物车项 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders | 获取订单列表 |
| GET | /api/reviews/{pet_id} | 获取评价 |
| POST | /api/reviews | 提交评价 |

## 开发

### 运行测试

```bash
# 后端测试
cd backend
pytest

# 或指定测试文件
pytest tests/test_api.py -v
```

### 代码规范

- 前端使用 ESLint + Prettier
- 后端遵循 PEP 8 规范

## 许可证

MIT
