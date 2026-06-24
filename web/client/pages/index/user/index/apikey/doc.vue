<template>
    <div>
        <UserHeader title="API 接口文档"></UserHeader>
        <div class="Page">
            <div class="doc-section">
                <h2>认证方式</h2>
                <p>所有 API Key 接口通过 HTTP Header <code>ApiKey</code> 传递密钥进行鉴权。</p>
                <div class="code-block">
                    <pre>ApiKey: nak_your_api_key_here</pre>
                </div>
            </div>

            <div class="doc-section">
                <h2>基础信息</h2>
                <table>
                    <thead>
                        <tr>
                            <th>项目</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Base URL</td>
                            <td><code>/v1</code></td>
                        </tr>
                        <tr>
                            <td>请求方式</td>
                            <td>POST</td>
                        </tr>
                        <tr>
                            <td>Content-Type</td>
                            <td><code>application/x-www-form-urlencoded</code></td>
                        </tr>
                        <tr>
                            <td>鉴权方式</td>
                            <td>Header <code>ApiKey</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="doc-section">
                <h2>权限范围</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Scope</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><code>threads:read</code></td><td>读取帖子</td></tr>
                        <tr><td><code>threads:write</code></td><td>发布/编辑帖子</td></tr>
                        <tr><td><code>threads:delete</code></td><td>删除帖子</td></tr>
                        <tr><td><code>threads:like</code></td><td>点赞帖子</td></tr>
                        <tr><td><code>comments:read</code></td><td>读取评论</td></tr>
                        <tr><td><code>comments:write</code></td><td>发表评论</td></tr>
                        <tr><td><code>comments:delete</code></td><td>删除评论</td></tr>
                        <tr><td><code>user:read</code></td><td>读取用户信息</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="doc-section">
                <h2>接口列表</h2>

                <div class="api-item" v-for="api in apis" :key="api.path">
                    <div class="api-header">
                        <span class="api-method">POST</span>
                        <span class="api-path">{{ api.path }}</span>
                        <span class="api-scope">需要 {{ api.scope }} 权限</span>
                    </div>
                    <p class="api-desc">{{ api.desc }}</p>

                    <div class="api-detail" v-if="api.params && api.params.length">
                        <div class="detail-title">请求参数</div>
                        <table>
                            <thead>
                                <tr><th>参数</th><th>类型</th><th>必填</th><th>说明</th></tr>
                            </thead>
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
                        <div class="detail-title">返回示例</div>
                        <div class="code-block">
                            <pre>{{ api.response }}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <div class="doc-section">
                <h2>通用返回格式</h2>
                <div class="code-block">
                    <pre>{
  "code": 200,        // 200=成功, 400=参数错误, 401=未授权, 403=无权限, 500=服务器错误
  "msg": "操作成功",
  "data": {},
  "total": 0
}</pre>
                </div>
            </div>

            <div class="doc-section">
                <h2>请求示例 (cURL)</h2>
                <div class="code-block">
                    <pre>curl -X POST https://your-domain/v1/threads/add \
  -H "ApiKey: nak_your_api_key_here" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "n_name=帖子标题&n_html=帖子内容&n_class=1"</pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const apis = [
    {
        path: '/v1/threads/add',
        scope: 'threads:write',
        desc: '发布新帖子',
        params: [
            { name: 'n_name', type: 'string', required: true, desc: '帖子标题' },
            { name: 'n_html', type: 'string', required: true, desc: '帖子内容(HTML)' },
            { name: 'n_class', type: 'number', required: true, desc: '分类ID' },
            { name: 'n_price', type: 'number', required: false, desc: '付费阅读价格(0=免费)' },
        ],
        response: `{
  "code": 200,
  "msg": "发布成功",
  "data": { "id": 123 }
}`
    },
    {
        path: '/v1/threads/edit',
        scope: 'threads:write',
        desc: '编辑帖子（仅可编辑自己的帖子）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
            { name: 'n_name', type: 'string', required: false, desc: '新标题' },
            { name: 'n_html', type: 'string', required: false, desc: '新内容' },
            { name: 'n_class', type: 'number', required: false, desc: '新分类ID' },
        ],
        response: `{
  "code": 200,
  "msg": "编辑成功"
}`
    },
    {
        path: '/v1/threads/delete',
        scope: 'threads:delete',
        desc: '删除帖子（仅可删除自己的帖子）',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
        ],
        response: `{
  "code": 200,
  "msg": "删除成功"
}`
    },
    {
        path: '/v1/threads/like',
        scope: 'threads:like',
        desc: '点赞/取消点赞帖子',
        params: [
            { name: 'id', type: 'number', required: true, desc: '帖子ID' },
        ],
        response: `{
  "code": 200,
  "msg": "操作成功"
}`
    },
    {
        path: '/v1/threads/comment',
        scope: 'comments:write',
        desc: '发表评论',
        params: [
            { name: 'n_tid', type: 'number', required: true, desc: '帖子ID' },
            { name: 'n_content', type: 'string', required: true, desc: '评论内容' },
            { name: 'n_pid', type: 'number', required: false, desc: '回复的评论ID(楼中楼)' },
        ],
        response: `{
  "code": 200,
  "msg": "评论成功",
  "data": { "id": 456 }
}`
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
  "msg": "删除成功"
}`
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
    max-width: 800px;
}

.doc-section {
    margin-bottom: 28px;

    h2 {
        font-size: 18px;
        font-weight: 700;
        color: #1d1d1f;
        margin: 0 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #00b42a;
        display: inline-block;
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
        font-size: 13px;
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
}
</style>
