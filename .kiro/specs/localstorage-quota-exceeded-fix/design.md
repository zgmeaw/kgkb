# localStorage QuotaExceededError Bugfix Design

## Overview

当用户导入大量岗位数据（1000+ 条记录）时，localStorage 会超出配额限制（通常 5-10MB），导致 `QuotaExceededError` 错误。本修复通过实现智能存储策略解决此问题：对于大数据集（>4MB）直接使用云端存储（Cloudflare R2），对于小数据集继续使用 localStorage 缓存。修复包括配额检测、自动降级机制、用户友好提示，以及启用 R2 存储后端作为主要云端存储方案。

## Glossary

- **Bug_Condition (C)**: 当数据大小超过 localStorage 可用配额时触发的条件
- **Property (P)**: 期望行为 - 大数据集应自动使用云端存储，避免 QuotaExceededError
- **Preservation**: 小数据集（公告、用户配置）继续使用 localStorage 缓存的现有行为
- **storageService**: `src/services/storageService.ts` 中的 localStorage 封装服务
- **useLocalStorage**: `src/hooks/useLocalStorage.ts` 中的 React Hook，用于管理 localStorage 状态
- **cloudStorageService**: `src/services/cloudStorageService.ts` 中的云端存储服务
- **R2StorageBackend**: `src/services/storageBackends/r2StorageBackend.ts` 中的 Cloudflare R2 存储后端实现
- **STORAGE_SIZE_THRESHOLD**: 数据大小阈值（4MB），超过此值将跳过 localStorage 直接使用云端存储

## Bug Details

### Bug Condition

当用户导入大量岗位数据（1000+ 条记录）时，`useLocalStorage` hook 调用 `storageService.set()` 将数据序列化为 JSON 并尝试写入 localStorage。如果数据大小加上已使用空间超过浏览器配额（通常 5-10MB），`localStorage.setItem()` 会抛出 `QuotaExceededError`。当前实现仅在控制台记录错误，不提供降级处理或用户提示，导致数据保存失败且用户刷新页面后数据丢失。

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type {
    dataSize: number,              // 序列化后的数据大小（字节）
    localStorageUsed: number,      // localStorage 已使用空间（字节）
    localStorageQuota: number,     // localStorage 配额限制（字节，通常 5-10MB）
    storageBackend: 'gist' | 'r2', // 当前配置的存储后端
    attemptingLocalStorage: boolean // 是否尝试写入 localStorage
  }
  OUTPUT: boolean
  
  RETURN input.dataSize + input.localStorageUsed > input.localStorageQuota
         AND input.attemptingLocalStorage === true
         AND (input.storageBackend === 'gist' OR input.storageBackend === 'r2')
END FUNCTION
```

### Examples

- **大数据集导入**: 用户导入 1500 条岗位数据，序列化后约 6MB，localStorage 已使用 2MB，总计 8MB 超过 5MB 配额 → 抛出 QuotaExceededError，数据保存失败
- **中等数据集**: 用户导入 500 条岗位数据，序列化后约 2MB，localStorage 已使用 2MB，总计 4MB 未超过 5MB 配额 → 正常保存到 localStorage
- **小数据集**: 用户保存公告数据（10 条记录），序列化后约 50KB → 正常保存到 localStorage
- **边界情况**: 用户导入 1000 条岗位数据，序列化后约 4.5MB，localStorage 已使用 1MB，总计 5.5MB 刚好超过 5MB 配额 → 应触发降级到云端存储

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 小数据集（公告数据、用户配置、少于 100 条岗位记录）继续同时使用 localStorage 缓存和云端存储
- 现有的 Gist 存储后端继续正常工作，不受此修复影响
- 自动备份功能继续正常执行，不受 localStorage 配额限制影响
- 跨标签页数据同步（通过 storage 事件）继续正常工作
- 跨设备数据同步（通过云端存储）继续正常工作

**Scope:**
所有不涉及大数据集（>4MB）的操作应完全不受此修复影响。这包括：
- 公告数据的增删改查操作
- 用户配置的保存和读取
- 小规模岗位数据（<100 条记录）的操作
- 现有的云端同步和备份流程

## Hypothesized Root Cause

基于 bug 描述和代码分析，最可能的问题是：

1. **缺少配额检测**: `storageService.set()` 方法没有在写入前检测 localStorage 可用空间，直接调用 `localStorage.setItem()` 导致 QuotaExceededError
   - 当前实现仅在 catch 块中记录错误，返回 false
   - 没有尝试降级到云端存储或清理旧数据

2. **缺少数据大小预估**: `useLocalStorage` hook 和 `storageService` 都没有在写入前估算数据大小
   - 无法提前判断数据是否会超过配额
   - 无法实现智能存储策略（大数据用云端，小数据用本地）

3. **缺少降级机制**: 当 localStorage 写入失败时，系统没有自动切换到纯云端存储模式
   - `useLocalStorage` hook 仅依赖 `storageService.set()` 的返回值
   - 没有回退到 `cloudStorageService` 的逻辑

4. **R2 后端未启用**: 虽然已实现 `R2StorageBackend`，但系统默认使用 `GistStorageBackend`
   - Gist 后端依赖 localStorage 缓存 gist_id
   - R2 后端更适合处理大数据集（直接对象存储，无 Gist API 限制）

## Correctness Properties

Property 1: Bug Condition - Large Dataset Auto Cloud Storage

_For any_ data write operation where the data size exceeds the STORAGE_SIZE_THRESHOLD (4MB) or localStorage.setItem() throws QuotaExceededError, the fixed system SHALL automatically skip localStorage caching and save data directly to cloud storage (R2), displaying a user-friendly message "数据量较大，已保存到云端存储" and ensuring data is successfully persisted and recoverable after page refresh.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Small Dataset Local Caching

_For any_ data write operation where the data size is below the STORAGE_SIZE_THRESHOLD (4MB) and does NOT trigger QuotaExceededError, the fixed system SHALL produce exactly the same behavior as the original system, continuing to use localStorage caching with cloud storage backup, preserving fast access performance for small datasets (announcements, user profiles, small position lists).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

假设我们的根因分析正确，需要进行以下修改：

**File 1**: `src/services/storageService.ts`

**Function**: `StorageService.set()`

**Specific Changes**:
1. **添加 QuotaExceededError 捕获**: 在 try-catch 块中明确捕获 `QuotaExceededError`（或检查 `error.name === 'QuotaExceededError'`）
   - 当捕获到此错误时，返回特殊错误码或抛出自定义异常
   - 记录详细错误信息（数据大小、已使用空间、配额限制）

2. **添加数据大小估算方法**: 新增 `estimateDataSize(value: any): number` 方法
   - 使用 `JSON.stringify(value).length * 2` 估算字节大小（UTF-16 编码）
   - 返回估算的数据大小

3. **添加可用空间检测方法**: 新增 `getAvailableSpace(): number` 方法
   - 计算 localStorage 已使用空间（调用现有的 `getSize()` 方法）
   - 假设配额为 5MB（5 * 1024 * 1024 字节），返回剩余空间
   - 注意：浏览器配额可能为 5MB 或 10MB，使用保守估计

4. **添加预检查逻辑**: 在 `set()` 方法开始处添加预检查
   - 调用 `estimateDataSize()` 估算数据大小
   - 调用 `getAvailableSpace()` 获取可用空间
   - 如果数据大小 > 可用空间，提前返回错误，避免触发 QuotaExceededError

5. **添加存储大小阈值常量**: 在文件顶部添加 `const STORAGE_SIZE_THRESHOLD = 4 * 1024 * 1024` (4MB)

**File 2**: `src/hooks/useLocalStorage.ts`

**Function**: `useLocalStorage` hook

**Specific Changes**:
1. **添加 skipLocalStorage 选项**: 修改 hook 签名，添加可选参数 `options?: { skipLocalStorage?: boolean }`
   - 当 `skipLocalStorage: true` 时，跳过 localStorage 读写，仅使用内存状态
   - 初始化时不从 `storageService.get()` 读取
   - `setValue` 时不调用 `storageService.set()`

2. **添加数据大小检测**: 在 `setValue` 中添加数据大小检测逻辑
   - 调用 `storageService.estimateDataSize()` 估算数据大小
   - 如果数据大小 > STORAGE_SIZE_THRESHOLD，自动跳过 localStorage
   - 显示 toast 提示："数据量较大，已保存到云端存储"

3. **改进错误处理**: 在 catch 块中检测 QuotaExceededError
   - 如果是 QuotaExceededError，显示用户友好提示
   - 触发降级到纯云端存储模式（设置标志位或调用回调）

4. **禁用 storage 事件监听**: 当 `skipLocalStorage: true` 时，不监听 storage 事件
   - 避免尝试从 localStorage 读取不存在的数据

**File 3**: `src/services/cloudStorageService.ts`

**Function**: `CloudStorageService.initBackend()`

**Specific Changes**:
1. **修改默认后端**: 将默认存储后端从 `StorageBackendType.GITHUB_GIST` 改为 `StorageBackendType.CLOUDFLARE_R2`
   - 修改代码：`const backendType = (import.meta.env.VITE_STORAGE_BACKEND as StorageBackendType) || StorageBackendType.CLOUDFLARE_R2;`

2. **改进 R2 配置检测**: 当 R2 配置不完整时，回退到 Gist 后端而不是抛出错误
   - 添加 fallback 逻辑：如果 R2 配置缺失，尝试使用 Gist 后端
   - 记录警告信息："R2 配置不完整，回退到 Gist 后端"

**File 4**: `src/contexts/PositionContext.tsx`

**Function**: `PositionProvider` 组件

**Specific Changes**:
1. **添加数据大小检测**: 在 `addPositions` 方法中添加数据大小检测
   - 估算新增岗位数据的大小
   - 如果总数据大小 > STORAGE_SIZE_THRESHOLD，传递 `skipLocalStorage: true` 给 `useLocalStorage`

2. **动态切换存储策略**: 根据岗位数据量动态决定是否使用 localStorage
   - 少于 100 条记录：使用 localStorage + 云端双写
   - 100-500 条记录：检测数据大小，动态决定
   - 超过 500 条记录：直接跳过 localStorage，仅使用云端存储

3. **添加用户提示**: 当检测到大数据集时，显示 toast 提示
   - "检测到大量岗位数据（{count} 条），将使用云端存储以避免浏览器限制"

**File 5**: `.env.example`

**Specific Changes**:
1. **添加 R2 配置说明**: 添加以下环境变量示例
   ```
   # 存储后端选择 (gist 或 r2)
   VITE_STORAGE_BACKEND=r2
   
   # Cloudflare R2 配置（当使用 r2 后端时需要）
   VITE_R2_WORKER_URL=https://your-worker.your-subdomain.workers.dev
   VITE_R2_API_KEY=your-api-key-here
   ```

2. **添加配置说明注释**: 解释何时使用 R2 vs Gist
   - R2: 适合大数据集，无 API 限制，需要 Cloudflare 账号
   - Gist: 适合小数据集，依赖 GitHub，有 API 速率限制

## Testing Strategy

### Validation Approach

测试策略遵循两阶段方法：首先在未修复代码上运行探索性测试以暴露 bug 的具体表现，然后验证修复后的代码正确处理大数据集并保持小数据集的现有行为。

### Exploratory Bug Condition Checking

**Goal**: 在实施修复之前，在未修复代码上暴露 QuotaExceededError 反例。确认或反驳根因分析。如果反驳，需要重新假设根因。

**Test Plan**: 编写测试模拟导入大量岗位数据（1000+ 条记录），尝试保存到 localStorage，并断言抛出 QuotaExceededError。在未修复代码上运行这些测试，观察失败并理解根因。

**Test Cases**:
1. **Large Dataset Import Test**: 模拟导入 1500 条岗位数据（约 6MB），调用 `storageService.set()`，预期在未修复代码上抛出 QuotaExceededError 或返回 false
2. **Boundary Test**: 模拟导入 1000 条岗位数据（约 4.5MB），localStorage 已使用 1MB，总计 5.5MB 刚好超过 5MB 配额，预期在未修复代码上失败
3. **Quota Full Test**: 先填满 localStorage（写入 4.5MB 数据），然后尝试写入 1MB 新数据，预期在未修复代码上抛出 QuotaExceededError
4. **No Error Handling Test**: 验证未修复代码在 QuotaExceededError 发生时仅记录控制台错误，不提供用户提示或降级处理

**Expected Counterexamples**:
- `localStorage.setItem()` 抛出 `QuotaExceededError` 异常
- `storageService.set()` 返回 false，但不提供降级处理
- 用户刷新页面后，未保存的数据丢失
- 可能的根因：缺少配额检测、缺少数据大小预估、缺少降级机制

### Fix Checking

**Goal**: 验证对于所有满足 bug 条件的输入（大数据集或 QuotaExceededError），修复后的函数产生期望行为（自动使用云端存储，显示用户提示，数据成功保存）。

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedStorageSystem(input)
  ASSERT result.savedToCloud === true
  ASSERT result.userNotified === true
  ASSERT result.dataRecoverable === true
  ASSERT result.noQuotaExceededError === true
END FOR
```

**Test Cases**:
1. **Large Dataset Cloud Storage Test**: 导入 1500 条岗位数据，验证系统自动跳过 localStorage，直接保存到 R2，显示提示 "数据量较大，已保存到云端存储"
2. **QuotaExceededError Handling Test**: 模拟 localStorage 配额已满，验证系统捕获 QuotaExceededError，自动降级到云端存储，不抛出异常
3. **Data Recovery Test**: 保存大数据集后刷新页面，验证数据从 R2 正确恢复，localStorage 为空或仅包含小数据
4. **User Notification Test**: 验证当大数据集保存时，用户看到友好提示（toast 或 modal）

### Preservation Checking

**Goal**: 验证对于所有不满足 bug 条件的输入（小数据集，不触发 QuotaExceededError），修复后的函数产生与原始函数相同的结果（继续使用 localStorage 缓存）。

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT fixedStorageSystem(input) = originalStorageSystem(input)
END FOR
```

**Testing Approach**: 推荐使用基于属性的测试（Property-Based Testing）进行保留检查，因为：
- 它自动生成大量测试用例覆盖输入域
- 它能捕获手动单元测试可能遗漏的边界情况
- 它提供强保证：对于所有非 buggy 输入，行为保持不变

**Test Plan**: 首先在未修复代码上观察小数据集的行为（localStorage 缓存 + 云端备份），然后编写基于属性的测试捕获该行为，验证修复后继续工作。

**Test Cases**:
1. **Small Dataset LocalStorage Test**: 观察未修复代码保存公告数据（10 条记录，约 50KB）到 localStorage 的行为，然后验证修复后继续使用 localStorage 缓存
2. **User Profile Preservation Test**: 观察未修复代码保存用户配置（约 5KB）的行为，验证修复后继续正常工作
3. **Small Position List Test**: 观察未修复代码保存 50 条岗位数据（约 200KB）的行为，验证修复后继续使用 localStorage + 云端双写
4. **Cross-Tab Sync Preservation Test**: 验证小数据集在多个标签页之间的同步（通过 storage 事件）继续正常工作
5. **Auto Backup Preservation Test**: 验证自动备份功能对小数据集继续正常执行
6. **Gist Backend Preservation Test**: 验证当配置使用 Gist 后端时，小数据集继续正常工作

### Unit Tests

- 测试 `storageService.estimateDataSize()` 正确估算各种数据类型的大小
- 测试 `storageService.getAvailableSpace()` 正确计算 localStorage 剩余空间
- 测试 `storageService.set()` 在数据大小超过可用空间时提前返回错误
- 测试 `storageService.set()` 正确捕获和处理 QuotaExceededError
- 测试 `useLocalStorage` hook 的 `skipLocalStorage` 选项正确跳过 localStorage 操作
- 测试 `cloudStorageService.initBackend()` 正确初始化 R2 后端
- 测试 `cloudStorageService.initBackend()` 在 R2 配置缺失时回退到 Gist 后端

### Property-Based Tests

- 生成随机大小的数据集（10 条到 2000 条岗位记录），验证系统根据数据大小自动选择存储策略（localStorage vs 云端）
- 生成随机的 localStorage 使用状态（0% 到 100% 已使用），验证系统正确检测可用空间并做出决策
- 生成随机的小数据集（公告、用户配置），验证修复后继续使用 localStorage 缓存，行为与原始代码一致
- 测试跨多种场景（不同数据大小、不同 localStorage 状态、不同存储后端配置）的数据保存和恢复

### Integration Tests

- 测试完整的大数据集导入流程：Excel 上传 → 解析 → 保存到 R2 → 刷新页面 → 从 R2 恢复
- 测试小数据集的完整流程：创建公告 → 保存到 localStorage + 云端 → 跨标签页同步 → 刷新页面恢复
- 测试存储后端切换：从 Gist 切换到 R2，验证数据迁移和功能正常
- 测试自动备份在大数据集场景下的行为：验证备份仅上传到云端，不尝试写入 localStorage
- 测试用户体验流程：导入大数据集 → 看到友好提示 → 刷新页面 → 数据正确恢复 → 无错误提示
