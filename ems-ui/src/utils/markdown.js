/**
 * Markdown 与 HTML 转换工具
 * 使用 markdown-it 和 turndown 实现
 */

import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,        // 允许 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true, // 优化排版
  breaks: true       // 转换换行符为 <br>
})

// 自定义规则：填空项 [placeholder]
// 匹配 [内容] 格式，转换为可编辑的填空组件
md.inline.ruler.before('emphasis', 'placeholder', function(state, silent) {
  const start = state.pos
  const max = state.posMax
  
  // 检查是否以 [ 开头
  if (state.src.charCodeAt(start) !== 0x5B /* [ */) {
    return false
  }
  
  // 查找匹配的 ]
  let pos = start + 1
  let found = false
  
  while (pos < max) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
      found = true
      break
    }
    pos++
  }
  
  if (!found) {
    return false
  }
  
  // 提取内容
  const content = state.src.slice(start + 1, pos)
  
  // 跳过空内容
  if (!content.trim()) {
    return false
  }
  
  // 检查是否是链接格式 [text](url)，如果是则跳过
  if (pos + 1 < max && state.src.charCodeAt(pos + 1) === 0x28 /* ( */) {
    return false
  }
  
  if (!silent) {
    const token = state.push('placeholder', 'span', 0)
    token.content = content
    token.attrSet('class', 'inline-input')
    token.attrSet('data-placeholder', content)
  }
  
  state.pos = pos + 1
  return true
})

// 渲染 placeholder token
md.renderer.rules.placeholder = function(tokens, idx) {
  const content = tokens[idx].content
  return `<span class="inline-input" data-placeholder="${md.utils.escapeHtml(content)}">[${md.utils.escapeHtml(content)}]</span>`
}

// 自定义规则：公式 $formula$
// 匹配 $内容$ 格式，转换为公式组件
md.inline.ruler.before('emphasis', 'formula', function(state, silent) {
  const start = state.pos
  const max = state.posMax
  
  // 检查是否以 $ 开头
  if (state.src.charCodeAt(start) !== 0x24 /* $ */) {
    return false
  }
  
  // 查找匹配的 $
  let pos = start + 1
  let found = false
  
  while (pos < max) {
    if (state.src.charCodeAt(pos) === 0x24 /* $ */) {
      // 确保不是 $$ (块级公式)
      if (pos + 1 < max && state.src.charCodeAt(pos + 1) === 0x24) {
        pos++
        continue
      }
      found = true
      break
    }
    pos++
  }
  
  if (!found) {
    return false
  }
  
  // 提取内容
  const content = state.src.slice(start + 1, pos)
  
  // 跳过空内容
  if (!content.trim()) {
    return false
  }
  
  if (!silent) {
    const token = state.push('formula', 'span', 0)
    token.content = content
    token.attrSet('class', 'inline-formula')
  }
  
  state.pos = pos + 1
  return true
})

// 渲染 formula token
md.renderer.rules.formula = function(tokens, idx) {
  const content = tokens[idx].content
  return `<span class="inline-formula">$${md.utils.escapeHtml(content)}$</span>`
}

/**
 * Markdown 转 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} HTML 文本
 */
export function markdownToHtml(markdown) {
  if (!markdown) {
    return '<p>在此输入内容...</p>'
  }
  return md.render(markdown)
}

// 创建 Turndown 实例用于 HTML → Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',    // 使用 # 标题
  codeBlockStyle: 'fenced', // 使用 ``` 代码块
  bulletListMarker: '-',   // 无序列表使用 -
  br: '\n'                 // <br> 转换为换行
})

// 自定义规则：填空项 span.inline-input → [placeholder]
turndownService.addRule('inlineInput', {
  filter: function(node) {
    return node.nodeName === 'SPAN' && node.classList.contains('inline-input')
  },
  replacement: function(content, node) {
    const placeholder = node.getAttribute('data-placeholder') || content.replace(/[\[\]]/g, '').trim()
    return `[${placeholder}]`
  }
})

// 自定义规则：公式 span.inline-formula → $formula$
turndownService.addRule('inlineFormula', {
  filter: function(node) {
    return node.nodeName === 'SPAN' && node.classList.contains('inline-formula')
  },
  replacement: function(content, node) {
    // 移除可能的 $ 符号
    const formula = content.replace(/\$/g, '').trim()
    return `$${formula}$`
  }
})

// 自定义规则：保留表格格式
turndownService.addRule('table', {
  filter: 'table',
  replacement: function(content, node) {
    const rows = []
    const thead = node.querySelector('thead')
    const tbody = node.querySelector('tbody')
    
    // 处理表头
    if (thead) {
      const headerCells = thead.querySelectorAll('th')
      const headers = Array.from(headerCells).map(th => th.textContent.trim())
      rows.push(`| ${headers.join(' | ')} |`)
      rows.push(`| ${headers.map(() => '----').join(' | ')} |`)
    }
    
    // 处理表体
    if (tbody) {
      const bodyRows = tbody.querySelectorAll('tr')
      bodyRows.forEach(tr => {
        const cells = tr.querySelectorAll('td')
        const cellContents = Array.from(cells).map(td => td.textContent.trim())
        rows.push(`| ${cellContents.join(' | ')} |`)
      })
    }
    
    return rows.join('\n') + '\n'
  }
})

// 忽略 thead, tbody, tr, td, th 标签（由 table 规则统一处理）
turndownService.addRule('tableElements', {
  filter: ['thead', 'tbody', 'tr', 'td', 'th'],
  replacement: function(content) {
    return content
  }
})

/**
 * HTML 转 Markdown
 * @param {string} html - HTML 文本
 * @returns {string} Markdown 文本
 */
export function htmlToMarkdown(html) {
  if (!html) {
    return ''
  }
  return turndownService.turndown(html)
}

export default {
  markdownToHtml,
  htmlToMarkdown,
  md, // 导出 markdown-it 实例供高级用法
  turndownService // 导出 turndown 实例供高级用法
}
