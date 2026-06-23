import crypto from 'crypto'

/* scope 与路径映射 */
const SCOPE_ROUTE_MAP = {
  '/v1/threads/add': 'threads:write',
  '/v1/threads/edit': 'threads:write',
  '/v1/threads/delete': 'threads:delete',
  '/v1/threads/like': 'threads:like',
  '/v1/threads/comment': 'comments:write',
  '/v1/comments/delete': 'comments:delete',
}

export default async function (request, reply) {
  try {
    const apiKey = request.headers['apikey']

    if (!apiKey) {
      return global.sendMsg(reply, 401, '缺少ApiKey');
    }

    /* 查询key信息，使用哈希比对 */
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyInfo = await global.db.query(
      'SELECT id, n_uid, n_key, n_type, n_expires, n_ipstatus, n_white, n_black, n_scopes FROM n_apikeys WHERE n_key = ? AND n_type = 1',
      [keyHash]
    )

    if (!keyInfo || keyInfo.length === 0) {
      return global.sendMsg(reply, 401, '无效的ApiKey');
    }

    const key = keyInfo[0]

    /* 检查过期时间 */
    if (key.n_expires) {
      const expiresDate = new Date(key.n_expires)
      if (expiresDate <= new Date()) {
        return global.sendMsg(reply, 401, 'ApiKey已过期');
      }
    }

    /* 获取客户端IP：仅使用 request.ip（由Fastify trust proxy配置决定），不信任客户端可伪造的x-forwarded-for */
    const clientIp = request.ip || ''

    /* 检查IP白名单 */
    if (key.n_ipstatus === '1' && key.n_white) {
      const whiteList = key.n_white.split(',').map(s => s.trim()).filter(s => s && s !== 'null')
      if (whiteList.length > 0 && !whiteList.includes(clientIp)) {
        return global.sendMsg(reply, 403, 'IP不在白名单中');
      }
    }

    /* 检查IP黑名单 */
    if (key.n_black) {
      const blackList = key.n_black.split(',').map(s => s.trim()).filter(s => s && s !== 'null')
      if (blackList.includes(clientIp)) {
        return global.sendMsg(reply, 403, 'IP已被封禁');
      }
    }

    /* 解析权限范围 */
    const scopes = key.n_scopes ? key.n_scopes.split(',').map(s => s.trim()).filter(Boolean) : []

    /* 检查请求路径是否在权限范围内 - 使用 pathname 避免查询字符串绕过 */
    const pathname = new URL(request.url, 'http://localhost').pathname
    const requiredScope = SCOPE_ROUTE_MAP[pathname]
    if (requiredScope && !scopes.includes(requiredScope)) {
      return global.sendMsg(reply, 403, `ApiKey缺少权限: ${requiredScope}`);
    }

    /* 更新最后使用时间（异步，不阻塞请求，记录错误日志） */
    global.db.query('UPDATE n_apikeys SET n_last_used_at = ? WHERE id = ?', [new Date(), key.id]).catch(err => {
      console.error('更新ApiKey最后使用时间失败:', err)
    })

    /* 挂载用户信息和key信息到 request.Ware */
    request.Ware = {
      id: key.n_uid,
      _apiKeyId: key.id,
      _apiKeyScopes: scopes,
      _authType: 'apikey'
    }

  } catch (error) {
    console.error('ApiKey验证中间件错误:', error);
    return global.sendMsg(reply, 500, '服务器内部错误');
  }
}