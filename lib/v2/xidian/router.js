module.exports = (router) => {
    router.get('/jwc/:category?', require('./jwc')); // 教务处
    router.get('/ste/:tzgg?', require('./ste')); // 通信工程学院
};
