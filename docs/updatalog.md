### 2025-10-01
* 项目小组成立
* 项目方案策划书草稿完成

---

### 2025-10-02

* `add svg` — 新增或加入 SVG 资源。
* `first commit` — 仓库中的一次历史性提交记录标注。
* `Initial commit from Create Next App` — 来自 Create Next App 的初始化提交。

---

### 2025-10-03

* `add hardhat-arrowtower` — 添加与 Hardhat 相关的 ArrowTower 智能合约或开发配置文件/脚本。

---

### 2025-10-04 

* `add arrowtower_factory.sol ArrowTowerFactoryModule.ts` — 新增 `arrowtower_factory.sol` 合约及其对应 TypeScript 模块，用于工厂化部署或合约交互封装。

---

### 2025-10-05 

* `add auth test` — 添加认证相关测试用例或测试脚本。

---

### 2025-10-06 

* 多项后端/数据库与资源合并：

  * 合并若干 Pull Request。
  * 新增或调整接口与数据库代码（包含 Prisma 相关改动）。
  * 路由与 POI（兴趣点）相关改动。
  * SVG 资源的合并与优化。

---

### 2025-10-07 

* `fix all sol && add test scripts` — 修复 Solidity 合约相关问题并添加测试脚本。

---

### 2025-10-08 

* 多项合并与修复：

  * 合并多个功能分支回主分支。
  * 修复与 tokenId 相关的问题。
  * 构建/CI 修复。
  * 权限逻辑调整。
  * 自动铸造（auto-mint）功能相关提交。
  * 地图功能的测试与调试。

---

### 2025-10-09 

* `add metadata db api` — 新增 metadata 数据表与对应的后端 API 支持。
* `add app/testcheckin/page.tsx` — 新增测试/打卡页面（前端）。
* `refactor(auth): optimize user authentication flow` — 重构并优化用户认证流程。

---

### 2025-10-10 

* `fix build bug and clean` — 修复构建相关 bug 并做项目清理。

---

### 2025-10-11 

* Docker 与数据库脚本的加入/修复：

  * 添加 Docker 支持并修复 Docker 相关错误。
  * 添加或清理数据库种子（seed）脚本、init/reset database 脚本。
  * 恢复或修复文档。
  * 将 UI-Map（交互地图与 POI 打卡）功能合并到主分支，包含可点击地图与交互逻辑。

---

### 2025-10-12 

* 大量前端页面与 UI 调整：

  * 若干 UI 修复。
  * 新增二维码打卡动态路由页面；修复打卡点颜色变化显示问题。
  * 修改 `page.tsx`、新增 `user/pages.tsx` 与 `ArrowTowerHeader` 头部组件（页面结构与头部重构）。
  * 修改随机图片 URL 的逻辑。
  * 新增 metadata 功能模块或表结构（随后在 10-13 日有进一步调整）。
  * 添加 initdb.ts 与 resetdb.ts 数据库初始化/重置脚本。
  * 更新 README 与添加项目 snapshot（文档更新）。

---

### 2025-10-13 

* Metadata、数据库与 Mint 检查相关变动：

  * `add checkmint page api db` — 新增 `checkmint` 页面，增加后端 API 与数据库支持，用于检查铸造（mint）状态。
  * `fix db bug && del metadata table && reset init:db` — 修复数据库 bug，并**删除 metadata 表**后重置初始化脚本（表结构被调整或迁移）。
  * `fix:metadata get and create` — 修复 metadata 的读取与创建逻辑。
  * 合并若干 UI 修复的 Pull Request。

> **注意**：10-13 的操作包含对 metadata 表的删除与数据库初始化脚本的重置，这类变更在生产环境执行时具有潜在的数据迁移风险，建议先备份数据库并在测试环境中验证脚本。

---

### 2025-10-14 

* 多个分支合并与移动端 UI 修复：

  * 合并多个 Pull Request 回主分支。
  * `fix: try to improve ui for android browser` — 针对 Android 浏览器做 UI 改进，涉及地图视图、POI 详情模态与用户页的响应式调整与文案优化。
* 整理部署后端部署环境

---

### 2025-10-15
* 新增每日更新日志
* 统一ENV变量名：由原`CONTRACT_ADDRESS`统一改为`NEXT_PUBLIC_MINTER_CONTRACT`，可方便前端调用合约地址
* 开启`wagmiConfig`对`ssr`的支持，减少`connection.connector.getChainId is not a function`错误
* 在user页面增加钱包断开自动重连三次功能

---

### 2025-10-16
* 修订`dockerfile`文件，实现可`docker`部署。
* 新增`schema.postgres.prisma`,实现可生产环境`postgres`部署。
* 修订部分`readme`文档，增加一张链上图片反馈。


---

### 2025-10-17
* 修复`/src/lib/mint.rs`不能稳定获取`nfttokenId`问题。将`NFTMinted`事件手动解析改为通过`abi`进行手动解析，并添加`Transfer`事件作为备用事件来协助解析`nfttokenId`。
* 尝试使用`brave`浏览器来连接钱包（针对手机端优化）。目前桌面端无问题，手机端还是无法稳定链接（在其他分支修改）。


---

### 2025-10-18
* 修复`mint-processor.ts`中`metadata`数据获取`Completion Status`为`pending`问题
* 在`/src/app/user/page.tsx`中，新增一个`前往NFT查询`按钮（`router.push('/user/checkmint')`）
* 修复`mint.ts`中未注释`if (import.meta.url === 'file://${process.argv[1]}') `引起环境无法构建问题

---

### 2025-10-19
* 完成初期演示视频录制（目前尚未添加入路径）
* 增加`/lib/db/userService.ts`,`/app/api/admin/users/route.ts`,实现管理员针对`user`用户管理接口,同时利用`jest`实现对数据库函数单元测试。
* 增加`/src/components/admin/AdminModal.tsx`,`src\components\admin\AdminTable.tsx`,`src\components\admin\ChainStats.tsx`三个组件。实现管理后台组件模板化。
* 增加`src\app\admin\page.tsx`，完善后台`admin`管理页面，等待其他接口。
* 调整`CI/CD`功能
* 完成`ppt`草稿内容。

---

### 2025-10-20
* 修订`ppt`头像大小写问题，更改团队English名称一个大写问题
* 完成自动delpoy的密钥设置，能够自动化部署了。
* 增加`readme`里面contractsd的部署测试命令，修定增加`prisma`初始化命令。

---

### 2025-10-21
* 新增完善`/api/admin/checkins`,`/api/admin/pois`,`/api/admin/vouchers`,`/api/admin/routers`。四组管理api接口
* 并添加对应的`jest`单元测试文件

---

### 2025-10-22
* 新增批量二维码生成器组件`QRBulkGenerator.tsx`,并在打卡点管理中新增生成二维码按钮
* 修复前端与钱包链接bug：`Request of type personal_sign bug`


---

### 2025-10-23
* 新增前端部署NFT合约、minter合约，绑定合约关系组件`ContractDeployer.tsx`,并制作`viem.ts`测试合约部署文件
* 修订`readme`文件部分内容，修订`PPT`部分内容

---

### 2025-10-24
* 增加`middleware.ts`重构认证中间件，支持 admin 和 user 角色权限控制
* 修订`readme`文件部分内容，`PPT`部分内容。
* 修复`external_url`内容定义问题。

---

### 2025-10-25
* 完成视频前后端展示内容，暂缺现场演示视频拍摄
* 修订`readme`文件部分内容，`PPT`部分内容，部分内容进行分页处理

---

### 2025-10-26
* 优化`readme`,更新一个English的`readme`

---

### 2025-10-27
* 联系合作伙伴完成最终视频拍摄，并合成最终视频上传`YouTube`
* 增加娱乐版商业可行性分析报告
* 切换English `PPT`与`readme`


---

### 2025-10-28
* 视频链接与`PPT`链接已经提交,增加了PPT的视频按钮

---

### 2025-10-28
* 视频链接与`PPT`链接已经提交,增加了PPT的视频按钮

---

### 2025-11-02

* 修订`ppt`的自适应屏幕

---

### 2025-11-03
* 增加`PPT`一句话与优化`CI/CD`，修改了`ico`

---

### 2025-11-13
* 优化`Dockerfile`、`docker-compose.yml`


---

### 2025-12-07
* 更新依赖版本防护`CVE-2025-66478 (Next.js) / CVE-2025-55182 (React 上游)`


### 2025-12-16
* 更新`nextjs,react,react-dom`

