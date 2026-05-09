# 城市菜地项目

一个城市菜地租赁管理平台，包含前端App和后台管理系统。

## 项目结构

```
城市菜地/
├── frontend/          # 前端App (React + TypeScript + Vite)
│   └── src/
│       ├── components/
│       │   ├── DiscoverPage.tsx    # 发现页面（地图和列表）
│       │   ├── DetailPage.tsx      # 地块详情页
│       │   ├── MyPlotsPage.tsx     # 我的地块页面（地主编辑）
│       │   ├── MessagesPage.tsx    # 消息页面
│       │   ├── ProfilePage.tsx     # 个人中心（登录注册）
│       │   ├── BottomNav.tsx       # 底部导航
│       │   └── MapComponent.tsx    # 地图组件
│       ├── api.ts                  # API接口封装
│       ├── types.ts                # 类型定义
│       └── App.tsx                 # 主应用
├── server/            # Python后端服务 (Flask + SQLite)
│   ├── admin.py       # 后台管理服务 + API
│   ├── models.py      # 数据库模型
│   ├── templates/     # 后台管理页面模板
│   └── database.db    # SQLite数据库
├── start-backend.bat  # 后端启动脚本
└── start-frontend.bat # 前端启动脚本
```

## 功能说明

### 前端App

1. **发现页面**
   - 通过地图和列表查找菜地
   - 搜索功能支持省、市、区、园区名称搜索
   - 地块详情展示面积、土壤、光照、租金等信息

2. **地块详情**
   - 查看地块完整信息
   - 拨打业主电话
   - 给业主留言（登录后）

3. **我的地块（地主专属）**
   - 查看自己拥有的地块列表
   - 编辑地块信息（名称、描述、租金、状态等）

4. **消息模块**
   - 查看与他人的消息对话
   - 给地主发送留言
   - 地主可回复用户消息

5. **个人中心**
   - 输入手机号自动判断用户状态
   - 地主用户：密码登录（默认123456）
   - 游客用户：注册新账号
   - 查看个人信息，退出登录

### 后台管理

1. 仪表盘 - 显示总地块数、已出租数量、月收入统计
2. 地块管理 - 增删改查地块信息
3. 园区管理 - 增删改查园区信息
4. 区域管理 - 查看行政区划结构

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion (动画)
- Lucide React (图标)
- React Leaflet (地图)

### 后端
- Python 3
- Flask (Web框架)
- SQLite (数据库)
- Flask-CORS (跨域支持)

## 快速启动

### 1. 启动后端服务

```bash
# Windows
start-backend.bat

# 或手动启动
cd server
pip install -r requirements.txt
python admin.py
```

后端服务将在 http://localhost:5001 启动

### 2. 启动前端服务

```bash
# Windows
start-frontend.bat

# 或手动启动
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

## 用户登录说明

### 地主用户
- 手机号：地块业主的手机号（如 13800138001）
- 默认密码：123456
- 登录后可访问"我的地块"和"消息"功能

### 游客用户
- 输入新手机号后可注册账号
- 注册后可使用"消息"功能给地主留言
- 无法访问"我的地块"（仅地主可用）

## 数据库结构

### regions (行政区划表)
- id: 主键
- name: 名称
- level: 级别 (province/city/district)
- lat, lng: 坐标
- parent_id: 上级区域ID

### gardens (园区表)
- id: 主键
- name: 名称
- address: 地址
- lat, lng: 坐标
- description: 描述
- thumb: 缩略图
- region_id: 所属区域ID

### plots (地块表)
- id: 主键
- title: 名称
- sub_title: 副标题
- location: 位置
- area: 面积
- soil_type: 土壤类型
- light_condition: 光照条件
- water_price: 水费
- annual_rent: 年租金
- description: 描述
- owner_name: 业主姓名
- owner_phone: 业主电话
- owner_avatar: 业主头像
- images: 图片列表(JSON)
- tags: 标签列表(JSON)
- status: 状态 (available/rented)
- garden_id: 所属园区ID

### users (用户表)
- id: 主键
- phone: 手机号（唯一）
- name: 用户名
- password: 密码
- avatar: 头像
- is_landlord: 是否为地主
- created_at: 创建时间

### messages (消息表)
- id: 主键
- sender_id: 发送者ID
- sender_phone: 发送者手机
- sender_name: 发送者名称
- receiver_id: 接收者ID
- receiver_name: 接收者名称
- content: 内容
- created_at: 创建时间
- read: 是否已读

## API接口

### 区域数据
- `GET /api/regions` - 获取行政区划树形结构

### 园区数据
- `GET /api/gardens` - 获取所有园区列表
- `GET /api/gardens/:id` - 获取单个园区详情

### 地块数据
- `GET /api/plots` - 获取所有地块
- `GET /api/plots?owner_phone=xxx` - 获取指定业主的地块
- `GET /api/plots/:id` - 获取单个地块详情
- `PUT /api/plots/:id` - 更新地块信息

### 用户认证
- `GET /api/auth/check?phone=xxx` - 检查用户状态
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册

### 消息
- `GET /api/messages?user_id=xxx` - 获取用户消息
- `POST /api/messages` - 发送消息
- `PUT /api/messages/:id/read` - 标记已读

## 使用说明

1. 启动后端服务后，访问 http://localhost:5001 进入后台管理界面
2. 在后台管理中可以添加、编辑、删除园区和地块信息
3. 启动前端服务后，访问 http://localhost:5173 使用前端App
4. 前端App会自动从后端API获取数据并显示
5. 使用业主手机号登录后，可以编辑自己的地块信息和查看留言