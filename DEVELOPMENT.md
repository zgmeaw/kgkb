# 开发指南

## 项目架构

### 目录结构说明

```
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件（Button, Input, Modal等）
│   ├── Layout/         # 布局组件（Header, Footer, Container）
│   ├── announcement/   # 公告相关组件
│   ├── position/       # 岗位相关组件
│   └── filter/         # 筛选组件
├── contexts/           # React Context（状态管理）
│   ├── UserProfileContext.tsx
│   ├── AnnouncementContext.tsx
│   └── PositionContext.tsx
├── hooks/              # 自定义Hooks
│   ├── useLocalStorage.ts
│   └── useToast.ts
├── pages/              # 页面组件
│   ├── Home.tsx
│   ├── AnnouncementList.tsx
│   ├── PositionList.tsx
│   └── UserProfile.tsx
├── services/           # 服务层
│   ├── storageService.ts    # LocalStorage封装
│   ├── excelService.ts      # Excel处理
│   └── matchingService.ts   # 匹配算法
├── types/              # TypeScript类型定义
│   ├── common.ts
│   ├── user.ts
│   ├── announcement.ts
│   └── position.ts
├── utils/              # 工具函数
│   ├── validation.ts
│   ├── dateUtils.ts
│   └── formatters.ts
├── constants/          # 常量定义
│   └── index.ts
├── App.tsx             # 应用主组件
├── main.tsx            # 入口文件
└── index.css           # 全局样式
```

## 技术栈详解

### 前端框架
- **React 19**: 最新版本的React，使用函数组件和Hooks
- **TypeScript**: 提供类型安全和更好的开发体验
- **React Router v7**: 客户端路由管理

### 构建工具
- **Vite**: 快速的开发服务器和构建工具
- **Tailwind CSS 4**: 实用优先的CSS框架

### 状态管理
- **React Context API**: 全局状态管理
- **LocalStorage**: 数据持久化

### 数据处理
- **xlsx**: Excel文件读写
- **date-fns**: 日期处理

## 核心功能实现

### 1. 数据存储

使用LocalStorage进行本地数据存储：

```typescript
// storageService.ts
class StorageService {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): boolean
  remove(key: string): boolean
}
```

### 2. 岗位匹配算法

多维度加权匹配算法：

```typescript
// matchingService.ts
calculateMatchingScore(position: Position, userProfile: UserProfile): MatchingDetails {
  // 学历匹配 (25%)
  // 学位匹配 (20%)
  // 专业匹配 (25%)
  // 政治面貌 (10%)
  // 工作经验 (15%)
  // 年龄要求 (5%)
}
```

### 3. Excel导入导出

```typescript
// excelService.ts
parseExcelFile(file: File, announcementId: string): Promise<ExcelImportResult>
exportPositionsToExcel(positions: Position[], filename: string): void
```

## 开发规范

### 代码风格

1. **组件命名**: 使用PascalCase
2. **文件命名**: 组件文件使用PascalCase，其他文件使用camelCase
3. **函数命名**: 使用camelCase
4. **常量命名**: 使用UPPER_SNAKE_CASE

### TypeScript规范

1. 所有组件props必须定义接口
2. 避免使用`any`类型
3. 使用严格模式
4. 导出的函数必须有类型注解

### 组件规范

1. 使用函数组件
2. 使用Hooks管理状态
3. Props解构
4. 合理拆分组件

示例：

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  children 
}: ButtonProps) {
  // 组件实现
}
```

## 添加新功能

### 1. 添加新页面

1. 在`src/pages/`创建页面组件
2. 在`App.tsx`添加路由
3. 在`Header.tsx`添加导航链接

### 2. 添加新的数据类型

1. 在`src/types/`定义接口
2. 创建对应的Context
3. 实现CRUD操作

### 3. 添加新的服务

1. 在`src/services/`创建服务类
2. 导出单例实例
3. 在组件中使用

## 调试技巧

### 1. React DevTools

安装React DevTools浏览器扩展，可以查看组件树和状态。

### 2. LocalStorage查看

在浏览器开发者工具的Application标签页查看LocalStorage数据。

### 3. 日志输出

```typescript
console.log('Debug:', data);
console.error('Error:', error);
```

## 性能优化

### 1. 组件优化

- 使用`React.memo`避免不必要的重渲染
- 使用`useCallback`和`useMemo`缓存函数和值

### 2. 数据优化

- 分页加载大量数据
- 虚拟滚动处理长列表
- 防抖和节流处理频繁操作

### 3. 构建优化

- 代码分割
- 懒加载
- Tree Shaking

## 测试

### 单元测试

```bash
npm run test
```

### 测试覆盖率

```bash
npm run test:coverage
```

## 部署

### 本地预览

```bash
npm run build
npm run preview
```

### GitHub Pages部署

推送到main分支会自动触发GitHub Actions部署。

### 手动部署

```bash
npm run build
# 将dist目录部署到服务器
```

## 常见问题

### Q: 如何清空所有数据？

A: 在浏览器开发者工具的Console中执行：
```javascript
localStorage.clear()
```

### Q: Excel导入失败怎么办？

A: 
1. 检查Excel格式是否正确
2. 下载模板文件参考
3. 确保列名完全匹配

### Q: 匹配度计算不准确？

A: 
1. 检查个人档案是否完整
2. 确认岗位要求数据正确
3. 查看匹配详情了解具体原因

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 联系方式

- 项目地址: https://github.com/yourusername/kgkb
- 问题反馈: https://github.com/yourusername/kgkb/issues
