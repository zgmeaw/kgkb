# Bugfix Requirements Document

## Introduction

当用户导入大量岗位数据（例如 1000+ 条记录）时，localStorage 会超出配额限制（通常 5-10MB），导致 `QuotaExceededError` 错误。这会导致数据无法保存、用户看到错误提示、刷新页面后数据丢失等问题。

本 bugfix 旨在通过以下方式解决此问题：
1. 实现 QuotaExceededError 的自动检测和处理
2. 当 localStorage 配额超出时，自动降级到纯云端存储模式
3. 使用 Cloudflare R2 作为主要存储后端处理大数据集
4. 保持 localStorage 作为小数据的快速缓存
5. 提供用户友好的提示和智能缓存策略

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户导入大量岗位数据（1000+ 条记录）并尝试保存到 localStorage THEN 系统抛出 `QuotaExceededError` 异常，导致数据保存失败

1.2 WHEN `localStorage.setItem()` 因配额超出而失败 THEN 系统仅在控制台记录错误，但不提供用户友好的错误提示或降级处理

1.3 WHEN localStorage 配额已满 THEN 用户刷新页面后，未保存的数据完全丢失

1.4 WHEN 大数据集保存失败 THEN 系统不会自动尝试使用云端存储（R2）作为替代方案

### Expected Behavior (Correct)

2.1 WHEN 用户导入大量岗位数据（1000+ 条记录）并尝试保存 THEN 系统 SHALL 自动检测数据大小，对于大数据集直接使用云端存储（R2），避免 localStorage 配额问题

2.2 WHEN `localStorage.setItem()` 抛出 `QuotaExceededError` THEN 系统 SHALL 捕获该异常，自动降级到纯云端存储模式，并显示用户友好的提示："数据量较大，已保存到云端存储"

2.3 WHEN localStorage 配额超出时 THEN 系统 SHALL 自动清理旧的缓存数据或完全跳过 localStorage 缓存，确保数据成功保存到云端

2.4 WHEN 用户刷新页面 THEN 系统 SHALL 从云端存储（R2）恢复数据，即使 localStorage 为空或配额已满

2.5 WHEN 系统检测到数据大小超过阈值（例如 4MB）THEN 系统 SHALL 主动跳过 localStorage 缓存，直接使用云端存储

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户导入小数据集（少于 100 条记录）THEN 系统 SHALL CONTINUE TO 同时使用 localStorage 缓存和云端存储，保持快速访问性能

3.2 WHEN 用户保存公告数据或用户配置（小数据）THEN 系统 SHALL CONTINUE TO 优先使用 localStorage 缓存，保持现有的快速响应

3.3 WHEN 现有的 Gist 存储后端被配置使用 THEN 系统 SHALL CONTINUE TO 正常工作，不受此修复影响

3.4 WHEN 自动备份功能运行 THEN 系统 SHALL CONTINUE TO 正常执行备份操作，不受 localStorage 配额限制影响

3.5 WHEN 用户在多个标签页之间切换 THEN 系统 SHALL CONTINUE TO 正常同步数据（通过 storage 事件或云端同步）

3.6 WHEN 用户在不同设备上访问应用 THEN 系统 SHALL CONTINUE TO 从云端存储同步数据，保持跨设备一致性
