// 允许写入的轮播字段（防止批量赋值）
const SWIPERS_FIELDS = ['n_title', 'n_image', 'n_url', 'n_sort', 'n_type'];

export default {
    /* 新增轮播信息 */
    addswipers: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        SWIPERS_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        await global.db.insert('n_swipers', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑轮播信息 */
    editswipers: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        SWIPERS_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_swipers', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除轮播信息 */
    delswipers: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_swipers', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}