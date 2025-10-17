非常好的节奏 👍
在你还处于“数据建模 + 基础体验”阶段时，先存清楚，不暴露设置项是最合理的做法。
下面我先把你目前的需求完整地翻译成一份清晰、可交给编码 agent 的技术需求文档（含设计意图说明），并标注哪些部分现在是“内部逻辑”，哪些将来才需要暴露为用户设置。

⸻

🌍 世界遗产用户体验与数据建模需求文档（翻译版）

一、背景说明

UNESCO 世界遗产中存在串联遗产（serial property）或多地点遗产（multiple sites）。
例如：
• “长城”（The Great Wall）包含多个组成地（八达岭、山海关、居庸关等）；
• “勒·柯布西耶建筑作品”分布于七个国家，共 17 个组成地。

我们的网站已从 WHC 官方 XML 获取遗产主项数据（property level），并计划从 Wikidata 导入所有组成地（component level）的坐标与名称。
下一步要解决的问题是：如何在用户体验层面正确地记录和显示 visit / wishlist / bookmark 信息。

⸻

二、总体目标
• 在数据库中，清晰区分母项（property）与组成地（component）。
• 用户的访问记录、愿望单、书签等，都能在此两层结构下准确存储。
• 前端体验分层：
• 总览（Explore）地图仅展示 property marker，基于聚合状态决定颜色/收藏等标签；
• 详情页展示组件清单 + 局部地图，并提供逐个标记访问、收藏、愿望单的入口。
• 在详情和个人档案中支持“我去过该遗产的几个组成地（X / Y）”等进度信息；
• 支持记录“我计划去的具体地点”“我收藏的特定组成地或整个遗产”；
• 当前阶段暂不暴露“统计逻辑设置”（例如“去一个算去过”），而是在系统内部统一定义逻辑。

⸻

三、体验分层策略

1. Explore 总览
   • 地图只渲染 property 级 marker，避免一次性加载成百上千的组件点。
   • marker 颜色/状态来自 property 聚合结果（任一组件访问视为已访）。
   • popup 保持简洁，可提示“共有 X 个组成地”，引导用户进入详情。

2. 遗产详情页
   • 展示组件列表 + 小地图，支持分页/聚类等手段应对高密度地区。
   • 用户可逐个标记“已访问”“收藏”“想去”，并即时刷新 `已访 X / 总数` 进度。
   • 支持从组件信息跳转到外部资源（Wikidata/UNESCO 等）。

3. 个人档案 / 汇总视图
   • 读取聚合后的进度数据，展示例如 “10 / 87” 之类的进度条。
   • 允许筛选“只看已访组件”“只看愿望单组件”等清单。

四、设计意图与原则

分类 原则 当前阶段行为
数据粒度 所有 visit 都记录到 component 级，防止信息丢失 ✅ 实现
汇总逻辑 property 的“已访问状态”由 component 聚合计算 ✅ 实现
用户设置 暂不开放；系统统一采用 “任一 component 被访问则视为 visited” ✅ 暂时固定
wishlist / bookmark 粒度 wishlist 默认指向 property；bookmark 可指向 property 或 component ✅ 实现
可扩展性 模型应能容纳未来的 user-defined 逻辑（如 All/Any） ✅ 设计时预留字段

⸻

五、核心对象与关系

实体 描述
Property 世界遗产主项（如长城、吴哥窟）
Component 主项的组成地（如八达岭、山海关等）
User 登录用户
VisitRecord 用户访问某一 component 的记录
List 用户的清单（如 Wishlist、Bookmark、TripPlan）
ListItem 清单中的条目，可指向 property 或 component

⸻

六、字段建议（逻辑结构）

properties

字段 类型 说明
whs_id string WHC id_number（主键）
name string 遗产名称
category string Cultural / Natural / Mixed
countries array 所属国家
total_components int 组成地数量（自动统计）

⸻

components

字段 类型 说明
component_id string / QID 唯一ID（建议用 Wikidata QID）
whs_id string 外键，所属遗产
name string 组成地名称
lat / lon float 坐标
country string 所在国家（如已知）

⸻

user_component_visits

字段 类型 说明
user_id string 用户ID
component_id string 外键，指向组成地
visited_at datetime 访问日期
note text 用户备注
photo_url string 可选，用户凭证照片

派生逻辑（系统层计算，不暴露给用户设置）：
• 每个 property 的 visited 状态：
is_visited = (visited_components_count ≥ 1)
• 进度：
progress = visited_components_count / total_components

⸻

user_lists

字段 类型 说明
list_id string 主键
user_id string 用户
name string 清单名称
type enum wishlist / bookmark / tripplan 等
created_at datetime 创建时间

⸻

user_list_items

字段 类型 说明
list_id string 外键
scope_type enum “property” or “component”
scope_id string 对应的 whs_id 或 component_id
added_at datetime 添加时间

⸻

七、逻辑行为（当前阶段）

行为 内部逻辑
用户标记访问 创建或更新 user_component_visits 记录
访问进度计算 每次访问后统计 visited_components_count 并写入缓存或视图
遗产显示状态 若任一 component 被访问 → 显示“Visited”；同时显示 “X / Y 已访”
加入愿望单 默认以 property 级存储
加入书签 允许 property 或 component
地图加载 Explore 地图只渲染 property；详情页提供组件地图+聚合策略

⸻

八、未来阶段可扩展项（当前可不实现）

功能 含义 实现建议
用户自定义统计逻辑 允许选择 “Any”（去过任一算已访）或 “All”（全部完成才算） 可在 user_profile 增加 visit_logic 字段
GPS 自动验证 从定位/照片识别自动判断是否到访 component 可选项，隐私提示必需
多用户清单共享 旅行伙伴共享 wishlist/tripplan 后期考虑
界面层地图交互 MapView 标出 visited / wishlist 组件 后期考虑

⸻

九、最小可行功能（MVP）1. 从 Wikidata 导入 components，并与 WHC property 对齐。2. 用户可以：
• 标记已访问某个 component；
• 查看 property 的访问进度（如 “已访 1 / 3”）；
• 将 property 加入愿望单；
• 将 component 或 property 加入书签。3. 系统统一逻辑：
• 任意 component 访问过 → property 显示为 visited；
• 无用户设置界面；
• 所有逻辑在后端汇总。

⸻

十、开发交付目标（交给编码 agent）
• 设计数据库结构（SQL / Prisma / Supabase schema 均可）；
• 编写基础 API 或 ORM 方法：
• markVisited(user_id, component_id)
• getPropertyProgress(user_id, whs_id)
• addToList(user_id, list_type, scope_type, scope_id)
• getUserLists(user_id)
• 输出包含 visit 进度与 wishlist 状态的 property 列表接口；
• 不要求地图渲染。

⸻

十一、结论建议

当前阶段策略：
• 不提供用户设置（如“是否算已访”逻辑），只在后端固定为 visited if any component visited；
• 先保证数据模型清晰且可扩；
• UI 明确展示“已访 X / Y”即可，无需复杂交互。

⸻
