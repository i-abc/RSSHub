const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');
const config = require('@/config').value;
const baseUrl = 'https://job.xidian.edu.cn';

module.exports = async (ctx) => {
    const url = `${baseUrl}/news/index/tag/xwkd`;
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const data = await ctx.cache.tryGet(
        url,
        async () => {
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
            });
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
            });
            await page.waitForSelector('.mn.z.view.view2.infoB');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await page.close();
            const $ = cheerio.load(html);

            return {
                title: $('head title').text(), // 项目的标题
                items: $('.mn.z.view.view2.infoB ul.newsList')
                    .toArray()
                    .map((item) => {
                        item = $(item);
                        return {
                            title: item.find('li.span1 a').text().trim(), // 文章标题
                            link: new URL(item.find('li.span1 a').attr('href'), baseUrl).href, // 指向文章的链接
                            pubDate: parseDate(item.find('li.span2').text()), // 文章发布时间
                            description: '略',
                        };
                    }),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.items.map((item) => item)
    );

    await browser.close();

    ctx.state.data = {
        title: `${data.title}就业信息网`, // 项目的标题
        link: url, // 指向项目的链接
        description: '西电就业信息网的就业资讯的订阅', // 描述项目
        item: items,
    };
};
