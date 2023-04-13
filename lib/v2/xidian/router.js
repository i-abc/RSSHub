module.exports = (router) => {
    router.get('/jwc/:category?', require('./jwc')); // 教务处
    router.get('/ste/:tzgg?', require('./ste')); // 通信工程学院
    router.get('/bksy/:category?', require('./bksy')); // 本科生院
    router.get('/rslog/:news?', require('./rslog')); // 睿思记录
    router.get('/job/campus', require('./job_campus')); // 就业信息网-招聘公告
    router.get('/job/jobs', require('./job_jobs')); // 就业信息网-职位发布
    router.get('/job/tzgg', require('./job_tzgg')); // 就业信息网-通知公告
    router.get('/job/jyzx', require('./job_jyzx')); // 就业信息网-就业资讯
    router.get('/job/xngs', require('./job_xngs')); // 就业信息网-校内公示
};
