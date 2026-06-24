// 允许写入的活动字段（防止批量赋值）
const ACTIVITY_FIELDS = ['n_name', 'n_type', 'n_index', 'n_start_time', 'n_end_time', 'n_reward_config', 'n_status'];

export default {
    /* 获取活动列表 */
    getActivity: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const SqlBuilder = new global.SqlBuilder();
        const sql = SqlBuilder.add('n_name', pre.seach, 'like').build();
        const res = await global.db.getPaginatedData('n_activity', sql.sql, sql.params, ['n_index', 'asc'], pre.page, pre.pagesize)
        // 解析奖励配置JSON
        for (let a in res.data) {
            try {
                res.data[a].n_reward_config = JSON.parse(res.data[a].n_reward_config)
            } catch (error) {
                res.data[a].n_reward_config = []
            }
        }
        global.sendMsg(reply, 200, '获取成功', res.data, res.total);
    }),
    /* 新增活动信息 */
    addActivity: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        ACTIVITY_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        await global.db.insert('n_activity', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑活动信息 */
    editActivity: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        ACTIVITY_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_activity', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除活动信息 */
    deleActivity: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_activity', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}