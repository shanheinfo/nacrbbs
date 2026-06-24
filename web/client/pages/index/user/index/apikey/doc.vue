<template>
    <div>
        <UserHeader title="API Key 接口文档"></UserHeader>
        <div class="doc-layout">
            <!-- 侧边目录 -->
            <div class="doc-toc">
                <div class="toc-title">目录</div>
                <nav>
                    <a v-for="item in tocItems" :key="item.id"
                       :class="['toc-link', { 'toc-active': activeSection === item.id }]"
                       @click.prevent="scrollToSection(item.id)">
                        {{ item.label }}
                    </a>
                </nav>
            </div>
            <!-- 文档内容 -->
            <div class="doc-content">
                <div class="Page">

                    <div class="doc-section" id="sec-auth">
                        <h2>1. 认证方式</h2>
                        <p>API Key 接口通过 HTTP Header <code>ApiKey</code> 传递密钥进行鉴权，所有接口统一使用 <code>POST</code> 方式请求，<code>Content-Type</code> 为 <code>application/x-www-form-urlencoded</code>。</p>
                        <div class="code-block"><pre>POST /v1/threads/add HTTP/1.1
Host: your-domain
Content-Type: application/x-www-form-urlencoded
ApiKey: nak_your_api_key_here

n_name=帖子标题&n_html=内容&n_category=[1]&n_topic=[]</pre></div>
                        <p>API Key 创建后仅显示一次完整值，请立即复制保存。每个 Key 绑定权限范围，只能调用对应权限的接口。</p>
                    </div>

                    <div class="doc-section" id="sec-format">
                        <h2>2. 通用返回格式</h2>
                        <div class="code-block"><pre>{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "total": 0
}</pre></div>
                        <table>
                            <thead><tr><th>code</th><th>含义</th></tr></thead>
                            <tbody>
                                <tr><td><code>200</code></td><td>成功</td></tr>
                                <tr><td><code>400</code></td><td>参数错误</td></tr>
                                <tr><td><code>401</code></td><td>未授权（缺少ApiKey / Key无效 / Key已过期）</td></tr>
                                <tr><td><code>403</code></td><td>无权限（Key缺少对应Scope / 操作他人内容 / IP被封禁）</td></tr>
                                <tr><td><code>404</code></td><td>资源不存在</td></tr>
                                <tr><td><code>500</code></td><td>服务器内部错误</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="doc-section" id="sec-scopes">
                        <h2>3. 权限范围（Scopes）</h2>
                        <p>创建 API Key 时需勾选权限范围，每个接口对应一个 Scope：</p>
                        <table>
                            <thead><tr><th>Scope</th><th>说明</th><th>对应接口</th></tr></thead>
                            <tbody>
                                <tr><td><code>threads:write</code></td><td>发布/编辑帖子</td><td>/v1/threads/add, /v1/threads/edit</td></tr>
                                <tr><td><code>threads:delete</code></td><td>删除帖子</td><td>/v1/threads/delete</td></tr>
                                <tr><td><code>threads:like</code></td><td>点赞帖子</td><td>/v1/threads/like</td></tr>
                                <tr><td><code>comments:write</code></td><td>发表评论</td><td>/v1/threads/comment</td></tr>
                                <tr><td><code>comments:delete</code></td><td>删除评论</td><td>/v1/comments/delete</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="doc-section" id="sec-apis">
                        <h2>4. 接口详情</h2>

                        <div class="api-item" v-for="api in apis" :key="api.path">
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
                                <div class="detail-title">成功返回</div>
                                <div class="code-block"><pre>{{ api.response }}</pre></div>
                            </div>

                            <div class="api-detail" v-if="api.errorExample">
                                <div class="detail-title">错误返回</div>
                                <div class="code-block"><pre>{{ api.errorExample }}</pre></div>
                            </div>

                            <div class="api-detail">
                                <div class="detail-title">cURL 示例</div>
                                <div class="code-block"><pre>{{ api.curlExample }}</pre></div>
                            </div>
                        </div>
                    </div>

                    <div class="doc-section" id="sec-examples">
                        <h2>5. 更多示例</h2>

                        <h3>5.1 发布带分类的帖子</h3>
                        <div class="code-block"><pre>curl -X POST https://your-domain/v1/threads/add \
  -H "ApiKey: nak_your_api_key_here" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "n_name=我的帖子标题" \
  -d 'n_html=&lt;p&gt;帖子内容&lt;/p&gt;' \
  -d "n_category=[1,2]" \
  -d "n_topic=[]" \
  -d "n_price=0"</pre></div>

                        <h3>5.2 对帖子发表评论</h3>
                        <div class="code-block"><pre>curl -X POST https://your-domain/v1/threads/comment \
  -H "ApiKey: nak_your_api_key_here" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id=123" \
  -d "n_html=这是一条评论"</pre></div>

                        <h3>5.3 点赞帖子（再次调用取消点赞）</h3>
                        <div class="code-block"><pre>curl -X POST https://your-domain/v1/threads/like \
  -H "ApiKey: nak_your_api_key_here" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id=123"</pre></div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const siteUrl = 'https://your-domain'

const tocItems = [
    { id: 'sec-auth', label: '1. 认证方式' },
    { id: 'sec-format', label: '2. 返回格式' },
    { id: 'sec-scopes', label: '3. 权限范围' },
    { id: 'sec-apis', label: '4. 接口详情' },
    { id: 'sec-examples', label: '5. 更多示例' },
]

const activeSection = ref('sec-auth')

const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        activeSection.value = id
    }
}

onMounted(() => {
    if (!process.client) return
    const contentEl = document.querySelector('.doc-content')
    if (!contentEl) return
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                activeSection.value = entry.target.id
            }
        }
    }, { root: contentEl, rootMargin: '-60px 0px -80% 0px', threshold: 0 })
    tocItems.forEach(item => {
        const el = document.getElementById(item.id)
        if (el) observer.observe(el)
    })
    onBeforeUnmount(() => observer.disconnect())
})

const apis = [
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
  -d 'n_html=<p>帖子内容</p>' \\
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
  -d 'n_html=<p>修改后的内容</p>'`
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
.doc-layout {
    display: flex;
    gap: 20px;
    width: 100%;
    align-items: flex-start;
}

.doc-toc {
    width: 180px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 16px;
    padding: 16px 14px;
    border: 1px solid #e5e6eb;
    position: sticky;
    top: 80px;

    .toc-title {
        font-size: 14px;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 12px;
    }

    nav {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .toc-link {
        display: block;
        font-size: 13px;
        color: #86909c;
        text-decoration: none;
        padding: 6px 10px;
        border-radius: 8px;
        transition: all 0.2s;
        cursor: pointer;

        &:hover {
            color: #1d1d1f;
            background: #f7f8fa;
        }

        &.toc-active {
            color: #00b42a;
            background: #e8ffea;
            font-weight: 600;
        }
    }
}

.doc-content {
    flex: 1;
    min-width: 0;
}

.Page {
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
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
            padding: 2px 8px;
            border-radius: 10px;
            border: 1px solid;

            &.scope-key {
                color: #00b42a;
                border-color: #00b42a;
                background: #fff;
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
    .doc-layout {
        flex-direction: column;
    }

    .doc-toc {
        display: none;
    }

    .Page {
        padding: 10px;
    }

    table {
        font-size: 12px;
        th, td { padding: 6px 8px; }
    }

    .code-block pre {
        font-size: 11px;
    }
}
</style>
