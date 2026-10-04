# ESTARA — 3D Real Estate Agency Platform

A full-stack starter for a cinematic, scroll-driven real estate platform: **Next.js 15 + React Three Fiber** on the front end, **NestJS + PostgreSQL/PostGIS** on the back end, with real (non-mocked) search, leads, and an appointment engine that reads business hours you configure yourself.

---

## 🇬🇧 English

### Overview

ESTARA is a monorepo containing:

- **`apps/web`** — Next.js 15 (App Router) frontend with TypeScript, Tailwind CSS, and a scroll-driven 3D hero built with React Three Fiber, Drei and GSAP. Fully internationalized in **English, Persian (فارسی) and Chinese (中文)**, with automatic RTL/LTR switching, and five UI themes: **Light, Dark, Windows 11, Red, and Blue**.
- **`apps/api`** — NestJS backend with modules for authentication (JWT + Argon2), properties, agents, locations, leads (CRM pipeline), and — the core feature — a **business hours & appointment engine**.
- **`packages/types`** — shared TypeScript contracts used by both apps.
- **PostgreSQL + PostGIS**, **Redis**, and **MinIO** (S3-compatible storage) via `docker-compose.yml`.

### The appointment engine, explained

Every agent has their own weekly schedule — **you type it in yourself**: opening time, closing time, an optional lunch break, and how long each viewing slot should last, for each day of the week. From that, the system:

1. Computes every free slot for the next N days, automatically removing anything that overlaps an existing booking (conflict detection).
2. Reports the agent's **current local time**.
3. Reports **exactly how long until the next bookable slot** opens up (e.g. "2h 15m"), live-updating in the browser.

None of this is hardcoded — change the hours in the "Edit business hours" panel and the countdown and available slots recalculate immediately.

### Project structure

```
estara/
├── apps/
│   ├── web/            # Next.js 15 frontend
│   └── api/             # NestJS backend
├── packages/
│   └── types/            # Shared TypeScript types
├── docker-compose.yml    # Postgres+PostGIS, Redis, MinIO
└── .env.example
```

### Prerequisites

- Node.js 20 or later
- npm 10+ (or pnpm, if you prefer — a `pnpm-workspace.yaml` is included)
- Docker and Docker Compose (for Postgres, Redis, and MinIO)

### Installation

**1. Clone-free setup** — unzip this project, then from its root directory:

```bash
npm install
```

**2. Copy environment variables:**

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files if you want different ports, secrets, or database credentials.

**3. Start the infrastructure (Postgres, Redis, MinIO):**

```bash
docker compose up -d
```

**4. Set up the database:**

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed script creates a demo agency, an admin login (`admin@estara.dev` / `Admin123!`), an agent login (`agent@estara.dev` / `Agent123!`) with a full weekly schedule already configured, a demo city and neighborhood, and a handful of published properties.

**5. Run the backend API:**

```bash
npm run dev:api
```

The API runs at `http://localhost:4000/api/v1`, with Swagger docs at `http://localhost:4000/api/docs`.

**6. Run the frontend, in a separate terminal:**

```bash
npm run dev:web
```

The site runs at `http://localhost:3000` and redirects automatically to your browser's preferred language (`/en`, `/fa`, or `/zh`).

### Running tests

```bash
cd apps/api
npm test
```

This runs the unit tests for the slot-calculation engine (opening hours, lunch breaks, booking conflicts, and countdown formatting).

### Required npm packages (installed automatically by `npm install`)

**Frontend:** `next`, `react`, `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `tailwindcss`, `lucide-react`, `zustand`, `clsx`, `tailwind-merge`

**Backend:** `@nestjs/*`, `@prisma/client`, `prisma`, `argon2`, `class-validator`, `class-transformer`, `passport-jwt`, `ioredis`, `socket.io`, `date-fns`, `date-fns-tz`

### Notes on scope

This repository is a **working foundation**, not a finished enterprise deployment. It demonstrates the correct architecture — real database schema, real API contracts, a genuinely functional appointment/availability engine, real i18n and theming — so that CMS tooling, the full 3D property viewer, OpenSearch integration, payments, and the remaining modules described in the original specification can be built on top of it incrementally.

### License

MIT — see `LICENSE`.

---

## 🇮🇷 فارسی

### معرفی

ESTARA یک مونوریپو (Monorepo) شامل این بخش‌هاست:

- **`apps/web`** — فرانت‌اند Next.js 15 (App Router) با TypeScript، Tailwind CSS و یک Hero سه‌بعدی مبتنی بر اسکرول که با React Three Fiber، Drei و GSAP ساخته شده است. این بخش کاملاً به **انگلیسی، فارسی و چینی** بومی‌سازی شده و جهت متن (راست‌چین/چپ‌چین) به‌صورت خودکار تغییر می‌کند. همچنین پنج تم رابط کاربری در دسترس است: **روشن، تیره، ویندوز ۱۱، قرمز و آبی**.
- **`apps/api`** — بک‌اند NestJS با ماژول‌های احراز هویت (JWT + Argon2)، املاک، مشاوران، موقعیت‌های مکانی، مدیریت لیدها (CRM) و مهم‌ترین بخش، یک **موتور ساعات کاری و رزرو نوبت**.
- **`packages/types`** — قراردادهای مشترک TypeScript بین فرانت‌اند و بک‌اند.
- **PostgreSQL + PostGIS**، **Redis** و **MinIO** (ذخیره‌سازی سازگار با S3) از طریق فایل `docker-compose.yml` راه‌اندازی می‌شوند.

### توضیح موتور رزرو نوبت

هر مشاور املاک برنامه هفتگی مخصوص به خود را دارد که **خودتان آن را وارد می‌کنید**: ساعت شروع، ساعت پایان، یک استراحت اختیاری (مثل ناهار)، و مدت‌زمان هر نوبت بازدید، برای هر روز هفته. بر اساس این اطلاعات، سیستم:

۱. تمام زمان‌های آزاد را برای چند روز آینده محاسبه می‌کند و به‌طور خودکار هر زمانی که با یک رزرو قبلی تداخل داشته باشد را حذف می‌کند (تشخیص تداخل زمانی).
۲. **زمان محلی فعلی** مشاور را نمایش می‌دهد.
۳. **دقیقاً چه مدت تا باز شدن نزدیک‌ترین نوبت آزاد** باقی مانده را نمایش می‌دهد (مثلاً «۲ ساعت و ۱۵ دقیقه») و این مقدار به‌صورت زنده در مرورگر به‌روزرسانی می‌شود.

هیچ‌کدام از این مقادیر ثابت (Hardcoded) نیستند؛ کافی است ساعات کاری را از پنل «ویرایش ساعات کاری» تغییر دهید تا شمارش معکوس و زمان‌های آزاد بلافاصله دوباره محاسبه شوند.

### ساختار پروژه

```
estara/
├── apps/
│   ├── web/            # فرانت‌اند Next.js 15
│   └── api/             # بک‌اند NestJS
├── packages/
│   └── types/            # تایپ‌های مشترک TypeScript
├── docker-compose.yml    # Postgres+PostGIS، Redis، MinIO
└── .env.example
```

### پیش‌نیازها

- Node.js نسخه ۲۰ یا بالاتر
- npm نسخه ۱۰ به بالا (یا در صورت تمایل pnpm — فایل `pnpm-workspace.yaml` نیز موجود است)
- Docker و Docker Compose (برای Postgres، Redis و MinIO)

### مراحل نصب

**۱. راه‌اندازی بدون کلون کردن —** فایل زیپ پروژه را از حالت فشرده خارج کنید، سپس از داخل پوشه اصلی پروژه دستور زیر را اجرا کنید:

```bash
npm install
```

**۲. کپی کردن فایل‌های متغیر محیطی:**

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

در صورت نیاز به تغییر پورت‌ها، رمزهای امنیتی یا اطلاعات دیتابیس، فایل‌های `.env` را ویرایش کنید.

**۳. راه‌اندازی زیرساخت (Postgres، Redis، MinIO):**

```bash
docker compose up -d
```

**۴. آماده‌سازی دیتابیس:**

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

اسکریپت Seed یک آژانس نمونه، یک حساب مدیر (`admin@estara.dev` / `Admin123!`)، یک حساب مشاور (`agent@estara.dev` / `Agent123!`) با برنامه هفتگی کامل از قبل تنظیم‌شده، یک شهر و محله نمونه و چند ملک منتشرشده ایجاد می‌کند.

**۵. اجرای بک‌اند (API):**

```bash
npm run dev:api
```

آدرس API روی `http://localhost:4000/api/v1` در دسترس است و مستندات Swagger روی `http://localhost:4000/api/docs` قرار دارد.

**۶. اجرای فرانت‌اند در یک ترمینال جداگانه:**

```bash
npm run dev:web
```

سایت روی آدرس `http://localhost:3000` اجرا می‌شود و به‌طور خودکار بر اساس زبان مرورگر شما به یکی از مسیرهای `/en`، `/fa` یا `/zh` هدایت می‌شوید.

### اجرای تست‌ها

```bash
cd apps/api
npm test
```

این دستور تست‌های واحد مربوط به موتور محاسبه نوبت‌های آزاد (ساعات کاری، استراحت ناهار، تداخل رزروها و قالب‌بندی شمارش معکوس) را اجرا می‌کند.

### کتابخانه‌های موردنیاز (به‌صورت خودکار با `npm install` نصب می‌شوند)

**فرانت‌اند:** `next`، `react`، `three`، `@react-three/fiber`، `@react-three/drei`، `gsap`، `tailwindcss`، `lucide-react`، `zustand`، `clsx`، `tailwind-merge`

**بک‌اند:** `@nestjs/*`، `@prisma/client`، `prisma`، `argon2`، `class-validator`، `class-transformer`، `passport-jwt`، `ioredis`، `socket.io`، `date-fns`، `date-fns-tz`

### نکته‌ای درباره محدوده پروژه

این مخزن یک **پایه‌ی کاملاً کارکردی** است، نه یک استقرار نهایی سطح Enterprise. معماری صحیح را نشان می‌دهد — Schema واقعی دیتابیس، قراردادهای واقعی API، یک موتور رزرو/ساعات کاری کاملاً کارکردی، و سیستم چندزبانه و تم واقعی — تا بتوان ابزارهای CMS، نمایشگر کامل سه‌بعدی ملک، یکپارچه‌سازی OpenSearch، پرداخت‌ها و سایر ماژول‌های ذکرشده در مشخصات اولیه را به‌صورت تدریجی روی آن ساخت.

### مجوز

MIT — به فایل `LICENSE` مراجعه کنید.

---

## 🇨🇳 中文

### 项目概述

ESTARA 是一个 Monorepo 项目，包含以下部分：

- **`apps/web`** — 基于 Next.js 15（App Router）的前端，使用 TypeScript、Tailwind CSS，并通过 React Three Fiber、Drei 和 GSAP 构建了随滚动变化的三维首页动画。该前端已完整本地化为**英语、波斯语和中文**，并会根据语言自动切换从右到左（RTL）或从左到右（LTR）的排版方向。界面还提供五种主题：**浅色、深色、Windows 11、红色和蓝色**。
- **`apps/api`** — 基于 NestJS 的后端，包含身份验证（JWT + Argon2）、房源、经纪人、地理位置、销售线索（CRM）等模块，其中核心功能是一套**营业时间与预约引擎**。
- **`packages/types`** — 前后端共享的 TypeScript 类型定义。
- 通过 `docker-compose.yml` 提供 **PostgreSQL + PostGIS**、**Redis** 和 **MinIO**（兼容 S3 的对象存储）。

### 预约引擎说明

每位经纪人都有自己的每周营业时间表，**由您自行输入**：每天的开始时间、结束时间、可选的午休时间，以及每个看房时段的时长。系统会据此：

1. 自动计算未来若干天内所有的空闲时段，并自动排除与已有预约冲突的时间（冲突检测）。
2. 显示经纪人**当前的本地时间**。
3. 精确显示**距离下一个可预约时段还有多久**（例如“2小时15分钟”），并在浏览器中实时更新。

以上数值均非硬编码——只需在“编辑营业时间”面板中修改时间设置，倒计时和可预约时段便会立即重新计算。

### 项目结构

```
estara/
├── apps/
│   ├── web/            # Next.js 15 前端
│   └── api/             # NestJS 后端
├── packages/
│   └── types/            # 共享的 TypeScript 类型
├── docker-compose.yml    # Postgres+PostGIS、Redis、MinIO
└── .env.example
```

### 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本（如果您愿意，也可以使用 pnpm——项目中已包含 `pnpm-workspace.yaml`）
- Docker 与 Docker Compose（用于运行 Postgres、Redis 和 MinIO）

### 安装步骤

**第一步：无需克隆的初始设置** —— 解压本项目压缩包后，在项目根目录下执行：

```bash
npm install
```

**第二步：复制环境变量文件：**

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

如需修改端口、密钥或数据库凭据，请编辑相应的 `.env` 文件。

**第三步：启动基础设施（Postgres、Redis、MinIO）：**

```bash
docker compose up -d
```

**第四步：初始化数据库：**

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

该初始化脚本会创建一个示例机构、一个管理员账号（`admin@estara.dev` / `Admin123!`）、一个已配置好完整每周营业时间的经纪人账号（`agent@estara.dev` / `Agent123!`），以及示例城市、社区和若干已发布的房源。

**第五步：启动后端 API：**

```bash
npm run dev:api
```

API 运行地址为 `http://localhost:4000/api/v1`，Swagger 接口文档位于 `http://localhost:4000/api/docs`。

**第六步：在另一个终端中启动前端：**

```bash
npm run dev:web
```

网站运行地址为 `http://localhost:3000`，并会根据浏览器语言自动跳转至 `/en`、`/fa` 或 `/zh` 对应路径。

### 运行测试

```bash
cd apps/api
npm test
```

此命令将运行预约时段计算引擎的单元测试（涵盖营业时间、午休时间、预约冲突检测以及倒计时格式化逻辑）。

### 所需依赖包（执行 `npm install` 时会自动安装）

**前端：** `next`、`react`、`three`、`@react-three/fiber`、`@react-three/drei`、`gsap`、`tailwindcss`、`lucide-react`、`zustand`、`clsx`、`tailwind-merge`

**后端：** `@nestjs/*`、`@prisma/client`、`prisma`、`argon2`、`class-validator`、`class-transformer`、`passport-jwt`、`ioredis`、`socket.io`、`date-fns`、`date-fns-tz`

### 关于项目范围的说明

本仓库是一个**可正常运行的基础框架**，而非完整的企业级最终产品。它展示了正确的整体架构——真实的数据库结构、真实的 API 接口、一套真正可用的预约/空闲时间引擎，以及真实的多语言与主题系统——以便在此基础上逐步构建 CMS 工具、完整的三维房源查看器、OpenSearch 集成、支付功能，以及原始需求文档中提到的其余模块。

### 许可证

MIT — 详见 `LICENSE` 文件。
