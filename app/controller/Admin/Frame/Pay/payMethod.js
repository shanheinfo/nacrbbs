// 允许写入的支付方式字段（防止批量赋值）
const PAYMETHOD_FIELDS = ['n_name', 'n_icon', 'n_index', 'n_type', 'n_payconfig_id', 'n_status'];

export default {
    /* 新增支付方式信息 */
    addPaymethod: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        PAYMETHOD_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        await global.db.insert('n_paymethod', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑支付方式信息 */
    editPaymethod: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        PAYMETHOD_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_paymethod', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除支付方式信息 */
    delePaymethod: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_paymethod', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
    /* 获取支付方式列表 */
    GetPayMethod: (request, reply) => global.Fun(reply, async () => {
        try {
            const paymethod = await global.db.query('SELECT * FROM n_paymethod ORDER BY n_index DESC');
            global.sendMsg(reply, 200, '成功', paymethod);
        } catch (error) {
            console.log(error);
            global.sendMsg(reply, 201, '支付方式获取失败: ' + error.message);
        }
    }),
}

