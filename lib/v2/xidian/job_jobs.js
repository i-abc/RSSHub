const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { finishArticleItem } = require('@/utils/wechat-mp');
const config = require('@/config').value;
const baseUrl = 'https://job.xidian.edu.cn';

module.exports = async (ctx) => {
    const url = `${baseUrl}/job/search?title=&city=&d_skill=&d_industry=&d_major=&d_education=&d_category=&d_salary=&nature=&scale=&time=`;
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
            await page.waitForSelector('.job-box');

            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await page.close();
            const $ = cheerio.load(html);

            return {
                title: $('head title').text(), // 项目的标题
                items: $('.job-box ul.list li .left .job')
                    .toArray()
                    .map((item) => {
                        item = $(item);
                        return {
                            title: '岗位：' + item.find('.name a').text().trim(), // 文章标题
                            link: new URL(item.find('.name a').attr('href'), baseUrl).href, // 指向文章的链接
                            description: '公司：' + item.find('.company a').text().trim() + '<br>' + '薪资：' + item.find('.salary p').text().trim() + '<br>' + '学历：' + item.find('.salary ul li').eq(2).text().trim() + '<br>' + '性质：' + item.find('.salary ul li').eq(1).text().trim() + '<br>' + '地点：' + item.find('.salary ul li').eq(0).text().trim(),  // 文字摘要
                        };
                    }),
            };
        },
        config.cache.routeExpire,
        false
    );

    const items = await Promise.all(
        data.items.map((item) => {
                return item;            
        })
    );

    await browser.close();

    ctx.state.data = {
        title: data.title, // 项目的标题
        link: url, // 指向项目的链接
        description: '西电就业信息网的职位发布的订阅', // 描述项目
        item: items,
    };
};
