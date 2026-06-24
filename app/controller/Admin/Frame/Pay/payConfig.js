// 允许写入的支付配置字段（防止批量赋值）
const PAYCONFIG_FIELDS = ['n_name', 'n_config', 'n_time'];

export default {
    /* 获取支付配置列表 */
    getPayconfig: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const SqlBuilder = new global.SqlBuilder();
        const sql = SqlBuilder.add('n_name', pre.seach, 'like').build();
        const res = await global.db.getPaginatedData('n_payconfig', sql.sql, sql.params, ['id', 'desc'], pre.page, pre.pagesize)
        // 解析JSON配置
        for(let a in res.data){
            try {
                res.data[a].n_config = JSON.parse(res.data[a].n_config)
            } catch (error) {
                console.log(error);
            }
        }
        global.sendMsg(reply, 200, '获取成功', res.data, res.total);
    }),
    /* 新增支付配置信息 */
    addPayconfig: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        PAYCONFIG_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        if (!insertData.n_time) insertData.n_time = new Date();
        await global.db.insert('n_payconfig', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑支付配置信息 */
    editPayconfig: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        PAYCONFIG_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_payconfig', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除支付配置信息 */
    delePayconfig: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_payconfig', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}
