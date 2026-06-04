# Arrow Out 首站部署清单

## 当前状态

- [x] 站点目录已建立：`site/`
- [x] 首页已完成
- [x] 详情页已完成
- [x] 分类页已完成
- [x] 长尾内容页已完成
- [x] `robots.txt` 已完成
- [x] `sitemap.xml` 已完成
- [x] `404.html` 已完成
- [x] `favicon` / `manifest` 已完成
- [x] Open Graph / Twitter 分享元信息已完成
- [x] `_headers` / `_redirects` 已完成
- [x] 站内本地链接检查通过
- [x] 自动化静态校验脚本已完成：`node scripts/verify-site.mjs`
- [x] 基础合规页面已完成：`about / privacy / terms / dmca`

---

## 上线前还要完成的动作

### 1. 内容确认

- [ ] 确认站点正式域名
- [ ] 把所有 `canonical` 从 `example.com` 改成正式域名
- [ ] 把 `robots.txt` 中的 sitemap 地址换成正式域名
- [ ] 把 `sitemap.xml` 中的 URL 全部换成正式域名
- [ ] 决定 `Arrow Out` 页面是否先挂真实游戏源，还是先用占位版上线
- [ ] 执行 `./set-domain.sh https://your-domain.com`
- [ ] 重新运行 `node scripts/verify-site.mjs --production`

### 2. 仓库准备

- [ ] 首次 Git 提交
- [ ] 推送到远程仓库

### 3. 部署平台

- [ ] 选择部署平台，默认建议 `Cloudflare Pages`
- [ ] 新建 Pages 项目
- [ ] 连接 GitHub 仓库
- [ ] 设置部署目录为 `site`
- [ ] 完成首次部署

### 4. 域名与解析

- [ ] 购买或确定域名
- [ ] 在 Cloudflare 接入域名
- [ ] 给 Pages 绑定自定义域名
- [ ] 确认 HTTPS 正常

### 5. 收录准备

- [ ] 站点可公开访问
- [ ] 提交 `sitemap.xml` 到 Google Search Console
- [ ] 提交站点到 Bing Webmaster Tools

---

## 当前建议

如果目标是 `最快上线验证`，建议按这个顺序推进：

1. 先确认域名
2. 先直接用当前静态版上线
3. 游戏源后补，不阻塞首版发布
4. 先拿到抓取和收录反馈，再迭代游戏入口

---

## 当前阻塞项

当前还没有真正完成公网“上线成功”，因为还缺：

- 正式域名
- 部署平台绑定
- 远程仓库 / 发布动作

这些属于外部环境动作，不是站点代码本身的问题。
