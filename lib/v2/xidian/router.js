module.exports = (router) => {
    router.get('/jwc/:category?', require('./jwc')); // 教务处
    router.get('/ste/:tzgg?', require('./ste')); // 通信工程学院
    router.get('/bksy/:category?', require('./bksy')); // 本科生院
    router.get('/rslog/:news?', require('./rslog')); // 睿思记录
    router.get('/job/campus', require('./job_campus')); // 就业信息网-招聘公告
    router.get('/job/jobs', require('./job_jobs')); // 就业信息网-职位发布
    router.get('/job/tzgg', require('./job_tzgg')); // 就业信息网-通知公告
};
