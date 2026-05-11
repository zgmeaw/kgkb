# 用户数据存储

这个文件夹用于存储用户的个人数据文件。

## 文件夹结构

- `profiles/` - 用户个人档案文件
- `announcements/` - 招录公告数据文件  
- `positions/` - 岗位信息数据文件
- `backups/` - 数据备份文件

## 文件命名规则

- 个人档案：`profile_用户ID_时间戳.json`
- 公告数据：`announcement_公告ID_时间戳.json`
- 岗位数据：`positions_公告ID_时间戳.json`
- 备份文件：`backup_类型_时间戳.json`

## 数据格式

所有文件均为 JSON 格式，包含完整的数据结构和元数据信息。