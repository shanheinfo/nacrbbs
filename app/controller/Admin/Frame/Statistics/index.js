export default {
    // 获取首页统计数据
    GetIndexStatistics: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().slice(0, 19).replace('T', ' ');

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 19).replace('T', ' ');

        const [
            totalUsers, totalThreads, totalComments,
            todayRegister, todayThreads, todayComments,
            yesterdayRegister, yesterdayThreads, yesterdayComments,
            todayRevenue, yesterdayRevenue,
            todayBillList, yesterdayBillList
        ] = await Promise.all([
            global.db.query('SELECT COUNT(*) as count FROM n_users'),
            global.db.query('SELECT COUNT(*) as count FROM n_threads'),
            global.db.query('SELECT COUNT(*) as count FROM n_comment'),
            global.db.query('SELECT COUNT(*) as count FROM n_users WHERE n_registertime >= ?', [todayStr]),
            global.db.query('SELECT COUNT(*) as count FROM n_threads WHERE n_time >= ?', [todayStr]),
            global.db.query('SELECT COUNT(*) as count FROM n_comment WHERE n_time >= ?', [todayStr]),
            global.db.query('SELECT COUNT(*) as count FROM n_users WHERE n_registertime >= ? AND n_registertime < ?', [yesterdayStr, todayStr]),
            global.db.query('SELECT COUNT(*) as count FROM n_threads WHERE n_time >= ? AND n_time < ?', [yesterdayStr, todayStr]),
            global.db.query('SELECT COUNT(*) as count FROM n_comment WHERE n_time >= ? AND n_time < ?', [yesterdayStr, todayStr]),
            global.db.query('SELECT COALESCE(SUM(CAST(n_amount AS DECIMAL(10,2))), 0) as amount FROM n_payorder WHERE n_paytime >= ? AND n_type = "2"', [todayStr]),
            global.db.query('SELECT COALESCE(SUM(CAST(n_amount AS DECIMAL(10,2))), 0) as amount FROM n_payorder WHERE n_paytime >= ? AND n_paytime < ? AND n_type = "2"', [yesterdayStr, todayStr]),
            global.db.query('SELECT * FROM n_payorder WHERE n_paytime >= ? ORDER BY n_paytime DESC LIMIT 10', [todayStr]),
            global.db.query('SELECT * FROM n_payorder WHERE n_paytime >= ? AND n_paytime < ? ORDER BY n_paytime DESC LIMIT 10', [yesterdayStr, todayStr])
        ]);

        const todayRevenueTotal = parseFloat(todayRevenue[0].amount) || 0;
        const yesterdayRevenueTotal = parseFloat(yesterdayRevenue[0].amount) || 0;

        const result = {
            total: {
                users: totalUsers[0].count,
                threads: totalThreads[0].count,
                comments: totalComments[0].count
            },
            today: {
                register: todayRegister[0].count,
                threads: todayThreads[0].count,
                comments: todayComments[0].count,
                revenue: todayRevenueTotal
            },
            yesterday: {
                register: yesterdayRegister[0].count,
                threads: yesterdayThreads[0].count,
                comments: yesterdayComments[0].count,
                revenue: yesterdayRevenueTotal
            },
            billList: {
                today: todayBillList,
                yesterday: yesterdayBillList
            }
        };

        global.sendMsg(reply, 200, '成功', result);
    }),



    // 获取综合趋势数据(指定天数)
    GetComprehensiveTrend: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const days = parseInt(pre.days) || 30;

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const dateEnd = today.toISOString().slice(0, 19).replace('T', ' ');

        const dateStart = new Date(today);
        dateStart.setDate(dateStart.getDate() - (days - 1));
        dateStart.setHours(0, 0, 0, 0);
        const dateStartStr = dateStart.toISOString().slice(0, 19).replace('T', ' ');

        const [users, threads, comments, revenue] = await Promise.all([
            global.db.query('SELECT DATE(n_registertime) as d, COUNT(*) as count FROM n_users WHERE n_registertime >= ? AND n_registertime <= ? GROUP BY DATE(n_registertime)', [dateStartStr, dateEnd]),
            global.db.query('SELECT DATE(n_time) as d, COUNT(*) as count FROM n_threads WHERE n_time >= ? AND n_time <= ? GROUP BY DATE(n_time)', [dateStartStr, dateEnd]),
            global.db.query('SELECT DATE(n_time) as d, COUNT(*) as count FROM n_comment WHERE n_time >= ? AND n_time <= ? GROUP BY DATE(n_time)', [dateStartStr, dateEnd]),
            global.db.query('SELECT DATE(n_paytime) as d, COALESCE(SUM(CAST(n_amount AS DECIMAL(10,2))), 0) as amount FROM n_payorder WHERE n_paytime >= ? AND n_paytime <= ? AND n_type = "2" GROUP BY DATE(n_paytime)', [dateStartStr, dateEnd])
        ]);

        const usersMap = Object.fromEntries(users.map(r => [r.d, r.count]));
        const threadsMap = Object.fromEntries(threads.map(r => [r.d, r.count]));
        const commentsMap = Object.fromEntries(comments.map(r => [r.d, r.count]));
        const revenueMap = Object.fromEntries(revenue.map(r => [r.d, parseFloat(r.amount) || 0]));

        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(dateStart);
            d.setDate(d.getDate() + (days - 1 - i));
            const dateKey = d.toISOString().slice(0, 10);
            result.push({
                date: dateKey,
                register: usersMap[dateKey] || 0,
                threads: threadsMap[dateKey] || 0,
                comments: commentsMap[dateKey] || 0,
                revenue: revenueMap[dateKey] || 0
            });
        }

        global.sendMsg(reply, 200, '成功', result);
    })
}