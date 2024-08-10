# taro-app-router
为taro项目引入约定式路由
## 使用
在`config/index.ts`中引入此插件.
## 参数
引入插件时可以为其增加参数
``` ts
type Options = {
  /** 路由文件名文件 */
  config?: string;
  /** 根路由文件夹 */
  root?: string;
  /** 页面文件名 */
  page?: string;
};
```
在taro项目的`sourcePath`下,此插件会寻找root目录,遍历其下的每个子文件夹,如果具有名为page且后缀为.tsx(.jsx,.ts,.js),将这个文件作为页面插入配置文件config中.  
`config`默认值`app.config.ts`,`root`默认值`app`,`page`默认值`page`.默认值下应当具有如下文件结构:
```
src
├── app
|  ├── page.config.ts
|  └── page.tsx
├── app.config.ts
├── app.tsx
└── index.html
```
此时的路由是`['app/page']`