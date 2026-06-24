// 允许写入的邮件模板字段（防止批量赋值）
const EMAIL_TEMPLATE_FIELDS = ['n_name', 'n_title', 'n_content', 'n_time'];

export default {
    /* 获取模板列表 */
    emailTemplate: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const SqlBuilder = new global.SqlBuilder();
        const sql = SqlBuilder.add('n_name', pre.seach, 'like').build();
        const res = await global.db.getPaginatedData('n_email_template', sql.sql, sql.params, ['id', 'desc'], pre.page, pre.pagesize)
        global.sendMsg(reply, 200, '获取成功', res.data, res.total);
    }),
    /* 新增模板信息 */
    addnemailTemplate: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const insertData = {};
        EMAIL_TEMPLATE_FIELDS.forEach(field => { if (pre[field] !== undefined) insertData[field] = pre[field]; });
        if (!insertData.n_time) insertData.n_time = new Date();
        await global.db.insert('n_email_template', insertData)
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 编辑模板信息 */
    editemailTemplate: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const updateData = {};
        EMAIL_TEMPLATE_FIELDS.forEach(field => { if (pre[field] !== undefined) updateData[field] = pre[field]; });
        await global.db.update('n_email_template', updateData, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '操作成功');
    }),
    /* 删除模板信息 */
    delemailTemplate: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        await global.db.delete('n_email_template', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}