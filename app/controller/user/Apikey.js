/* API Key 支持的权限范围定义 */
const VALID_SCOPES = {
  'threads:read': '读取帖子',
  'threads:write': '发布/编辑帖子',
  'threads:delete': '删除帖子',
  'threads:like': '点赞帖子',
  'comments:read': '读取评论',
  'comments:write': '发表评论',
  'comments:delete': '删除评论',
  'user:read': '读取用户信息',
}

/* 验证权限范围列表 */
const validateScopes = (scopesStr) => {
  if (!scopesStr) return { valid: true, scopes: ['threads:read'] }
  const scopes = scopesStr.split(',').map(s => s.trim()).filter(Boolean)
  for (const s of scopes) {
    if (!VALID_SCOPES[s]) {
      return { valid: false, error: `无效的权限范围: ${s}` }
    }
  }
  return { valid: true, scopes }
}

export default {
    /* 获取当前用户的API密钥列表 */
    getApiKeys: (request, reply) => global.Fun(reply, async () => {
        const Ware = request.Ware;
        const pre = request.body;
        const SqlBuilder = new global.SqlBuilder();
        const sql = SqlBuilder.add('n_key', pre.seach, 'like').add('n_uid', Ware.id).build();
        const res = await global.db.getPaginatedData('n_apikeys', sql.sql, sql.params, ['id', 'desc'], pre.page, pre.pagesize)
        /* 隐藏完整key，仅显示前后几位 */
        if (res.data && res.data.length > 0) {
          res.data = res.data.map(item => ({
            ...item,
            n_key_masked: item.n_key.substring(0, 6) + '****' + item.n_key.substring(item.n_key.length - 4)
          }))
        }
        global.sendMsg(reply, 200, '获取成功', res.data, res.total);
    }),

    /* 获取权限范围定义 */
    getApiScopes: (request, reply) => global.Fun(reply, async () => {
        global.sendMsg(reply, 200, '获取成功', VALID_SCOPES);
    }),

    /* 新增API密钥 */
    addApiKeys: (request, reply) => global.Fun(reply, async () => {
        const Ware = request.Ware;
        const pre = request.body;

        /* 验证权限范围 */
        const scopeResult = validateScopes(pre.n_scopes)
        if (!scopeResult.valid) {
          return global.sendMsg(reply, 400, scopeResult.error);
        }

        /* 验证过期时间 */
        if (pre.n_expires) {
          const expiresDate = new Date(pre.n_expires)
          if (isNaN(expiresDate.getTime())) {
            return global.sendMsg(reply, 400, '过期时间格式无效');
          }
          if (expiresDate <= new Date()) {
            return global.sendMsg(reply, 400, '过期时间必须晚于当前时间');
          }
        }

        /* 限制每用户最多10个key */
        const countResult = await global.db.query('SELECT COUNT(*) as cnt FROM n_apikeys WHERE n_uid = ?', [Ware.id])
        if (countResult && countResult[0] && countResult[0].cnt >= 10) {
          return global.sendMsg(reply, 400, '每个用户最多创建10个API密钥');
        }

        /* 生成唯一key: nak_前缀 + 32位随机字符 */
        const keyRaw = 'nak_' + global.Tools.generateComplexCode(32)
        let Form = {
            n_key: keyRaw,
            n_uid: Ware.id,
            n_time: new Date(),
            n_type: '1',
            n_white: pre.n_white || '',
            n_black: pre.n_black || '',
            n_name: pre.n_name || '未命名密钥',
            n_ipstatus: pre.n_ipstatus || '0',
            n_scopes: scopeResult.scopes.join(','),
            n_expires: pre.n_expires || null
        }

        await global.db.insert('n_apikeys', Form)
        /* 创建时返回完整key，仅此一次 */
        global.sendMsg(reply, 200, '创建成功，请妥善保管密钥，此为唯一一次展示完整密钥', { key: keyRaw });
    }),

    /* 编辑API密钥 */
    editApiKeys: (request, reply) => global.Fun(reply, async () => {
        const Ware = request.Ware;
        const pre = request.body;

        /* 验证key归属 */
        const existing = await global.db.query('SELECT * FROM n_apikeys WHERE id = ?', [pre.id])
        if (!existing || existing.length === 0) {
          return global.sendMsg(reply, 404, '密钥不存在');
        }
        if (existing[0].n_uid !== Ware.id) {
          return global.sendMsg(reply, 403, '无权限操作此密钥');
        }

        /* 构建更新字段，禁止修改key和uid */
        let Form = {}
        if (pre.n_name !== undefined) Form.n_name = pre.n_name
        if (pre.n_type !== undefined) Form.n_type = pre.n_type
        if (pre.n_white !== undefined) Form.n_white = pre.n_white
        if (pre.n_black !== undefined) Form.n_black = pre.n_black
        if (pre.n_ipstatus !== undefined) Form.n_ipstatus = pre.n_ipstatus

        /* 验证并更新权限范围 */
        if (pre.n_scopes !== undefined) {
          const scopeResult = validateScopes(pre.n_scopes)
          if (!scopeResult.valid) {
            return global.sendMsg(reply, 400, scopeResult.error);
          }
          Form.n_scopes = scopeResult.scopes.join(',')
        }

        /* 验证并更新过期时间 */
        if (pre.n_expires !== undefined) {
          if (pre.n_expires) {
            const expiresDate = new Date(pre.n_expires)
            if (isNaN(expiresDate.getTime())) {
              return global.sendMsg(reply, 400, '过期时间格式无效');
            }
          }
          Form.n_expires = pre.n_expires || null
        }

        if (Object.keys(Form).length === 0) {
          return global.sendMsg(reply, 400, '没有需要更新的字段');
        }

        await global.db.update('n_apikeys', Form, 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '更新成功');
    }),

    /* 删除API密钥 */
    deleApiKeys: (request, reply) => global.Fun(reply, async () => {
        const Ware = request.Ware;
        const pre = request.body;

        /* 验证key归属 */
        const existing = await global.db.query('SELECT * FROM n_apikeys WHERE id = ?', [pre.id])
        if (!existing || existing.length === 0) {
          return global.sendMsg(reply, 404, '密钥不存在');
        }
        if (existing[0].n_uid !== Ware.id) {
          return global.sendMsg(reply, 403, '无权限操作此密钥');
        }

        await global.db.delete('n_apikeys', 'id = ?', [pre.id])
        global.sendMsg(reply, 200, '删除成功');
    }),
}
