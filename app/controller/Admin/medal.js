
// 允许写入的勋章字段（防止批量赋值）
const MEDAL_FIELDS = ['n_name', 'n_icon', 'n_sort', 'n_profile', 'n_type'];

export default {
    /* 获取勋章 */
    getMedal: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const SqlBuilder = new global.SqlBuilder();
        const sql = SqlBuilder.add('n_name', pre.seach, 'like');
        const res = await global.db.getPaginatedData('n_medal', sql.sql, sql.params, ['n_sort', 'desc'], pre.page, pre.pagesize)
        global.sendMsg(reply, 200, '获取成功', res.data, res.total);
    }),
    /* 编辑勋章信息 */
    editMedal: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        MEDAL_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_medal', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '编辑成功');
    }),
    /* 删除勋章信息 */
    delMedal: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_tclist', 'n_cid = ?', [pre.id])
        await global.db.delete('n_medal', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
    /* 新增勋章信息 */
    addMedal: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        MEDAL_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        await global.db.insert('n_medal', insertData)
        global.sendMsg(reply, 200, '新增成功');
    })
}