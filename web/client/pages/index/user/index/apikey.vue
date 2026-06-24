<template>
    <div>
        <UserHeader title="API Key 管理"></UserHeader>
        <div class="Page">
            <!-- 创建新 Key -->
            <div class="create-section">
                <div class="section-header">
                    <h3>创建新密钥</h3>
                    <p class="section-desc">生成用于访问 REST API 的密钥，创建后仅显示一次完整密钥
                        <a class="doc-link" @click="navigateTo('/user/apikey/doc')">查看接口文档 →</a>
                    </p>
                </div>
                <div class="create-form">
                    <a-input v-model="createForm.n_name" placeholder="密钥名称，如：自动化脚本" class="form-input" />
                    <div class="form-row">
                        <div class="form-label">权限范围</div>
                        <a-spin v-if="scopesLoading" :size="16" />
                        <div v-else class="scope-grid">
                            <a-checkbox v-for="(label, scope) in scopeOptions" :key="scope"
                                v-model="scopeChecked[scope]">
                                {{ label }}
                            </a-checkbox>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-label">有效期</div>
                        <a-radio-group v-model="createForm.expireType" type="button" size="small">
                            <a-radio value="never">永久</a-radio>
                            <a-radio value="7d">7天</a-radio>
                            <a-radio value="30d">30天</a-radio>
                            <a-radio value="90d">90天</a-radio>
                            <a-radio value="custom">自定义</a-radio>
                        </a-radio-group>
                        <a-date-picker v-if="createForm.expireType === 'custom'" v-model="createForm.n_expires"
                            :disabled-date="(current) => current && current < new Date()"
                            style="margin-left: 10px; width: 180px;" />
                    </div>
                    <a-button type="primary" @click="createKey" :loading="createLoading" long>
                        生成密钥
                    </a-button>
                </div>
            </div>

            <!-- 新创建的 Key 提示 -->
            <a-modal v-model:visible="showKeyModal" :closable="false" :mask-closable="false" :footer="false"
                unmount-on-close>
                <div class="key-modal">
                    <div class="key-modal-icon">🔑</div>
                    <h3>密钥已创建</h3>
                    <p class="key-modal-warn">请立即复制保存，关闭后无法再次查看完整密钥</p>
                    <div class="key-modal-value">
                        <code>{{ newKeyValue }}</code>
                        <a-button size="mini" type="text" @click="copyKey">
                            <icon-copy />
                        </a-button>
                    </div>
                    <a-button type="primary" @click="showKeyModal = false" long>我已保存</a-button>
                </div>
            </a-modal>

            <!-- Key 列表 -->
            <div class="list-section">
                <div class="section-header">
                    <h3>我的密钥</h3>
                </div>

                <a-spin v-if="listLoading" :size="20" style="display: block; text-align: center; padding: 40px 0;" />

                <template v-else>
                    <div v-if="keyList.length > 0" class="key-list">
                        <div v-for="item in keyList" :key="item.id" class="key-item">
                            <div class="key-item-main">
                                <div class="key-item-top">
                                    <span class="key-name">{{ item.n_name }}</span>
                                    <span v-if="isExpired(item)" class="key-badge badge-expired">已过期</span>
                                    <span v-else-if="String(item.n_type) === '1'" class="key-badge badge-active">启用</span>
                                    <span v-else class="key-badge badge-disabled">禁用</span>
                                </div>
                                <div class="key-item-info">
                                    <code class="key-masked">{{ item.n_key_masked }}</code>
                                </div>
                                <div class="key-item-meta">
                                    <span v-if="item.n_expires" class="meta-item">
                                        过期: {{ formatDateTime(item.n_expires) }}
                                    </span>
                                    <span v-else class="meta-item">永久有效</span>
                                    <span v-if="item.n_scopes" class="meta-item">
                                        权限: {{ formatScopes(item.n_scopes) }}
                                    </span>
                                    <span class="meta-item">
                                        创建: {{ formatDate(item.n_time) }}
                                    </span>
                                    <span v-if="item.n_last_used_at" class="meta-item">
                                        最后使用: {{ formatDateTime(item.n_last_used_at) }}
                                    </span>
                                </div>
                            </div>
                            <div class="key-item-actions">
                                <a-button v-if="String(item.n_type) === '1' && !isExpired(item)" size="mini"
                                    type="text" @click="toggleKey(item)">禁用</a-button>
                                <a-button v-if="String(item.n_type) !== '1' && !isExpired(item)" size="mini"
                                    type="text" status="success" @click="toggleKey(item)">启用</a-button>
                                <a-popconfirm content="确认删除此密钥？删除后立即失效，不可恢复。" @ok="deleteKey(item.id)">
                                    <a-button size="mini" status="danger" type="text">删除</a-button>
                                </a-popconfirm>
                            </div>
                        </div>
                    </div>

                    <div v-else class="empty-state">
                        <div class="empty-icon">🗝️</div>
                        <p>暂无 API 密钥</p>
                    </div>
                </template>

                <a-pagination v-if="pagination.total > 0" @change="getKeyList" @page-size-change="getKeyList"
                    v-model:current="pagination.page" v-model:pageSize="pagination.pagesize" :total="pagination.total"
                    size="mini" show-total show-page-size :page-size-options="[10, 20, 50]" class="pagination" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue';

/* 权限范围选项 - 从服务端获取，formatScopes也用此数据 */
const scopeOptions = ref({})
const scopeChecked = ref({})
const scopesLoading = ref(false)

const initScopeOptions = async () => {
    scopesLoading.value = true
    try {
        const res = await useApiFetch().post('/api/getApiScopes')
        if (res.code === 200) {
            scopeOptions.value = res.data || {}
            /* 默认只勾选 threads:read */
            const checked = {}
            for (const key of Object.keys(res.data)) {
                checked[key] = key === 'threads:read'
            }
            scopeChecked.value = checked
        }
    } catch (e) {
        Message.error('获取权限范围失败')
    } finally {
        scopesLoading.value = false
    }
}
initScopeOptions()

/* 创建表单 */
const createForm = ref({
    n_name: '',
    expireType: 'never',
    n_expires: ''
})

const createLoading = ref(false)
const showKeyModal = ref(false)
const newKeyValue = ref('')

/* 计算过期时间 */
const getExpiresValue = () => {
    const type = createForm.value.expireType
    if (type === 'never') return ''
    if (type === 'custom') return createForm.value.n_expires || ''

    const now = new Date()
    const days = { '7d': 7, '30d': 30, '90d': 90 }
    now.setDate(now.getDate() + days[type])
    return now.toISOString().slice(0, 19).replace('T', ' ')
}

/* 创建 Key */
const createKey = async () => {
    if (!createForm.value.n_name.trim()) {
        return Message.warning('请输入密钥名称')
    }

    const selectedScopes = Object.entries(scopeChecked.value)
        .filter(([, checked]) => checked)
        .map(([scope]) => scope)

    if (selectedScopes.length === 0) {
        return Message.warning('请至少选择一个权限范围')
    }

    createLoading.value = true
    try {
        const res = await useApiFetch().post('/api/addApiKeys', {
            n_name: createForm.value.n_name.trim(),
            n_scopes: selectedScopes.join(','),
            n_expires: getExpiresValue() || undefined
        })
        if (res.code === 200) {
            newKeyValue.value = res.data.key
            showKeyModal.value = true
            /* 重置表单 */
            createForm.value.n_name = ''
            createForm.value.expireType = 'never'
            createForm.value.n_expires = ''
            /* 重置scope勾选为默认状态 */
            const checked = {}
            for (const key of Object.keys(scopeOptions.value)) {
                checked[key] = key === 'threads:read'
            }
            scopeChecked.value = checked
            /* 刷新列表 */
            getKeyList()
        } else {
            Message.error(res.message || '创建失败')
        }
    } catch (e) {
        Message.error('创建失败，请检查网络连接')
    } finally {
        createLoading.value = false
    }
}

/* 复制 Key */
const copyKey = async () => {
    try {
        await navigator.clipboard.writeText(newKeyValue.value)
        Message.success('已复制到剪贴板')
    } catch {
        /* 降级方案 */
        const textArea = document.createElement('textarea')
        textArea.value = newKeyValue.value
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (success) {
            Message.success('已复制到剪贴板')
        } else {
            Message.error('复制失败，请手动复制')
        }
    }
}

/* Key 列表 */
const keyList = ref([])
const listLoading = ref(false)
const pagination = ref({
    page: 1,
    pagesize: 10,
    total: 0
})

const getKeyList = async () => {
    listLoading.value = true
    try {
        const res = await useApiFetch().post('/api/getApiKeys', {
            page: pagination.value.page,
            pagesize: pagination.value.pagesize
        })
        if (res.code === 200) {
            keyList.value = res.data || []
            pagination.value.total = res.total || 0
        }
    } catch (e) {
        Message.error('获取密钥列表失败')
    } finally {
        listLoading.value = false
    }
}
getKeyList()

/* 启用/禁用 Key */
const toggleKey = async (item) => {
    const newType = String(item.n_type) === '1' ? '0' : '1'
    try {
        const res = await useApiFetch().post('/api/editApiKeys', {
            id: item.id,
            n_type: newType
        })
        if (res.code === 200) {
            Message.success(newType === '1' ? '已启用' : '已禁用')
            getKeyList()
        } else {
            Message.error(res.message || '操作失败')
        }
    } catch (e) {
        Message.error('操作失败，请检查网络连接')
    }
}

/* 删除 Key */
const deleteKey = async (id) => {
    try {
        const res = await useApiFetch().post('/api/deleApiKeys', { id })
        if (res.code === 200) {
            Message.success('删除成功')
            getKeyList()
        } else {
            Message.error(res.message || '删除失败')
        }
    } catch (e) {
        Message.error('删除失败，请检查网络连接')
    }
}

/* 工具函数 */
const isExpired = (item) => {
    if (!item.n_expires) return false
    return new Date(item.n_expires) <= new Date()
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

const formatScopes = (scopesStr) => {
    if (!scopesStr) return '-'
    return scopesStr.split(',').map(s => {
        const trimmed = s.trim()
        return scopeOptions.value[trimmed] || trimmed
    }).join('、')
}
</script>

<style lang="scss" scoped>
.Page {
    width: calc(100% - 40px);
    background-color: #fff;
    padding: 20px;
    border-radius: 20px;
    min-height: 400px;
}

.create-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;

    .section-header {
        margin-bottom: 16px;

        h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1d1d1f;
            margin: 0 0 4px 0;
        }

        .section-desc {
            font-size: 12px;
            color: #86868b;
            margin: 0;

            .doc-link {
                color: #00b42a;
                cursor: pointer;
                text-decoration: none;
                margin-left: 8px;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }

    .create-form {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .form-input {
            max-width: 360px;
        }

        .form-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            flex-wrap: wrap;

            .form-label {
                font-size: 13px;
                color: #4e5969;
                min-width: 60px;
                line-height: 28px;
                flex-shrink: 0;
            }

            .scope-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px 16px;
            }
        }
    }
}

.key-modal {
    text-align: center;
    padding: 10px 0;

    .key-modal-icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    h3 {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 8px 0;
    }

    .key-modal-warn {
        font-size: 13px;
        color: #ff7d00;
        margin: 0 0 16px 0;
    }

    .key-modal-value {
        background: #f7f8fa;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        word-break: break-all;

        code {
            font-size: 13px;
            color: #1d1d1f;
            font-family: 'SF Mono', 'Menlo', monospace;
        }
    }
}

.list-section {
    .section-header {
        margin-bottom: 16px;

        h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1d1d1f;
            margin: 0;
        }
    }
}

.key-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.key-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: #f7f8fa;
    border-radius: 12px;
    border: 1px solid #e5e6eb;
    transition: border-color 0.2s;

    &:hover {
        border-color: #00ce90;
    }

    .key-item-main {
        flex: 1;
        min-width: 0;

        .key-item-top {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;

            .key-name {
                font-size: 14px;
                font-weight: 600;
                color: #1d1d1f;
            }
        }

        .key-item-info {
            margin-bottom: 6px;

            .key-masked {
                font-size: 12px;
                color: #86868b;
                font-family: 'SF Mono', 'Menlo', monospace;
                background: #fff;
                padding: 2px 8px;
                border-radius: 4px;
            }
        }

        .key-item-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .meta-item {
                font-size: 11px;
                color: #a0a0a0;
            }
        }
    }

    .key-item-actions {
        flex-shrink: 0;
        margin-left: 12px;
        display: flex;
        gap: 4px;
    }
}

.key-badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;

    &.badge-active {
        background-color: #e8ffea;
        color: #00b42a;
    }

    &.badge-disabled {
        background-color: #f2f3f5;
        color: #c9cdd4;
    }

    &.badge-expired {
        background-color: #fff3e8;
        color: #ff7d00;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #86868b;

    .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    p {
        font-size: 14px;
        margin: 0;
    }
}

.pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

@media (max-width: 768px) {
    .Page {
        width: calc(100% - 20px);
        padding: 10px;
    }

    .create-section .create-form .form-row {
        flex-direction: column;

        .form-label {
            margin-bottom: 4px;
        }
    }

    .key-item {
        flex-direction: column;
        align-items: flex-start;

        .key-item-actions {
            margin-left: 0;
            margin-top: 8px;
        }
    }

    .key-item-meta {
        gap: 6px !important;
    }
}
</style>