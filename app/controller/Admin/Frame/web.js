export default {
    /* 编辑站点信息 */
    editweb: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        // 白名单过滤字段，防止批量赋值
        const allowedFields = ['n_web_title', 'n_web_keys', 'n_web_desc', 'n_web_icon', 'n_web_logo', 'n_upload_image_size', 'n_upload_file_size', 'n_upload_image_suffix', 'n_upload_file_suffix', 'n_web_copyright', 'n_contact_qqnumber', 'n_contact_wxnumber', 'n_contact_iponenumebr', 'n_contact_email', 'n_captcha_type', 'n_wechat_miniProgram_appid', 'n_wechat_miniProgram_secret', 'n_wallet_withdraw_off', 'n_wallet_topup_off', 'n_allow_register'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (pre[field] !== undefined) updateData[field] = pre[field];
        });
        // 必须指定 WHERE 条件，防止更新全表
        await global.db.update('n_configuration', updateData, 'id = 1')
        global.sendMsg(reply, 200, '编辑成功');
    }),

    /* 重置后台密码 */
    changeadminpass: (request, reply) => global.Fun(reply, async () => {
        const pre = request.body;
        const Ware = request.Ware;
        await global.db.update('n_admins', {
            n_password: await global.Hash.bcryptStyle(pre.password),
            n_username: pre.username
        }, 'id = ?', [Ware.id])
        global.sendMsg(reply, 200, '编辑成功');
    }),
    /* 获取站点信息 */
    getweb: (request, reply) => global.Fun(reply, async () => {
        const info = await global.db.query('SELECT * FROM n_configuration');
        if (info && info.length > 0) {
            // 隐藏敏感邮件配置信息
            delete info[0].n_email_host;
            delete info[0].n_email_port;
            delete info[0].n_email_user;
            delete info[0].n_email_pass;
            global.sendMsg(reply, 200, '成功', info[0]);
        } else {
            global.sendMsg(reply, 404, '站点信息不存在');
        }
    })
}

