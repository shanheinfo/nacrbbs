<template>
    <div>
        <UserHeader title="API 接口文档"></UserHeader>
        <div class="Page">

            <div class="doc-section">
                <h2>1. 概述</h2>
                <p>shanhe 论坛提供两套 API 接口：</p>
                <ul>
                    <li><strong>公开接口</strong>（<code>/api/*</code>）：无需登录即可访问，部分接口携带 Token 后可获取更多数据</li>
                    <li><strong>API Key 接口</strong>（<code>/v1/*</code>）：通过 API Key 鉴权，适用于自动化脚本、第三方集成</li>
                </ul>
            </div>

            <div class="doc-section">
                <h2>2. 通用说明</h2>
                <h3>2.1 请求格式</h3>
                <table>
                    <thead><tr><th>项目</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td>请求方式</td><td><code>POST</code>（所有接口统一使用 POST）</td></tr>
                        <tr><td>Content-Type</td><td><code>application/x-www-form-urlencoded</code></td></tr>
                        <tr><td>字符编码</td><td>UTF-8</td></tr>
                    </tbody>
                </table>

                <h3>2.2 返回格式</h3>
                <p>所有接口统一返回 JSON 格式：</p>
                <div class="code-block"><pre>{
  "code": 200,
  "msg": "操作成功",
  "data": {},       // 业务数据，类型视接口而定
  "total": 0        // 列表接口返回总条数，非列表接口为0
}</pre></div>

                <h3>2.3 状态码说明</h3>
                <table>
                    <thead><tr><th>code</th><th>含义</th></tr></thead>
                    <tbody>
                        <tr><td><code>200</code></td><td>成功</td></tr>
                        <tr><td><code>201</code></td><td>业务逻辑错误（如用户名不存在、密码错误）</td></tr>
                        <tr><td><code>400</code></td><td>参数错误</td></tr>
                        <tr><td><code>401</code></td><td>未授权（缺少Token/ApiKey、Token过期、Token无效）</td></tr>
                        <tr><td><code>403</code></td><td>无权限（如操作他人内容、IP被封禁、权限范围不足）</td></tr>
                        <tr><td><code>404</code></td><td>资源不存在</td></tr>
                        <tr><td><code>429</code></td><td>请求过于频繁（限流）</td></tr>
                        <tr><td><code>500</code></td><td>服务器内部错误</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="doc-section">
                <h2>3. 认证方式</h2>

                <h3>3.1 用户Token认证（/api/* 接口）</h3>
                <p>登录成功后获取 Token，通过 HTTP Header 传递：</p>
                <div class="code-block"><pre>Usertoken: 3c7a833a37c2ca1cd3b927426561bda0:Rf5N7SWUv7KVwrDXVzeNtHfxT2561WOOIoYpumI+rqVzd/fzblAHa6ZERTaRcSqR</pre></div>
                <p>Token 有效期默认30天，过期需重新登录获取。</p>

                <h3>3.2 API Key认证（/v1/* 接口）</h3>
                <p>在 API Key 管理页面创建密钥后，通过 HTTP Header 传递：</p>
                <div class="code-block"><pre>ApiKey: nak_a1b2c3d4e5f6...your_full_key_here</pre></div>
                <p>每个 API Key 绑定权限范围（Scope），只能调用对应权限的接口。Key 创建后仅显示一次完整值，请妥善保存。</p>
            </div>

            <div class="doc-section">
                <h2>4. API Key 权限范围</h2>
                <table>
                    <thead><tr><th>Scope</th><th>说明</th><th>对应接口</th></tr></thead>
                    <tbody>
                        <tr><td><code>threads:read</code></td><td>读取帖子</td><td>公开接口，无需此权限</td></tr>
                        <tr><td><code>threads:write</code></td><td>发布/编辑帖子</td><td>/v1/threads/add, /v1/threads/edit</td></tr>
                        <tr><td><code>threads:delete</code></td><td>删除帖子</td><td>/v1/threads/delete</td></tr>
                        <tr><td><code>threads:like</code></td><td>点赞帖子</td><td>/v1/threads/like</td></tr>
                        <tr><td><code>comments:read</code></td><td>读取评论</td><td>公开接口，无需此权限</td></tr>
                        <tr><td><code>comments:write</code></td><td>发表评论</td><td>/v1/threads/comment</td></tr>
                        <tr><td><code>comments:delete</code></td><td>删除评论</td><td>/v1/comments/delete</td></tr>
                        <tr><td><code>user:read</code></td><td>读取用户信息</td><td>公开接口，无需此权限</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="doc-section">
                <h2>5. 公开接口（/api/*）</h2>
                <p class="tip">以下接口无需 Token 即可访问，携带 Token 可获取额外数据（如是否已点赞、付费内容等）。</p>

                <div class="api-item" v-for="api in publicApis" :key="api.path">
                    <div class="api-header">
                        <span class="api-method">POST</span>
                        <span class="api-path">{{ api.path }}</span>
                        <span v-if="api.auth" class="api-scope scope-auth">需登录</span>
                        <span v-else class="api-scope">公开</span>
                    </div>
                    <p class="api-desc">{{ api.desc }}</p>
                    <div class="api-detail" v-if="api.params && api.params.length">
                        <div class="detail-title">请求参数</div>
                        <table>
                            <thead><tr><th>参数名</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
                            <tbody>
                                <tr v-for="p in api.params" :key="p.name">
                                    <td><code>{{ p.name }}</code></td>
                                    <td>{{ p.type }}</td>
                                    <td>{{ p.required ? '是' : '否' }}</td>
                                    <td>{{ p.desc }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="api-detail">
                        <div class="detail-title">成功返回示例</div>
                        <div class="code-block"><pre>{{ api.response }}</pre></div>
                    </div>
                    <div class="api-detail" v-if="api.errorExample">
                        <div class="detail-title">错误返回示例</div>
                        <div class="code-block"><pre>{{ api.errorExample }}</pre></div>
                    </div>
                </div>
            </div>

            <div class="doc-section">
                <h2>6. API Key 接口（/v1/*）</h2>
                <p class="tip">以下接口必须通过 API Key 认证，Header 传递 <code>ApiKey</code>。</p>

                <div class="api-item" v-for="api in keyApis" :key="api.path">
                    <div class="api-header">
                        <span class="api-method">POST</span>
                        <span class="api-path">{{ api.path }}</span>
                        <span class="api-scope scope-key">需 {{ api.scope }} 权限</span>
                    </div>
                    <p class="api-desc">{{ api.desc }}</p>
                    <div class="api-detail" v-if="api.params && api.params.length">
                        <div class="detail-title">请求参数</div>
                        <table>
                            <thead><tr><th>参数名</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
                            <tbody>
                                <tr v-for="p in api.params" :key="p.name">
                                    <td><code>{{ p.name }}</code></td>
                                    <td>{{ p.type }}</td>
                                    <td>{{ p.required ? '是' : '否' }}</td>
                                    <td>{{ p.desc }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="api-detail">
                        <div class="detail-title">成功返回示例</div>
                        <div class="code-block"><pre>{{ api.response }}</pre></div>
                    </div>
                    <div class="api-detail" v-if="api.errorExample">
                        <div class="detail-title">错误返回示例</div>
                        <div class="code-block"><pre>{{ api.errorExample }}</pre></div>
                    </div>
                    <div class="api-detail">
                        <div class="detail-title">cURL 请求示例</div>
                        <div class="code-block"><pre>{{ api.curlExample }}</pre></div>
                    </div>
                </div>
            </div>

            <div class="doc-section">
                <h2>7. 完整请求示例</h2>
                <h3>7.1 用户Token方式 - 获取我的信息</h3>
                <div class="code-block"><pre>curl -X POST https://your-domain/api/myinfo \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Usertoken: your_token_here"</pre></div>

                <h3>7.2 API Key方式 - 发布帖子</h3>
                <div class="code-block"><pre>curl -X POST https://your-domain/v1/threads/add \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "ApiKey: nak_your_api_key_here" \
  -d "n_name=我的帖子标题" \
  -d "n_html=&lt;p&gt;帖子内容&lt;/p&gt;" \
  -d "n_class=[1]" \
  -d "n_topic=[]" \
  -d "n_price=0"</pre></div>

                <h3>7.3 API Key方式 - 发表评论</h3>
                <div class="code-block"><pre>curl -X POST https://your-domain/v1/threads/comment \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "ApiKey: nak_your_api_key_here" \
  -d "id=123" \
  -d "n_html=这是一条评论"</pre></div>
            </div>

        </div>
    </div>
</template>

<script setup>
const siteUrl = 'https://your-domain'

const publicApis = [
    {
        path: '/api/login',
        desc: '用户登录，成功后返回 Token',
        auth: false,
        params: [
            { name: 'username', type: 'string', required: true, desc: '用户名' },
            { name: 'password', type: 'string', required: true, desc: '密码' },
        ],
        response: `{
  "code": 200,
  "msg": "登录成功",
  "data": "3c7a833a37c2ca1cd3b927426561bda0:Rf5N7SWUv7KVwrDXVzeNtHfxT2561WOOIoYpumI+rqVzd/fzblAHa6ZERTaRcSqR",
  "total": 0
}`,
        errorExample: `{
  "code": 201,
  "msg": "用户名不存在",
  "data": {},
  "total": 0
}`
    },
    {
        path: '/api/register',
        desc: '用户注册',
        auth: false,
        params: [
            { name: 'username', type: 'string', required: true, desc: '用户名' },
            { name: 'password', type: 'string', required: true, desc: '密码' },
            { name: 'email', type: 'string', required: false, desc: '邮箱（如需验证码则必填）' },
            { name: 'code', type: 'string', required: false, desc: '邮箱验证码' },
            { name: 'inv', type: 'string', required: false, desc: '邀请码' },
        ],
        response: `{
  "code": 200,
  "msg": "注册成功",
  "data": "token_string_here",
  "total": 0
}`
    },
    {
        path: '/api/webinfo',
        desc: '获取网站基本信息（标题、描述、Logo等）',
        auth: false,
        params: [],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "n_web_title": "shanhe开源论坛",
    "n_web_desc": "轻量级论坛系统",
    "n_web_logo": "/public/upload/logo.png",
    "n_web_icon": "/public/upload/icon.png",
    "n_web_copyright": "shanhe",
    "n_contact_qqnumber": "",
    "n_contact_wxnumber": "",
    "n_contact_email": ""
  },
  "total": 0
}`
    },
    {
        path: '/api/GetCategory',
        desc: '获取分类列表（板块+话题）',
        auth: false,
        params: [],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "n_name": "技术交流",
      "n_type": 1,
      "n_icon": "/public/upload/icon.png",
      "n_sort": 0,
      "n_hotnum": 100
    }
  ],
  "total": 5
}`
    },
    {
        path: '/api/GetThreads',
        desc: '获取帖子列表，支持分页、筛选、搜索',
        auth: false,
        params: [
            { name: 'page', type: 'number', required: false, desc: '页码，默认1' },
            { name: 'pagesize', type: 'number', required: false, desc: '每页条数，默认10' },
            { name: 'cid', type: 'number', required: false, desc: '分类ID（板块）' },
            { name: 'cidt', type: 'number', required: false, desc: '话题ID' },
            { name: 'search', type: 'string', required: false, desc: '搜索关键词（模糊匹配标题）' },
            { name: 'uid', type: 'number', required: false, desc: '按用户ID筛选' },
            { name: 'image', type: 'number', required: false, desc: '筛选含图帖子（1=是）' },
            { name: 'video', type: 'number', required: false, desc: '筛选含视频帖子（1=是）' },
            { name: 'sort', type: 'string', required: false, desc: '排序字段，默认id' },
            { name: 'sortType', type: 'string', required: false, desc: '排序方向 asc/desc，默认desc' },
            { name: 'ismy', type: 'number', required: false, desc: '仅看自己（需Token，1=是）' },
            { name: 'isMyLike', type: 'number', required: false, desc: '仅看关注的人（需Token，1=是）' },
            { name: 'isMyBuy', type: 'number', required: false, desc: '仅看已购（需Token，1=是）' },
        ],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "n_name": "帖子标题",
      "n_uid": 3,
      "n_time": "2025-06-24T10:00:00.000Z",
      "n_html": "<p>帖子内容</p>",
      "n_read": 100,
      "n_starts": 5,
      "n_msgs": 3,
      "n_price": 0,
      "n_haveimage": 0,
      "n_havevideo": 0,
      "category": [
        { "id": 1, "n_name": "技术交流", "n_type": 1, "n_icon": "" }
      ]
    }
  ],
  "total": 50
}`
    },
    {
        path: '/api/GetThreads（传id）',
        desc: '获取单个帖子详情',
        auth: false,
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
        ],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "id": 1,
    "n_name": "帖子标题",
    "n_uid": 3,
    "n_time": "2025-06-24T10:00:00.000Z",
    "n_html": "<p>帖子内容</p>",
    "n_read": 100,
    "n_starts": 5,
    "n_msgs": 3,
    "n_price": 0,
    "n_permission": "0",
    "n_resources": [],
    "isLiked": false,
    "IsBuy": true,
    "user": {
      "id": 3,
      "n_nickname": "用户昵称",
      "n_avatar": "/public/upload/avatar.png",
      "n_password": ""
    },
    "category": [
      { "id": 1, "n_name": "技术交流", "n_type": 1, "n_icon": "" }
    ]
  },
  "total": 0
}`,
        errorExample: `{
  "code": 404,
  "msg": "帖子不存在",
  "data": {},
  "total": 0
}`
    },
    {
        path: '/api/GetComments',
        desc: '获取评论列表',
        auth: false,
        params: [
            { name: 'id', type: 'number', required: false, desc: '帖子ID（获取该帖评论）' },
            { name: 'uid', type: 'number', required: false, desc: '用户ID（获取该用户评论）' },
            { name: 'page', type: 'number', required: false, desc: '页码，默认1' },
            { name: 'pagesize', type: 'number', required: false, desc: '每页条数，默认10' },
        ],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "n_tid": 1,
      "n_uid": 3,
      "n_html": "评论内容",
      "n_cid": 0,
      "n_time": "2025-06-24T10:30:00.000Z",
      "user": {
        "id": 3,
        "n_nickname": "用户昵称",
        "n_avatar": "/public/upload/avatar.png"
      }
    }
  ],
  "total": 20
}`
    },
    {
        path: '/api/GetUser',
        desc: '获取用户详情',
        auth: false,
        params: [
            { name: 'id', type: 'string', required: true, desc: '用户ID，传"me"获取当前登录用户（需Token）' },
        ],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "id": 3,
    "n_nickname": "用户昵称",
    "n_avatar": "/public/upload/avatar.png",
    "n_signature": "个性签名",
    "n_points": 100,
    "n_balance": "0.00"
  },
  "total": 0
}`
    },
    {
        path: '/api/myinfo',
        desc: '获取当前登录用户完整信息',
        auth: true,
        params: [],
        response: `{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "id": 3,
    "n_nickname": "用户昵称",
    "n_avatar": "/public/upload/avatar.png",
    "n_signature": "个性签名",
    "n_points": 100,
    "n_balance": "0.00",
    "n_username": "21089086@qq.com",
    "VipInfo": {
      "n_name": "普通会员",
      "n_deft": "1"
    }
  },
  "total": 0
}`
    },
    {
        path: '/api/editinfo',
        desc: '修改当前用户信息',
        auth: true,
        params: [
            { name: 'n_nickname', type: 'string', required: false, desc: '昵称' },
            { name: 'n_signature', type: 'string', required: false, desc: '个性签名' },
            { name: 'n_avatar', type: 'string', required: false, desc: '头像URL' },
        ],
        response: `{
  "code": 200,
  "msg": "修改成功",
  "data": {},
  "total": 0
}`
    },
    {
        path: '/api/upload/image',
        desc: '上传图片，返回图片URL',
        auth: true,
        params: [
            { name: 'file', type: 'file', required: true, desc: '图片文件（multipart/form-data）' },
        ],
        response: `{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "path": "/public/upload/1719216000000_abc123.png",
    "url": "https://your-domain/public/upload/1719216000000_abc123.png",
    "uploadTime": "2025-06-24T10:00:00.000Z"
  },
  "total": 0
}`,
        errorExample: `{
  "code": 400,
  "msg": "不支持的文件格式，支持格式：png, jpg, jpeg, gif, webp",
  "data": {},
  "total": 0
}`
    },
    {
        path: '/api/upload/file',
        desc: '上传文件，返回文件URL',
        auth: true,
        params: [
            { name: 'file', type: 'file', required: true, desc: '文件（multipart/form-data）' },
        ],
        response: `{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "path": "/public/upload/1719216000000_doc.pdf",
    "url": "https://your-domain/public/upload/1719216000000_doc.pdf",
    "uploadTime": "2025-06-24T10:00:00.000Z"
  },
  "total": 0
}`
    },
    {
        path: '/api/AddThreads',
        desc: '发布帖子（需Token）',
        auth: true,
        params: [
            { name: 'n_name', type: 'string', required: true, desc: '帖子标题' },
            { name: 'n_html', type: 'string', required: true, desc: '帖子内容（HTML）' },
            { name: 'n_category', type: 'string', required: true, desc: '分类ID数组JSON，如 [1,2]' },
            { name: 'n_topic', type: 'string', required: true, desc: '话题ID数组JSON，如 []' },
            { name: 'n_price', type: 'number', required: false, desc: '付费价格（0=免费）' },
            { name: 'n_permission', type: 'string', required: false, desc: '"0"=所有人可见，"1"=仅关注者' },
            { name: 'n_profile', type: 'string', required: false, desc: '摘要' },
            { name: 'n_resources', type: 'string', required: false, desc: '资源列表JSON' },
            { name: 'n_haveimage', type: 'number', required: false, desc: '含图片标记（1=是）' },
            { name: 'n_havevideo', type: 'number', required: false, desc: '含视频标记（1=是）' },
        ],
        response: `{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "total": 0
}`
    },
    {
        path: '/api/LikeUser',
        desc: '关注/取消关注用户',
        auth: true,
        params: [
            { name: 'id', type: 'number', required: true, desc: '目标用户ID' },
        ],
        response: `{
  "code": 200,
  "msg": "关注成功",
  "data": {},
  "total": 0
}`
    },
]

const keyApis = [
    {
        path: '/v1/threads/add',
        scope: 'threads:write',
        desc: '发布新帖子',
        params: [
            { name: 'n_name', type: 'string', required: true, desc: '帖子标题' },
            { name: 'n_html', type: 'string', required: true, desc: '帖子内容（HTML）' },
            { name: 'n_category', type: 'string', required: true, desc: '分类ID数组JSON，如 [1,2]' },
            { name: 'n_topic', type: 'string', required: true, desc: '话题ID数组JSON，如 []' },
            { name: 'n_price', type: 'number', required: false, desc: '付费价格（0=免费，默认0）' },
            { name: 'n_permission', type: 'string', required: false, desc: '"0"=所有人可见，"1"=仅关注者' },
            { name: 'n_profile', type: 'string', required: false, desc: '摘要' },
            { name: 'n_resources', type: 'string', required: false, desc: '资源列表JSON' },
            { name: 'n_haveimage', type: 'number', required: false, desc: '含图片标记（1=是）' },
            { name: 'n_havevideo', type: 'number', required: false, desc: '含视频标记（1=是）' },
        ],
        response: `{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 403,
  "msg": "ApiKey缺少权限: threads:write",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/threads/add \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "n_name=我的帖子标题" \\
  -d "n_html=<p>帖子内容</p>" \\
  -d "n_category=[1]" \\
  -d "n_topic=[]" \\
  -d "n_price=0"`
    },
    {
        path: '/v1/threads/edit',
        scope: 'threads:write',
        desc: '编辑帖子（仅可编辑自己的帖子）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
            { name: 'n_name', type: 'string', required: false, desc: '新标题' },
            { name: 'n_html', type: 'string', required: false, desc: '新内容（HTML）' },
            { name: 'n_category', type: 'string', required: false, desc: '分类ID数组JSON' },
            { name: 'n_topic', type: 'string', required: false, desc: '话题ID数组JSON' },
            { name: 'n_price', type: 'number', required: false, desc: '付费价格' },
            { name: 'n_permission', type: 'string', required: false, desc: '可见性' },
            { name: 'n_profile', type: 'string', required: false, desc: '摘要' },
            { name: 'n_resources', type: 'string', required: false, desc: '资源列表JSON' },
            { name: 'n_haveimage', type: 'number', required: false, desc: '含图片标记' },
            { name: 'n_havevideo', type: 'number', required: false, desc: '含视频标记' },
        ],
        response: `{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 403,
  "msg": "无权限",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/threads/edit \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "id=123" \\
  -d "n_name=修改后的标题" \\
  -d "n_html=<p>修改后的内容</p>"`
    },
    {
        path: '/v1/threads/delete',
        scope: 'threads:delete',
        desc: '删除帖子（仅可删除自己的帖子，同时删除关联评论）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
        ],
        response: `{
  "code": 200,
  "msg": "删除成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 404,
  "msg": "帖子不存在",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/threads/delete \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "id=123"`
    },
    {
        path: '/v1/threads/like',
        scope: 'threads:like',
        desc: '点赞/取消点赞帖子（toggle，再次调用取消点赞）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
        ],
        response: `{
  "code": 200,
  "msg": "点赞成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 404,
  "msg": "帖子不存在",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/threads/like \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "id=123"`
    },
    {
        path: '/v1/threads/comment',
        scope: 'comments:write',
        desc: '发表评论',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
            { name: 'n_html', type: 'string', required: true, desc: '评论内容（HTML）' },
            { name: 'n_cid', type: 'number', required: false, desc: '回复的评论ID（楼中楼，0=主评论）' },
        ],
        response: `{
  "code": 200,
  "msg": "评论成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 400,
  "msg": "评论内容不能为空",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/threads/comment \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "id=123" \\
  -d "n_html=这是一条评论"`
    },
    {
        path: '/v1/comments/delete',
        scope: 'comments:delete',
        desc: '删除评论（仅可删除自己的评论）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '评论ID' },
        ],
        response: `{
  "code": 200,
  "msg": "删除成功",
  "data": {},
  "total": 0
}`,
        errorExample: `{
  "code": 403,
  "msg": "无权限",
  "data": {},
  "total": 0
}`,
        curlExample: `curl -X POST ${siteUrl}/v1/comments/delete \\
  -H "ApiKey: nak_your_api_key_here" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "id=456"`
    },
]
</script>

<style lang="scss" scoped>
.Page {
    width: calc(100% - 40px);
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    min-height: 400px;
}

.doc-section {
    margin-bottom: 32px;

    h2 {
        font-size: 20px;
        font-weight: 700;
        color: #1d1d1f;
        margin: 0 0 16px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #00b42a;
        display: inline-block;
    }

    h3 {
        font-size: 16px;
        font-weight: 600;
        color: #1d1d1f;
        margin: 20px 0 10px 0;
    }

    p {
        font-size: 14px;
        color: #4e5969;
        line-height: 1.8;
        margin: 8px 0;
    }

    ul {
        font-size: 14px;
        color: #4e5969;
        line-height: 2;
        padding-left: 20px;
        margin: 8px 0;
    }

    .tip {
        background: #e8ffea;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        color: #00884a;
        margin: 12px 0;
    }
}

code {
    background: #f2f3f5;
    color: #c7254e;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
}

.code-block {
    background: #1d1d1f;
    border-radius: 10px;
    padding: 16px;
    overflow-x: auto;
    margin: 10px 0;

    pre {
        color: #e5e6eb;
        font-size: 12px;
        line-height: 1.6;
        margin: 0;
        font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
        white-space: pre-wrap;
        word-break: break-all;
    }
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 10px 0;

    th, td {
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #e5e6eb;
    }

    th {
        background: #f7f8fa;
        color: #1d1d1f;
        font-weight: 600;
        white-space: nowrap;
    }

    td {
        color: #4e5969;
    }
}

.api-item {
    background: #f7f8fa;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid #e5e6eb;

    .api-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        flex-wrap: wrap;

        .api-method {
            background: #00b42a;
            color: #fff;
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
        }

        .api-path {
            font-size: 14px;
            font-weight: 600;
            color: #1d1d1f;
            font-family: 'SF Mono', 'Menlo', monospace;
        }

        .api-scope {
            font-size: 11px;
            color: #86868b;
            background: #fff;
            padding: 2px 8px;
            border-radius: 10px;
            border: 1px solid #e5e6eb;

            &.scope-auth {
                color: #ff7d00;
                border-color: #ff7d00;
            }

            &.scope-key {
                color: #00b42a;
                border-color: #00b42a;
            }
        }
    }

    .api-desc {
        font-size: 13px;
        color: #4e5969;
        margin: 0 0 12px 0;
    }

    .api-detail {
        margin-top: 12px;

        .detail-title {
            font-size: 12px;
            font-weight: 600;
            color: #86868b;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
}

@media (max-width: 768px) {
    .Page {
        width: calc(100% - 20px);
        padding: 10px;
    }

    table {
        font-size: 12px;

        th, td {
            padding: 6px 8px;
        }
    }

    .code-block pre {
        font-size: 11px;
    }
}
</style>
