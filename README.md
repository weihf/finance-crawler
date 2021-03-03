# 小财经 -- node 爬取财经新闻

## 插件库

- express  基于 node.js 的 Web 开发框架
- request  请求库
- cheerio  一个类似于 jQuery 的 DOM 解析库
- art-template  模板引擎
- node-schedule  定时任务处理

##  需求说明

每天来点小小的财经新闻还是很有必要的，太多的也看不过来。所以爬取了一个自己的小新闻列表自用。

- 爬取了三个网站的部分新闻：
  - 华尔街见闻  https://wallstreetcn.com
  - 财联社  https://www.cls.cn
  - 东方财富 | 财经  http://finance.eastmoney.com

##  生成数据库

```sql
-- 小财经
CREATE DATABASE IF NOT EXISTS news character set gbk ;

USE news;

-- 新闻列表
CREATE TABLE list(
	id INT PRIMARY KEY auto_increment,
	title VARCHAR(100) NOT NULL, -- 标题
	href VARCHAR(100) NOT NULL, -- 链接
	hot tinyint NULL, -- 头条
    tag VARCHAR(50) NOT NULL -- 来源标签
);
```



##  主要步骤

- 页面初始化
  - 查询数据库
    - 有数据
      - 将数据展示于浏览器的页面
    - 无数据
      - 爬取数据

- 爬取数据

  - request 下载页面
    - 使用 Promise 来进行包装
  - 分析页面结构，提取HTML内容
    - 使用神器 cheerio 

  - 处理多个（3个）请求
    - promise.all  不在乎3个请求的顺序
    - 所有请求都成功后：
      - 将三个请求得到的数据合并
      - 数据排序：头条在前面

  - 数据持久化

    - 清空数据库的表

    - 将爬取到的数据存储于 mysql 数据库中
    - 存储成功后查询数据并展示于浏览器

- 定时任务
  - 每小时爬取一次数据：每小时的0分0秒触发

