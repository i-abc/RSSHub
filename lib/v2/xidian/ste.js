const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://ste.xidian.edu.cn';

module.exports = async (ctx) => {
    const url = `${baseUrl}/tzgg.htm`;
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);

    let items = $('.row .col-md-6.col-12')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'), // 文章标题
                link: new URL(item.find('a').attr('href'), baseUrl).href, // 指向文章的链接
                pubDate: parseDate(item.find('.time_div span').text()), // 文章发布时间
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
                item.description = content('.vsbcontent_start, .v_news_content p:nth-child(2)').text(); // 文章摘要或全文
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '通知公告-西电通院', // 项目的标题
        link: url, // 指向项目的链接
        description: '西电通院的通知公告的订阅', // 描述项目
        item: items,
    };
};
