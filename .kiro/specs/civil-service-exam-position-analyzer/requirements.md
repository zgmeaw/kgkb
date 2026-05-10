# 需求文档

## 简介

公务员考试岗位分析系统是一个基于Web的应用程序，用于帮助考生管理、统计和筛选历年公务员和事业编制考试的岗位数据。系统允许用户上传考试公告信息和岗位数据表格，并根据用户的个人信息智能推荐匹配的岗位，同时提供历年分数对比功能。

## 术语表

- **System**: 公务员考试岗位分析系统
- **User**: 使用系统的考生
- **Announcement**: 考试公告，包含考试的基本信息和时间安排
- **Position_Table**: 岗位表，包含某次考试的所有岗位信息
- **Score_History_Table**: 历年分数表，包含某个岗位的历年录取分数
- **User_Profile**: 用户个人信息，包括专业、学历等
- **Excel_File**: 用户上传的Excel格式的岗位数据文件
- **Filter_Option**: 筛选选项，基于Excel表头生成的可筛选字段
- **Matching_Score**: 匹配度分数，表示岗位与用户个人信息的相似程度

## 需求

### 需求 1: 创建考试公告

**用户故事:** 作为考生，我想要创建新的考试公告，以便管理不同考试的岗位信息。

#### 验收标准

1. THE System SHALL 提供创建Announcement的表单界面，包含以下字段：公告链接、类型、进行状态、报名时间、截至时间、打印准考证时间、考试时间
2. WHEN User 提交Announcement表单，THE System SHALL 验证所有字段均已填写且不为仅包含空白字符的文本
3. WHEN User 提交Announcement表单，THE System SHALL 验证公告链接字段为有效URL格式
4. WHEN User 提交Announcement表单，THE System SHALL 验证所有时间字段为有效日期时间格式
5. WHEN User 提交Announcement表单，THE System SHALL 验证截至时间晚于报名时间
6. IF Announcement表单验证失败，THEN THE System SHALL 显示错误消息指示哪些字段不符合要求，并保留User已输入的数据
7. WHEN Announcement表单验证通过，THE System SHALL 保存Announcement信息到本地存储
8. IF Announcement保存失败，THEN THE System SHALL 显示错误消息指示保存操作失败
9. WHEN Announcement保存成功，THE System SHALL 显示成功消息
10. WHEN Announcement保存成功，THE System SHALL 跳转到该Announcement的详情页面

### 需求 2: 上传岗位数据表格

**用户故事:** 作为考生，我想要上传Excel格式的岗位数据表格，以便对岗位信息进行分析和筛选。

#### 验收标准

1. WHERE Announcement已创建，THE System SHALL 在Announcement详情页面提供上传Excel_File的界面
2. WHEN User 选择Excel_File，THE System SHALL 验证文件扩展名为.xlsx或.xls
3. WHEN User 选择Excel_File，THE System SHALL 验证文件大小不超过10MB
4. IF Excel_File 扩展名不是.xlsx或.xls，THEN THE System SHALL 显示错误消息"文件格式无效，请上传.xlsx或.xls格式的Excel文件"
5. IF Excel_File 大小超过10MB，THEN THE System SHALL 显示错误消息"文件大小超过限制，请上传小于10MB的文件"
6. IF Excel_File 为空文件（0字节），THEN THE System SHALL 显示错误消息"文件为空，请上传包含数据的Excel文件"
7. WHEN Excel_File 验证通过，THE System SHALL 解析文件内容并提取表头信息
8. WHEN Excel_File 解析完成，THE System SHALL 将岗位数据与对应的Announcement关联存储
9. IF Excel_File 解析失败（文件损坏或格式错误），THEN THE System SHALL 显示错误消息"文件解析失败，请检查文件是否损坏或格式是否正确"

### 需求 3: 生成筛选选项

**用户故事:** 作为考生，我想要根据表格的表头自动生成筛选选项，以便快速找到符合条件的岗位。

#### 验收标准

1. WHEN Position_Table 上传并解析成功，THE System SHALL 识别Excel第一行的所有单元格为表头字段
2. THE System SHALL 为每个表头字段生成对应的Filter_Option
3. WHEN 生成Filter_Option时，THE System SHALL 提取该字段在所有岗位记录中的唯一值（去重后的值列表）
4. THE System SHALL 在岗位列表页面的筛选区域显示所有可用的Filter_Option
5. WHEN User 选择一个或多个Filter_Option的值，THE System SHALL 在500毫秒内更新岗位列表，仅显示所有选中筛选条件的岗位
6. IF 某个字段的所有值均为空，THEN THE System SHALL 不为该字段生成Filter_Option
7. THE System SHALL 为每个Filter_Option显示可选值的数量
8. WHEN 筛选条件改变后无岗位匹配，THE System SHALL 显示"无符合条件的岗位"消息

### 需求 4: 智能岗位排序

**用户故事:** 作为考生，我想要系统根据我的个人信息自动排序岗位，以便优先看到最适合我的岗位。

#### 验收标准

1. THE System SHALL 允许User输入和保存User_Profile信息
2. WHEN Position_Table 显示时，THE System SHALL 在3秒内计算每个岗位与User_Profile的Matching_Score
3. IF Matching_Score计算超过3秒，THEN THE System SHALL 显示"正在计算匹配度..."加载提示
4. IF Matching_Score计算失败，THEN THE System SHALL 显示错误消息"匹配度计算失败"并按原始顺序显示岗位
5. WHEN Matching_Score计算完成，THE System SHALL 根据Matching_Score对岗位进行降序排序
6. THE System SHALL 将Matching_Score最高的岗位显示在列表顶部
7. THE System SHALL 在每个岗位卡片上显示Matching_Score的数值（0-100）
8. THE System SHALL 在每个岗位卡片上显示Matching_Score的可视化指示器（进度条或星级）
9. IF User_Profile未设置，THEN THE System SHALL 显示提示消息"请先设置个人信息以获得智能推荐"
10. IF User_Profile未设置，THEN THE System SHALL 按岗位在Excel中的原始顺序显示

### 需求 5: 岗位统计信息

**用户故事:** 作为考生，我想要查看岗位的统计信息，以便了解考试的整体情况和我的报考机会。

#### 验收标准

1. WHERE Announcement 包含Position_Table，THE System SHALL 在岗位表模块显示以下统计信息：岗位总数、招聘总人数、可报考岗位数量
2. THE System SHALL 计算岗位总数为Position_Table中的记录行数
3. THE System SHALL 计算招聘总人数为Position_Table中"招聘人数"字段的数值总和
4. IF Position_Table中"招聘人数"字段缺失或为非数值，THEN THE System SHALL 将该岗位的招聘人数视为0
5. THE System SHALL 根据User_Profile计算可报考岗位数量，统计满足所有岗位要求字段的岗位数
6. IF User_Profile未设置或不完整，THEN THE System SHALL 显示可报考岗位数量为"未知（请完善个人信息）"
7. IF User_Profile未设置或不完整，THEN THE System SHALL 仍显示岗位总数和招聘总人数
8. WHEN 筛选条件改变，THE System SHALL 在500毫秒内重新计算并更新统计信息，仅统计当前显示的岗位

### 需求 6: 历年分数匹配

**用户故事:** 作为考生，我想要查看每个岗位的历年录取分数，以便评估报考难度和成功概率。

#### 验收标准

1. THE System SHALL 为每个Announcement提供历年分数表模块
2. WHEN User 在岗位详情页面查看某个岗位，THE System SHALL 通过岗位标识符（岗位代码或岗位名称）匹配该岗位的Score_History_Table
3. WHERE 岗位存在历年分数数据，THE System SHALL 在岗位详情页面显示历年录取分数数据
4. THE System SHALL 为每条历年分数记录显示年份、分数和排名信息
5. THE System SHALL 按年份降序（最新年份在前）显示历年分数记录
6. IF 岗位没有历年分数数据，THEN THE System SHALL 在岗位详情页面显示"暂无历年数据"提示

### 需求 7: 公告状态管理

**用户故事:** 作为考生，我想要跟踪考试公告的进行状态，以便及时了解考试进度。

#### 验收标准

1. THE System SHALL 在Announcement详情页面提供手动更新进行状态的界面
2. THE System SHALL 支持以下6种状态：未开始、报名中、报名结束、准考证打印中、考试进行中、已结束
3. WHEN 页面加载或刷新时，THE System SHALL 检查当前日期并自动更新Announcement状态
4. WHEN 当前日期在报名时间（含）和截至时间（含）之间，THE System SHALL 自动将状态更新为"报名中"
5. WHEN 当前日期在截至时间之后且在打印准考证时间之前，THE System SHALL 自动将状态更新为"报名结束"
6. WHEN 当前日期在打印准考证时间（含）和考试时间之前，THE System SHALL 自动将状态更新为"准考证打印中"
7. WHEN 当前日期等于考试时间，THE System SHALL 自动将状态更新为"考试进行中"
8. WHEN 当前日期在考试时间之后，THE System SHALL 自动将状态更新为"已结束"
9. WHEN 当前日期在报名时间之前，THE System SHALL 自动将状态更新为"未开始"
10. IF User 手动设置状态与自动计算状态不一致，THEN THE System SHALL 在下次页面加载时恢复为自动计算的状态
11. THE System SHALL 在公告列表中为每个Announcement显示当前状态

### 需求 8: 数据持久化

**用户故事:** 作为考生，我想要系统保存我的所有数据，以便下次访问时继续使用。

#### 验收标准

1. THE System SHALL 使用浏览器localStorage持久化所有Announcement数据
2. THE System SHALL 使用浏览器localStorage持久化所有Position_Table数据
3. THE System SHALL 使用浏览器localStorage持久化User_Profile数据
4. WHEN User 创建或修改Announcement，THE System SHALL 立即保存数据到localStorage
5. WHEN User 上传或修改Position_Table，THE System SHALL 立即保存数据到localStorage
6. WHEN User 更新User_Profile，THE System SHALL 立即保存数据到localStorage
7. IF localStorage保存操作失败，THEN THE System SHALL 显示错误消息提示User存储空间不足或浏览器限制
8. WHEN User 重新访问系统（打开页面或刷新页面），THE System SHALL 从localStorage加载所有已保存的数据
9. IF localStorage数据加载失败或数据损坏，THEN THE System SHALL 显示错误消息并使用空数据初始化系统
10. THE System SHALL 提供数据导出功能，导出JSON格式文件包含所有Announcement、Position_Table和User_Profile数据
11. WHEN User 触发数据导出，THE System SHALL 生成文件名格式为"岗位数据备份_YYYY-MM-DD.json"的下载文件

### 需求 9: 响应式界面设计

**用户故事:** 作为考生，我想要在不同设备上使用系统，以便随时随地查看岗位信息。

#### 验收标准

1. THE System SHALL 采用响应式设计，在屏幕宽度大于等于1024像素时显示桌面布局
2. THE System SHALL 采用响应式设计，在屏幕宽度大于等于768像素且小于1024像素时显示平板布局
3. THE System SHALL 采用响应式设计，在屏幕宽度小于768像素时显示移动端布局
4. WHEN 屏幕宽度小于768像素，THE System SHALL 将多列布局调整为单列布局
5. WHEN 屏幕宽度小于768像素，THE System SHALL 将表格视图转换为卡片视图或可横向滚动的表格
6. THE System SHALL 确保所有功能（创建公告、上传表格、筛选岗位、查看详情、导出数据）在移动设备上可正常使用
7. THE System SHALL 在移动设备上支持触摸交互（点击、滑动、长按）

### 需求 10: 静态网站部署

**用户故事:** 作为开发者，我想要将系统部署到静态网站托管平台，以便用户可以通过互联网访问。

#### 验收标准

1. THE System SHALL 构建为纯静态网站，所有功能通过客户端JavaScript实现，不依赖后端服务器API
2. THE System SHALL 生成的构建产物仅包含HTML、CSS、JavaScript和静态资源文件
3. THE System SHALL 兼容GitHub Pages部署环境，在GitHub Pages上正常运行所有功能
4. THE System SHALL 兼容Cloudflare Pages部署环境，在Cloudflare Pages上正常运行所有功能
5. WHEN 系统部署到GitHub Pages或Cloudflare Pages后，THE System SHALL 在2秒内完成首页加载
6. WHEN 系统部署到GitHub Pages或Cloudflare Pages后，THE System SHALL 正常执行所有功能（创建公告、上传表格、筛选岗位、查看详情、导出数据）
7. THE System SHALL 提供部署文档，说明GitHub Pages和Cloudflare Pages的部署步骤

### 需求 11: Excel文件解析

**用户故事:** 作为考生，我想要系统准确解析我上传的Excel文件，以便正确显示岗位信息。

#### 验收标准

1. WHEN System 接收Excel_File，THE System SHALL 验证文件大小不超过10MB
2. WHEN System 接收Excel_File，THE System SHALL 验证文件不为空文件（大于0字节）
3. WHEN Excel_File 验证通过，THE System SHALL 解析文件为结构化数据对象
4. THE System SHALL 识别第一行为表头行
5. THE System SHALL 将第二行及后续行解析为岗位数据记录
6. THE System SHALL 保留所有单元格的原始数据类型（文本、数字、日期）
7. IF Excel_File 包含多个工作表，THEN THE System SHALL 默认导入第一个工作表
8. IF Excel_File 包含空行（所有单元格均为空），THEN THE System SHALL 跳过该行不作为岗位记录
9. IF Excel_File 解析过程中数据类型转换失败，THEN THE System SHALL 将该单元格值保存为文本类型

### 需求 12: 数据格式化输出

**用户故事:** 作为考生，我想要系统以清晰的格式显示岗位数据，以便快速阅读和理解。

#### 验收标准

1. THE System SHALL 将解析后的岗位数据格式化为表格视图
2. WHEN 表头包含"日期"、"时间"或"date"关键字，THE System SHALL 将该列识别为日期字段并使用YYYY-MM-DD格式显示
3. WHEN Excel单元格数据类型为日期类型，THE System SHALL 将该列识别为日期字段并使用YYYY-MM-DD格式显示
4. WHEN 表头包含"人数"、"数量"、"金额"或"number"关键字，THE System SHALL 将该列识别为数字字段并右对齐显示
5. WHEN Excel单元格数据类型为数字类型，THE System SHALL 将该列识别为数字字段并右对齐显示
6. WHEN 单元格文本长度超过50个字符，THE System SHALL 截断显示并提供悬停提示显示完整内容
7. THE System SHALL 为每个表格列标题提供点击排序功能，首次点击按升序排序，再次点击按降序排序

### 需求 13: 用户个人信息管理

**用户故事:** 作为考生，我想要管理我的个人信息，以便系统能够准确推荐适合我的岗位。

#### 验收标准

1. THE System SHALL 提供个人信息设置页面
2. THE System SHALL 允许User输入以下信息：专业（必填）、学历（必填）、政治面貌（可选）、工作年限（可选）
3. THE System SHALL 将工作年限字段限制为0到50之间的整数
4. THE System SHALL 将专业字段存储为文本类型
5. THE System SHALL 将学历字段存储为枚举类型（专科、本科、硕士、博士）
6. WHEN User 保存个人信息，THE System SHALL 验证专业和学历字段已填写且不为空白字符
7. IF 个人信息验证失败，THEN THE System SHALL 显示错误消息指示哪些必填字段未填写
8. WHEN 个人信息验证通过，THE System SHALL 将User_Profile保存到本地存储
9. IF User_Profile保存失败，THEN THE System SHALL 显示错误消息"保存失败，请重试"
10. WHEN User_Profile保存成功，THE System SHALL 显示成功消息"个人信息已保存"
11. THE System SHALL 允许User随时修改个人信息

### 需求 14: 岗位匹配算法

**用户故事:** 作为考生，我想要系统智能计算岗位匹配度，以便找到最适合我的岗位。

#### 验收标准

1. WHEN 计算Matching_Score时，THE System SHALL 比较岗位要求的专业字段与User_Profile的专业字段
2. IF 岗位专业要求与User_Profile专业完全匹配（字符串相等），THEN THE System SHALL 为该岗位的专业匹配分配60分
3. IF 岗位专业要求与User_Profile专业部分匹配（一方包含另一方的子字符串），THEN THE System SHALL 为该岗位的专业匹配分配30分
4. IF 岗位专业要求与User_Profile专业不匹配，THEN THE System SHALL 为该岗位的专业匹配分配0分
5. IF 岗位学历要求与User_Profile学历完全匹配，THEN THE System SHALL 为该岗位的学历匹配分配20分
6. IF 岗位学历要求与User_Profile学历不匹配，THEN THE System SHALL 为该岗位的学历匹配分配0分
7. IF 岗位政治面貌要求与User_Profile政治面貌完全匹配，THEN THE System SHALL 为该岗位的政治面貌匹配分配10分
8. IF 岗位政治面貌要求与User_Profile政治面貌不匹配，THEN THE System SHALL 为该岗位的政治面貌匹配分配0分
9. IF 岗位工作年限要求小于等于User_Profile工作年限，THEN THE System SHALL 为该岗位的工作年限匹配分配10分
10. IF 岗位工作年限要求大于User_Profile工作年限，THEN THE System SHALL 为该岗位的工作年限匹配分配0分
11. THE System SHALL 将Matching_Score计算为专业匹配分+学历匹配分+政治面貌匹配分+工作年限匹配分
12. IF User_Profile中某字段未填写，THEN THE System SHALL 跳过该字段的匹配计算并将该字段的匹配分设为0
13. IF 岗位要求中某字段缺失，THEN THE System SHALL 跳过该字段的匹配计算并将该字段的匹配分设为0

### 需求 15: 数据导出功能

**用户故事:** 作为考生，我想要导出筛选后的岗位数据，以便离线分析或分享给他人。

#### 验收标准

1. WHERE User 已应用筛选条件到岗位列表，THE System SHALL 在岗位列表页面提供导出按钮
2. WHEN User 点击导出按钮，THE System SHALL 在10秒内将当前显示的所有岗位数据（应用筛选后的结果）导出为Excel_File
3. IF 导出操作超过10秒未完成，THEN THE System SHALL 显示错误消息"导出超时，请减少数据量后重试"
4. IF 导出过程中发生错误，THEN THE System SHALL 显示错误消息"导出失败，请重试"
5. THE System SHALL 在导出的Excel_File中保留所有原始列和数据格式
6. THE System SHALL 在导出的Excel_File中添加Matching_Score列作为最后一列
7. THE System SHALL 使用"岗位数据_YYYY-MM-DD.xlsx"格式命名导出文件，其中YYYY-MM-DD为当前日期
