# 无障碍出行协助平台

面向视障、轮椅和行动不便人群的室内外无障碍路线协助系统，聚合站点、设施、路线、志愿协助与障碍上报流程。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20101>

后端健康检查：<http://localhost:21101/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + TypeORM |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `accessroute`
- `FRONTEND_PORT`: 前端端口，默认 `20101`
- `BACKEND_PORT`: 后端端口，默认 `21101`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: accessroute`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-accessroute}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- MobilityType: constants/MobilityType、types/MobilityType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FacilityStatus: constants/FacilityStatus、types/FacilityStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssistanceStatus: constants/AssistanceStatus、types/AssistanceStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- RiskLevel（路线风险，新增）: backend/frontend 两侧的 `constants/RiskLevel`、`types/RouteRisk`、`utils/routeRisk`、`models/RoutePlan`、`types/RoutePlan`、`utils/formatters`、风险说明面板 `components/common/RouteRiskPanel`、`hooks/useRouteRisk`、路线服务/控制器/仓库、种子数据与数据库表均有引用。
- RiskPolicy（风险回落策略，新增）: 两侧 `constants/RiskPolicy`、`types/RouteRisk`、`models/RoutePlan`、`types/RoutePlan`、风险说明面板、`hooks/useRouteRisk`、路线服务。
- BarrierVerifyStatus / BarrierPriority（障碍上报终态与优先级，新增）: 两侧 `constants/BarrierVerifyStatus`、`constants/BarrierPriority`、`utils/routeRisk`、`utils/formatters`、风险因子说明、障碍工单展示。

## 路线风险是怎么算出来的

- **触发时机**：保存（POST）或重新保存（PATCH）路线时，由后端统一计算；前端不接受手填 `risk_level`，请求里即使携带也会被忽略。
- **计算输入**：路线选中的设施（巡检状态）+ 这些设施上「还没关掉」的障碍上报（`CLOSED` / `REJECTED` 视为关闭）。
- **档位映射**：设施 `AVAILABLE→低`、`MAINTENANCE→中`、`BLOCKED→高`；`UNKNOWN`、状态无法识别或设施在巡检记录中查不到，一律按**最保守的高风险**处理。未关闭上报：高优先级→高，其余可识别优先级→中，优先级无法识别→高。路线等级取所有因子的最大值，每个抬级因子记录设施/上报编号、名称、原因和是否决定性。
- **共用结果**：路线列表、路线详情、风险说明面板（及通行总览的高风险路线卡片）消费同一份 `risk` 结论，面板逐条列出「是哪几个设施、哪条上报把等级抬上去的」。
- **回落策略：高位保留（PEAK_HOLD）**：在「当场回落」与「保留当初算出的高位」之间，本平台按对出行者更稳妥的一边固定为**高位保留**——设施恢复可用、障碍上报关闭后，已保存路线的等级不自动回落；若当前实时风险反而更高，则按更高的实时值提示。面板同时展示保存时峰值、当前实时评级、两者时间，并明确标注本路线采用的是「高位保留」。


## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
