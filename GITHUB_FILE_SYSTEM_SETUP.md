# GitHub 文件系统存储配置指南

## 📖 概述

GitHub 文件系统存储功能允许您将用户数据（个人档案、公告、岗位）自动保存为 GitHub 仓库中的文件，实现：

- ✅ **版本控制**：每次保存都有完整的 Git 历史记录
- ✅ **数据安全**：文件存储在您的 GitHub 仓库中
- ✅ **跨设备同步**：通过 Git 自动同步
- ✅ **备份恢复**：可以随时回滚到历史版本

## 🔧 配置步骤

### 1. 创建 GitHub Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 设置 Token 名称：`kgkb-file-system`
4. 选择权限：
   - ✅ `repo` (完整仓库访问权限)
   - ✅ `workflow` (工作流权限)
5. 点击 **"Generate token"**
6. **重要**：复制生成的 token（格式：`ghp_xxxxxxxxxxxxxxxxxxxx`）

### 2. 在登录页面配置

1. 打开应用登录页面
2. 输入访问密码
3. 输入 GitHub Token
4. 点击 **"高级：配置 GitHub 文件系统存储"**
5. 填写：
   - **GitHub 用户名**：您的 GitHub 用户名
   - **仓库名称**：您的仓库名称（例如：`kgkb`）
6. 点击登录

### 3. 验证配置

登录后，当您：
- 保存个人档案
- 添加公告
- 导入岗位

系统会自动在仓库的 `user-data/` 目录下创建对应的 JSON 文件。

## 📁 文件结构

```
your-repo/
└── user-data/
    ├── profiles/              # 用户档案文件
    │   └── profile_xxx_timestamp.json
    ├── announcements/         # 公告数据文件
    │   └── announcement_xxx_timestamp.json
    ├── positions/             # 岗位数据文件
    │   └── positions_xxx_timestamp.json
    └── backups/              # 备份文件
        └── backup_xxx_timestamp.json
```

## 🔒 安全说明

### Token 存储位置

- **本地开发**：Token 存储在浏览器的 localStorage 中
- **不会上传**：Token 不会被提交到 Git 或上传到服务器
- **仅本地使用**：Token 仅在您的浏览器中使用，用于调用 GitHub API

### 权限说明

Token 需要以下权限：
- `repo`：用于触发 GitHub Actions 和访问仓库
- `workflow`：用于触发数据管理工作流

### 安全建议

1. ✅ 定期轮换 Token（建议每 3-6 个月）
2. ✅ 不要与他人分享您的 Token
3. ✅ 如果 Token 泄露，立即在 GitHub 设置中撤销
4. ✅ 使用强密码保护您的 GitHub 账号

## 🚀 使用方式

### 自动保存

配置完成后，以下操作会自动触发文件保存：

1. **保存个人档案**
   - 点击"保存档案"按钮
   - 自动创建 `profile_xxx.json` 文件

2. **添加公告**
   - 创建新公告
   - 自动创建 `announcement_xxx.json` 文件

3. **导入岗位**
   - 导入 Excel 文件
   - 自动创建 `positions_xxx.json` 文件

### 查看文件

1. 访问您的 GitHub 仓库
2. 进入 `user-data/` 目录
3. 查看对应的子目录和文件

### 版本历史

1. 在 GitHub 仓库中点击文件
2. 点击 **"History"** 查看所有修改记录
3. 可以查看任何历史版本的内容

## ❓ 常见问题

### Q: 为什么提示"GitHub 配置不完整"？

A: 请确保您已经：
1. 输入了有效的 GitHub Token
2. 填写了正确的 GitHub 用户名
3. 填写了正确的仓库名称

### Q: 文件保存失败怎么办？

A: 检查以下几点：
1. Token 是否有正确的权限（repo + workflow）
2. 仓库名称是否正确
3. 网络连接是否正常
4. 查看浏览器控制台的错误信息

### Q: 可以不配置文件系统吗？

A: 可以！文件系统存储是可选功能。不配置的话：
- 数据仍会保存到 localStorage
- 仍可使用云端存储（Gist 或 R2）
- 只是没有文件版本控制功能

### Q: 文件系统和云端存储有什么区别？

A: 
- **文件系统**：数据保存为仓库文件，有 Git 历史记录
- **云端存储**：数据保存为加密的云端备份，用于跨设备同步

两者可以同时使用，互为补充。

## 📞 技术支持

如有问题，请：
1. 查看浏览器控制台的错误信息
2. 检查 GitHub Actions 的运行日志
3. 提交 Issue 到项目仓库

---

**祝您使用愉快！** 🎉