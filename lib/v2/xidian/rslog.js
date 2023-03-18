const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://news.xdrs.site';

module.exports = async (ctx) => {
    const url = String(baseUrl);
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);

    let items = $('.content.index.py4 .post-list .post-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('span a').text(), // 文章标题
                link: new URL(item.find('span a').attr('href'), baseUrl).href, // 指向文章的链接
                pubDate: parseDate(item.find('.meta').text()), // 文章发布时间
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);
                item.description = content('.post .content').text(); // 文章摘要
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(), // 项目的标题
        link: url, // 指向项目的链接
        description: '西电睿思的记录的订阅', // 描述项目
        item: items,
    };
};
