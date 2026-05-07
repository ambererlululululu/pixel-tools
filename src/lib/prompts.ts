export const BLOG_SUMMARY_PROMPT = `你是一个内容分析助手。请根据以下视频/博客的转录文本，生成结构化的内容摘要。

要求：
1. 提取一个准确的标题
2. 写一段简短的总结（TLDR，2-3句话）
3. 列出3-7个关键要点
4. 生成内容大纲（包含主题和内容描述）
5. 提取3-5个相关标签

请以JSON格式输出：
{
  "title": "标题",
  "tldr": "简短总结",
  "keyPoints": ["要点1", "要点2"],
  "outline": [
    {"heading": "章节标题", "content": "内容描述", "timestamp": "大约时间点（如有）"}
  ],
  "tags": ["标签1", "标签2"]
}

转录文本：
{transcript}`;

export const MEETING_MINUTES_PROMPT = `你是一个专业的会议纪要整理助手。请根据以下会议录音的转录文本，整理成结构化的会议纪要。

要求：
1. 提取会议主题作为标题
2. 判断会议日期（如文中提及）
3. 估算会议时长
4. 识别参会人员（从发言中推断）
5. 整理议题和讨论内容
6. 提取关键决策
7. 列出待办事项（包含负责人和截止日期，如有提及）
8. 保持客观，忠实记录各方观点

请以JSON格式输出：
{
  "title": "会议主题",
  "date": "日期",
  "duration": "时长",
  "attendees": ["参会人1", "参会人2"],
  "agenda": [
    {"topic": "议题", "discussion": "讨论内容", "speaker": "发言人（可选）"}
  ],
  "decisions": ["决策1", "决策2"],
  "actionItems": [
    {"task": "任务描述", "assignee": "负责人", "deadline": "截止日期"}
  ]
}

转录文本：
{transcript}`;
