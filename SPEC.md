# 宠物系统规格文档

## 1. 项目概述

- **项目名称**: Pet Management System (宠物管理系统)
- **项目类型**: 全栈 Web 应用
- **核心功能**: 宠物的增删改查、宠物信息展示
- **目标用户**: 宠物主人、宠物店

## 2. 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: CSS Modules + 自定义样式
- **HTTP 客户端**: fetch API

### 后端
- **框架**: FastAPI
- **语言**: Python 3.10+
- **数据库**: SQLite (轻量级，无需额外安装)
- **ORM**: SQLAlchemy + Pydantic

## 3. 功能列表

### 宠物管理
- 查看所有宠物列表
- 添加新宠物
- 查看宠物详情
- 编辑宠物信息
- 删除宠物

### 数据模型
```python
Pet {
    id: int (主键)
    name: str (宠物名称)
    species: str (种类: 狗/猫/其他)
    age: int (年龄)
    description: str (描述)
    image_url: str (图片URL)
    created_at: datetime
}
```

## 4. API 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/pets | 获取所有宠物 |
| GET | /api/pets/{id} | 获取单个宠物 |
| POST | /api/pets | 创建宠物 |
| PUT | /api/pets/{id} | 更新宠物 |
| DELETE | /api/pets/{id} | 删除宠物 |

## 5. 页面设计

- **首页**: 宠物列表网格展示
- **详情页**: 宠物详细信息
- **表单页**: 添加/编辑宠物

## 6. 项目结构

```
pet-system/
├── frontend/          # Next.js 前端
│   ├── src/
│   │   ├── app/      # 页面
│   │   ├── components/
│   │   └── styles/
│   └── package.json
├── backend/          # Python 后端
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── database.py
│   └── requirements.txt
└── SPEC.md
```
