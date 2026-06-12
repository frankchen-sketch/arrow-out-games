# Arrows 主题 FAQ 内容校验与草稿池

## 目的

这份文档用于校验已粘贴的 `arrows` 主题 10 个游戏内容草稿，避免把未实现功能、未上线游戏或不确定描述直接发布到公开页面。

当前公开站点只上线：

- `Arrow Maze`

因此本轮只允许将 `Arrow Maze` 中与真实玩法一致的内容合并到公开页面。其余 9 个游戏只进入候选内容池，等对应游戏实现、调试和授权确认后再发布。

## 公开页面校验规则

- 页面内容必须以真实游戏功能为准，不能写未实现功能。
- Controls 必须逐项核对代码和 UI。
- FAQ 必须回答当前页面真实状态，避免用 `if available`、`may`、`usually` 描述已上线游戏。
- Related Games 只链接已有真实页面，不链接未创建页面。
- Credits 必须明确素材与源码来源。
- AdSense 前不发布空页面、薄页面或只有占位说明的候选游戏页。

## Arrow Maze 校验结果

当前真实功能：

- 5 个固定关卡。
- 使用键盘方向键移动。
- 使用移动端屏幕方向按钮移动。
- 支持 Restart。
- 支持通关后 Next Level。
- 使用自绘 Canvas 棋盘、箭头、玩家标记和终点。
- 不使用外部游戏源码、iframe、第三方完整游戏或外部素材。

可合并内容：

- `direction-based puzzle game`
- `every arrow tells you where to move next`
- `read the board carefully`
- `planning your path before you move`
- `Do not rush. Read the whole maze first.`
- `Watch for arrows that loop you back.`

必须排除或改写内容：

- `Arrow Keys / WASD: Move`：当前没有 WASD。
- `Hint Button`：当前没有 Hint。
- `one wrong move may send you into a dead end`：当前错误方向会被阻止，不是直接进入死路。
- `try to complete the maze with as few mistakes as possible`：当前记录 steps，不记录 mistakes。
- `Early levels are easy, but later mazes can become more complex`：可作为未来版本描述，但当前公开页不强调难度承诺。

## 10 个候选游戏内容状态

| 游戏 | 当前状态 | 公开处理 | 主要原因 |
| --- | --- | --- | --- |
| Arrow Maze | 可用，需按真实玩法校正 | 已上线并局部合并 | 已有原创 Canvas 游戏和真实页面 |
| Rotate Arrows Puzzle | 等待游戏实现 | 不创建页面 | 旋转箭头、Play/Check 机制未实现 |
| Arrow Connect | 等待游戏实现 | 不创建页面 | 拖拽、放置、测试路径机制未实现 |
| Archery Target | 等待游戏实现 | 不创建页面 | 射击、力度、物理或目标机制未实现 |
| Arrow Dodge | 等待游戏实现 | 不创建页面 | 生存、碰撞、Dash 机制未实现 |
| Follow The Arrow | 等待游戏实现 | 不创建页面 | 反应计分、倒计时、连续输入机制未实现 |
| Arrow Keys Runner | 等待游戏实现 | 不创建页面 | 跑酷、跳跃、下滑、障碍机制未实现 |
| Arrow Sort | 等待游戏实现 | 不创建页面 | 分类、拖拽、计时或分组机制未实现 |
| One Arrow Challenge | 等待游戏实现 | 不创建页面 | 瞄准、反弹、单箭射击机制未实现 |
| Arrow Path | 等待游戏实现 | 不创建页面 | 放置箭头、运行路径、重置路径机制未实现 |

## 后续使用方式

1. 每实现一款新游戏，先把真实功能写成一段 `implemented behavior`。
2. 对照该游戏草稿，删除所有未实现功能和不确定描述。
3. 补齐 Credits / License。
4. 页面完成后再加入首页、分类页、Related Games 和 sitemap。
5. 发布前运行站点链接校验和玩法验收。

