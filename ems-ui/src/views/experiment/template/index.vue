<template>
  <div class="editor-page">
    <!-- 左侧工具栏 -->
    <div class="toolbar">
      <div class="toolbar-title">插入组件</div>
      <div class="component-list">
        <div class="component-section">
          <div class="section-title">内联元素</div>
          <button class="insert-btn" @click="insertInput">
            <span class="btn-icon">_</span>
            <span>填空</span>
          </button>
          <button class="insert-btn" @click="insertFormula">
            <span class="btn-icon">∑</span>
            <span>公式</span>
          </button>
        </div>
        <div class="component-section">
          <div class="section-title">块级元素</div>
          <div class="component-item" draggable="true" @dragstart="onDragStart($event, 'table')">
            <div class="component-icon">▦</div>
            <div class="component-name">表格</div>
          </div>
          <div class="component-item" draggable="true" @dragstart="onDragStart($event, 'divider')">
            <div class="component-icon">─</div>
            <div class="component-name">分割线</div>
          </div>
          <div class="component-item" draggable="true" @dragstart="onDragStart($event, 'image')">
            <div class="component-icon">🖼️</div>
            <div class="component-name">图片</div>
          </div>
        </div>
      </div>
      <div class="format-toolbar">
        <div class="toolbar-title">文本格式</div>
        <div class="format-buttons">
          <button class="format-btn" @click="formatText('bold')" title="加粗"><strong>B</strong></button>
          <button class="format-btn" @click="formatText('italic')" title="斜体"><em>I</em></button>
          <button class="format-btn" @click="formatText('strikeThrough')" title="删除线"><s>S</s></button>
          <button class="format-btn" @click="formatText('underline')" title="下划线"><u>U</u></button>
          <button class="format-btn" @click="formatText('removeFormat')" title="清除格式">✕</button>
        </div>
      </div>
      <div class="format-toolbar">
        <div class="toolbar-title">标题格式</div>
        <div class="format-buttons">
          <button class="format-btn heading-btn" @click="formatHeading(1)">H1</button>
          <button class="format-btn heading-btn" @click="formatHeading(2)">H2</button>
          <button class="format-btn heading-btn" @click="formatHeading(3)">H3</button>
          <button class="format-btn" @click="formatHeading(0)">P</button>
        </div>
      </div>
    </div>

    <!-- 中间画布区域 -->
    <div class="canvas-container">
      <div class="canvas-header">
        <el-input v-model="templateName" placeholder="请输入模板名称" class="title-input" />
        <div class="canvas-actions">
          <el-button @click="clearCanvas">清空画布</el-button>
          <el-button type="primary" @click="saveTemplate" :loading="saving">保存模板</el-button>
        </div>
      </div>
      <div class="description-area">
        <el-input v-model="description" type="textarea" :rows="2" placeholder="请输入模板描述（可选）" />
      </div>
      <div
        ref="canvasRef"
        class="canvas"
        contenteditable="true"
        @dragover.prevent
        @drop="onDrop"
        @input="onContentChange"
      ></div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="properties-panel">
      <div class="panel-title">属性配置</div>
      <div class="panel-content">
        <div v-if="!selectedElement" class="help-content">
          <h4>使用说明</h4>
          <ul>
            <li>直接在画布中输入文字</li>
            <li>点击「填空」插入填空项</li>
            <li>点击「公式」插入公式</li>
            <li>拖拽块级元素到画布</li>
            <li>点击元素可编辑属性</li>
          </ul>
        </div>
        <template v-else>
          <h3>{{ selectedElement.title }}</h3>
          <div class="properties-form">
            <!-- 填空属性 -->
            <template v-if="selectedElement.type === 'input'">
              <div class="form-group">
                <label>占位提示</label>
                <el-input v-model="selectedElement.placeholder" @input="updateElement" />
              </div>
            </template>
            <!-- 公式属性 -->
            <template v-else-if="selectedElement.type === 'formula'">
              <div class="form-group">
                <label>LaTeX 公式</label>
                <el-input v-model="selectedElement.formula" type="textarea" :rows="3" @input="updateElement" />
              </div>
            </template>
            <!-- 表格属性 -->
            <template v-else-if="selectedElement.type === 'table'">
              <div class="form-group">
                <label>行数</label>
                <el-input-number v-model="selectedElement.rows" :min="2" :max="20" @change="updateTableSize" />
              </div>
              <div class="form-group">
                <label>列数</label>
                <el-input-number v-model="selectedElement.cols" :min="1" :max="10" @change="updateTableSize" />
              </div>
            </template>
            <!-- 图片属性 -->
            <template v-else-if="selectedElement.type === 'image'">
              <div class="form-group">
                <label>图片描述</label>
                <el-input v-model="selectedElement.alt" @input="updateElement" />
              </div>
              <div class="form-group">
                <label>图片URL</label>
                <el-input v-model="selectedElement.url" placeholder="https://" @input="updateElement" />
              </div>
              <div class="form-group">
                <label>上传图片</label>
                <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*">
                  <el-button type="primary" size="small">选择图片</el-button>
                </el-upload>
              </div>
            </template>
            <div class="form-group">
              <el-button type="danger" @click="deleteElement">删除此组件</el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { post } from '@/utils/request'
import { getToken, getUserInfo } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const canvasRef = ref(null)
const selectedElement = ref(null)
const templateName = ref('')
const description = ref('')
const saving = ref(false)
const dragType = ref('')
const elementMap = new Map()

const templateId = route.params.id

// 初始化
onMounted(async () => {
  await nextTick()
  if (templateId) {
    await loadTemplate()
  } else {
    canvasRef.value.innerHTML = '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>'
  }
})

// 加载模板
const loadTemplate = async () => {
  try {
    const res = await post(`/experimentTemplate/get?templateId=${templateId}`, {})
    if (res.code === 200 && res.data) {
      templateName.value = res.data.templateName || ''
      description.value = res.data.description || ''
      // 将 Markdown 转为 HTML 显示
      const content = res.data.templateContent || ''
      canvasRef.value.innerHTML = markdownToHtml(content)
    }
  } catch (e) {
    ElMessage.error('加载模板失败')
  }
}

// 简单的 Markdown 转 HTML
const markdownToHtml = (md) => {
  if (!md) return '<p>在此输入内容...</p>'
  let html = md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
  return html
}

// 简单的 HTML 转 Markdown
const htmlToMarkdown = (html) => {
  if (!html) return ''
  const temp = document.createElement('div')
  temp.innerHTML = html
  let md = ''
  
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    
    const tag = node.tagName.toLowerCase()
    const children = Array.from(node.childNodes).map(processNode).join('')
    
    switch (tag) {
      case 'h1': return `# ${children}\n`
      case 'h2': return `## ${children}\n`
      case 'h3': return `### ${children}\n`
      case 'strong': case 'b': return `**${children}**`
      case 'em': case 'i': return `*${children}*`
      case 'p': case 'div': return `${children}\n`
      case 'br': return '\n'
      case 'span':
        // 检查是否是填空或公式
        if (node.classList.contains('inline-input')) {
          const placeholder = node.getAttribute('data-placeholder') || '请输入'
          return `[${placeholder}]`
        }
        if (node.classList.contains('inline-formula')) {
          const formula = node.getAttribute('data-formula') || ''
          return `$${formula}$`
        }
        return children
      default: return children
    }
  }
  
  Array.from(temp.childNodes).forEach(node => {
    md += processNode(node)
  })
  
  return md.trim()
}

// 插入填空
const insertInput = () => {
  const id = 'input-' + Date.now()
  const placeholder = '请输入'
  const html = `<span class="inline-input" data-id="${id}" contenteditable="false" data-placeholder="${placeholder">[${placeholder}]</span>`
  insertHtml(html)
  elementMap.set(id, { type: 'input', id, placeholder, title: '_ 填空' })
}

// 插入公式
const insertFormula = () => {
  const id = 'formula-' + Date.now()
  const formula = 'E=mc^2'
  const html = `<span class="inline-formula" data-id="${id}" contenteditable="false" data-formula="${formula}">$${formula}$</span>`
  insertHtml(html)
  elementMap.set(id, { type: 'formula', id, formula, title: '∑ 公式' })
}

// 插入 HTML
const insertHtml = (html) => {
  const canvas = canvasRef.value
  canvas.focus()
  const sel = window.getSelection()
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0)
    if (canvas.contains(range.commonAncestorContainer)) {
      range.deleteContents()
      const temp = document.createElement('div')
      temp.innerHTML = html
      range.insertNode(temp.firstChild)
      return
    }
  }
  canvas.insertAdjacentHTML('beforeend', html)
}

// 文本格式化
const formatText = (cmd) => {
  document.execCommand(cmd, false, null)
  canvasRef.value.focus()
}

const formatHeading = (level) => {
  document.execCommand('formatBlock', false, level === 0 ? 'p' : 'h' + level)
  canvasRef.value.focus()
}

// 清空画布
const clearCanvas = async () => {
  try {
    await ElMessageBox.confirm('确定要清空画布吗？', '提示', { type: 'warning' })
    canvasRef.value.innerHTML = '<p>在此输入内容...</p>'
    elementMap.clear()
    selectedElement.value = null
  } catch (e) {}
}

// 拖拽处理
const onDragStart = (e, type) => {
  dragType.value = type
  e.dataTransfer.effectAllowed = 'copy'
}

const onDrop = (e) => {
  e.preventDefault()
  const type = dragType.value
  if (!type) return

  const id = 'block-' + Date.now()
  let html = ''

  if (type === 'table') {
    elementMap.set(id, { type: 'table', id, rows: 3, cols: 3, cells: {}, title: '▦ 表格' })
    html = renderTable(id, 3, 3, {})
  } else if (type === 'divider') {
    elementMap.set(id, { type: 'divider', id, title: '─ 分割线' })
    html = `<div class="block-component" data-id="${id}" data-type="divider"><hr style="border-top: 2px solid #ddd; margin: 16px 0;"></div>`
  } else if (type === 'image') {
    elementMap.set(id, { type: 'image', id, url: '', alt: '', title: '🖼️ 图片' })
    html = `<div class="block-component" data-id="${id}" data-type="image"><div style="padding: 40px; background: #f5f5f5; text-align: center; color: #999; border-radius: 8px;">请上传图片或输入图片URL</div></div>`
  }

  canvasRef.value.insertAdjacentHTML('beforeend', html)
  // 确保后面有可编辑区域
  canvasRef.value.insertAdjacentHTML('beforeend', '<p><br></p>')
  dragType.value = ''
}

const renderTable = (id, rows, cols, cells) => {
  let html = `<div class="block-component" data-id="${id}" data-type="table"><table class="preview-table" style="width: 100%; border-collapse: collapse;">`
  for (let i = 0; i < rows; i++) {
    html += '<tr>'
    for (let j = 0; j < cols; j++) {
      const val = cells[`${i}-${j}`] || ''
      html += `<td contenteditable="true" data-row="${i}" data-col="${j}" style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">${val || '&nbsp;'}</td>`
    }
    html += '</tr>'
  }
  html += '</table></div>'
  return html
}

// 点击画布时检测选中元素
const onContentChange = () => {
  // 可以在这里添加自动保存逻辑
}

// 选择元素（点击时调用）
const selectElement = (el) => {
  const id = el.getAttribute('data-id')
  const type = el.getAttribute('data-type')
  if (id && elementMap.has(id)) {
    selectedElement.value = elementMap.get(id)
  }
}

// 更新元素
const updateElement = () => {
  if (!selectedElement.value) return
  const el = canvasRef.value.querySelector(`[data-id="${selectedElement.value.id}"]`)
  if (!el) return

  if (selectedElement.value.type === 'input') {
    el.textContent = `[${selectedElement.value.placeholder}]`
    el.setAttribute('data-placeholder', selectedElement.value.placeholder)
  } else if (selectedElement.value.type === 'formula') {
    el.textContent = `$${selectedElement.value.formula}$`
    el.setAttribute('data-formula', selectedElement.value.formula)
  } else if (selectedElement.value.type === 'image') {
    if (selectedElement.value.url) {
      el.innerHTML = `<img src="${selectedElement.value.url}" alt="${selectedElement.value.alt || ''}" style="max-width: 100%; border-radius: 8px;"><p style="text-align: center; color: #666; font-size: 12px;">${selectedElement.value.alt || ''}</p>`
    }
  }
}

// 更新表格大小
const updateTableSize = () => {
  if (!selectedElement.value || selectedElement.value.type !== 'table') return
  const el = canvasRef.value.querySelector(`[data-id="${selectedElement.value.id}"]`)
  if (!el) return
  
  const { rows, cols, cells } = selectedElement.value
  el.outerHTML = renderTable(selectedElement.value.id, rows, cols, cells)
}

// 删除元素
const deleteElement = () => {
  if (!selectedElement.value) return
  const el = canvasRef.value.querySelector(`[data-id="${selectedElement.value.id}"]`)
  if (el) el.remove()
  elementMap.delete(selectedElement.value.id)
  selectedElement.value = null
}

// 上传图片
const handleImageUpload = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await fetch('/api/file/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    }).then(r => r.json())
    if (res.code === 200 && res.data?.objectName) {
      selectedElement.value.url = `/api/file/access?objectName=${encodeURIComponent(res.data.objectName)}`
      updateElement()
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
  return false
}

// 保存模板
const saveTemplate = async () => {
  if (!templateName.value.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  saving.value = true
  try {
    const content = htmlToMarkdown(canvasRef.value.innerHTML)
    const userInfo = getUserInfo()
    const data = {
      id: templateId || null,
      templateName: templateName.value,
      description: description.value,
      templateContent: content,
      creatorId: userInfo?.id
    }

    const url = templateId ? '/experimentTemplate/update' : '/experimentTemplate/add'
    const res = await post(url, data)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      if (!templateId && res.data) {
        router.replace(`/experiment/template/${res.data}`)
      }
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e) {
    ElMessage.error('保存失败: ' + e.message)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #f0f2f5;
}

.toolbar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.toolbar-title {
  padding: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.component-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.component-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  color: #999;
  padding: 8px 4px;
}

.insert-btn {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.insert-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
  font-weight: 600;
}

.insert-btn:hover .btn-icon {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.component-item {
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: move;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.component-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.component-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
}

.component-item:hover .component-icon {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.format-toolbar {
  border-top: 1px solid #e8e8e8;
  padding: 12px;
}

.format-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.format-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.format-btn:hover {
  background: #667eea;
  color: #fff;
  border-color: #667eea;
}

.heading-btn {
  font-weight: bold;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.canvas-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-input {
  flex: 1;
  max-width: 400px;
}

.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
}

.canvas-actions {
  display: flex;
  gap: 8px;
}

.description-area {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.canvas {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  outline: none;
  line-height: 1.8;
  font-size: 15px;
}

.canvas:empty::before {
  content: '在此输入内容...';
  color: #999;
}

.canvas :deep(.inline-input) {
  display: inline-block;
  background: #e6f7ff;
  border: 1px dashed #1890ff;
  border-radius: 4px;
  padding: 2px 8px;
  margin: 0 2px;
  color: #1890ff;
}

.canvas :deep(.inline-formula) {
  display: inline-block;
  background: #fff7e6;
  border: 1px dashed #fa8c16;
  border-radius: 4px;
  padding: 2px 8px;
  margin: 0 2px;
  color: #fa8c16;
}

.canvas :deep(.block-component) {
  background: #fafafa;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin: 16px 0;
  padding: 12px;
}

.canvas :deep(.preview-table td) {
  min-width: 60px;
  min-height: 24px;
}

.properties-panel {
  width: 280px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.help-content {
  padding: 16px;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0e6fa 100%);
  border-radius: 8px;
}

.help-content h4 {
  margin: 0 0 12px;
  color: #4338ca;
}

.help-content ul {
  margin: 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  font-size: 13px;
  color: #4338ca;
}

.properties-form {
  margin-top: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}
</style>
