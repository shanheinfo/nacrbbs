// 允许写入的公告字段（防止批量赋值）
const NOTICES_FIELDS = ['n_title', 'n_content', 'n_type', 'n_time', 'n_read'];

export default {
    /* 新增公告信息 */
    addnotices: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        NOTICES_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        if (!insertData.n_time) insertData.n_time = new Date();
        insertData.n_read = 0;
        await global.db.insert('n_notices', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑公告信息 */
    editnotices: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        NOTICES_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_notices', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除公告信息 */
    delnotices: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_notices', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}

