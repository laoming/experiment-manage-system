// 实验模板编辑器
let currentTemplateId = null;
let selectedElement = null;

const app = Vue.createApp({
    mounted() {
        this.checkLogin();
        initCanvas();
        initDragDrop();

        // 从 TabsManager 获取当前标签页的参数（嵌入页面时 window.location.search 不可用）
        let templateId = null;
        if (typeof TabsManager !== 'undefined') {
            const params = TabsManager.getCurrentTabParams();
            if (params) {
                templateId = params.get('templateId');
            }
        }
        
        // 如果 TabsManager 没有获取到，尝试从 URL 获取（直接访问时）
        if (!templateId) {
            const urlParams = new URLSearchParams(window.location.search);
            templateId = urlParams.get('templateId');
        }
        
        if (templateId) {
            loadTemplate(templateId);
        }
    },
    methods: {
        checkLogin() {
            try {
                const token = Auth.getToken();
            if (!token) {
                window.location.href = '/ems/common/pages/index.html';
                return;
            }
        } catch (error) {
            console.error('[TEMPLATE] 检查登录状态失败:', error);
            window.location.href = '/ems/common/pages/index.html';
        }

        }
    }
});

app.component('header-component', HeaderComponent);
app.mount('#app');

// 组件类型定义（仅块级元素）
const blockComponentTypes = {
    table: {
        name: '表格',
        icon: '▦',
        fields: [
            { type: 'input', name: 'rows', label: '行数', min: 2 },
            { type: 'input', name: 'cols', label: '列数', min: 1 }
        ]
    },
    divider: {
        name: '分割线',
        icon: '─',
        fields: []
    },
    image: {
        name: '图片',
        icon: '🖼️',
        fields: [
            { type: 'textarea', name: 'url', label: '图片URL' },
            { type: 'input', name: 'alt', label: '图片描述' },
            { type: 'select', name: 'size', label: '尺寸', options: ['small', 'medium', 'large'] }
        ]
    }
};

// 初始化画布
function initCanvas() {
    const canvas = document.getElementById('canvas');
    
    // 点击画布时清除选中状态
    canvas.addEventListener('click', (e) => {
        if (e.target === canvas) {
            clearSelection();
        }
    });

    // 点击元素时选中
    canvas.addEventListener('click', (e) => {
        const target = e.target.closest('.inline-input, .inline-formula, .block-component');
        if (target) {
            e.stopPropagation();
            selectElement(target);
        }
    });

    // 监听键盘删除（仅支持Delete键删除块级组件，不支持Backspace）
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && selectedElement) {
            // 检查是否选中了块级组件
            if (selectedElement.classList.contains('block-component')) {
                // 检查当前焦点是否在表格单元格内
                const activeElement = document.activeElement;
                const isInTableCell = activeElement && activeElement.tagName === 'TD';
                
                // 如果焦点不在表格单元格内，才允许删除整个组件
                if (!isInTableCell) {
                    e.preventDefault();
                    e.stopPropagation();
                    selectedElement.remove();
                    clearSelection();
                    triggerContentChange();
                }
            }
        }
    });
}

// 初始化拖拽功能
function initDragDrop() {
    const componentItems = document.querySelectorAll('.component-item');
    const canvas = document.getElementById('canvas');

    componentItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', item.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        canvas.classList.add('drag-over');
    });

    canvas.addEventListener('dragleave', () => {
        canvas.classList.remove('drag-over');
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        canvas.classList.remove('drag-over');
        const type = e.dataTransfer.getData('type');
        if (type && blockComponentTypes[type]) {
            // 获取拖放位置
            const range = getCaretRangeFromPoint(e.clientX, e.clientY);
            if (range) {
                // 在拖放位置插入组件
                insertBlockComponentAtRange(type, range);
            } else {
                // 如果无法获取位置，插入到末尾
                insertBlockComponent(type);
            }
        }
    });
}

// 根据鼠标位置获取选区
function getCaretRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
        // Chrome, Safari
        return document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
        // Firefox
        const position = document.caretPositionFromPoint(x, y);
        const range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
        return range;
    }
    return null;
}

// 插入填空
window.insertInput = function() {
    const placeholder = '请输入';
    const html = `<span class="inline-input" contenteditable="false" data-placeholder="${placeholder}">
        <span class="input-marker">[</span>
        <span class="input-content">${placeholder}</span>
        <span class="input-marker">]</span>
    </span>`;
    insertAtCursor(html);
    triggerContentChange();
};

// 插入公式
window.insertFormula = function() {
    const formula = 'E=mc^2';
    const html = `<span class="inline-formula" contenteditable="false" data-formula="${formula}">
        <span class="formula-display">$${formula}$</span>
    </span>`;
    insertAtCursor(html);
    triggerContentChange();
    // 触发 MathJax 渲染
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
};

// 在光标位置插入 HTML
function insertAtCursor(html) {
    const canvas = document.getElementById('canvas');
    canvas.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (canvas.contains(range.commonAncestorContainer)) {
            range.deleteContents();
            const temp = document.createElement('div');
            temp.innerHTML = html;
            const frag = document.createDocumentFragment();
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            range.insertNode(frag);
            // 移动光标到插入内容之后
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
        }
    }
    
    // 如果没有有效选区，追加到末尾
    canvas.insertAdjacentHTML('beforeend', html);
}

// 文本格式化功能
// 加粗
window.formatBold = function() {
    document.execCommand('bold', false, null);
    document.getElementById('canvas').focus();
};

// 斜体
window.formatItalic = function() {
    document.execCommand('italic', false, null);
    document.getElementById('canvas').focus();
};

// 删除线
window.formatStrikethrough = function() {
    document.execCommand('strikeThrough', false, null);
    document.getElementById('canvas').focus();
};

// 下划线
window.formatUnderline = function() {
    document.execCommand('underline', false, null);
    document.getElementById('canvas').focus();
};

// 清除格式
window.formatClear = function() {
    document.execCommand('removeFormat', false, null);
    document.getElementById('canvas').focus();
};

// 标题格式化
window.formatHeading = function(level) {
    var canvas = document.getElementById('canvas');
    canvas.focus();
    
    if (level === 0) {
        // 普通文本
        document.execCommand('formatBlock', false, 'p');
    } else {
        // H1-H6 标题
        document.execCommand('formatBlock', false, 'h' + level);
    }
};

// 插入块级组件
function insertBlockComponent(type) {
    const canvas = document.getElementById('canvas');
    const typeConfig = blockComponentTypes[type];
    
    // 创建组件容器
    const component = document.createElement('div');
    component.className = 'block-component';
    component.setAttribute('contenteditable', 'false');
    component.setAttribute('data-type', type);
    component.setAttribute('data-id', Date.now().toString());
    
    // 初始化默认数据
    var data = {};
    if (type === 'table') {
        data = {
            rows: '2',
            cols: '3'
        };
    }
    typeConfig.fields.forEach(function(field) {
        if (field.type === 'select' && field.options) {
            data[field.name] = field.options[0];
        } else if (field.type === 'input' && field.min !== undefined) {
            data[field.name] = field.min.toString();
        } else {
            data[field.name] = '';
        }
    });
    component.setAttribute('data-props', JSON.stringify(data));
    
    // 渲染组件
    component.innerHTML = '<div class="component-body">' + renderBlockComponentPreview(type, data) + '</div>';
    
    // 尝试在当前光标位置插入
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (canvas.contains(range.commonAncestorContainer)) {
            // 在光标位置插入
            range.deleteContents();
            
            // 确保在块级组件后面有可编辑的内容
            const afterNode = document.createElement('p');
            afterNode.innerHTML = '<br>';
            
            range.insertNode(afterNode);
            range.setStartBefore(afterNode);
            range.insertNode(component);
            
            // 移动光标到组件后面
            range.setStartAfter(component);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            
            selectElement(component);
            triggerContentChange();
            return;
        }
    }
    
    // 如果没有有效选区，追加到末尾
    canvas.appendChild(component);
    // 确保在块级组件后面有可编辑的内容
    const afterNode = document.createElement('p');
    afterNode.innerHTML = '<br>';
    canvas.appendChild(afterNode);
    
    selectElement(component);
    triggerContentChange();
}

// 在指定位置插入块级组件
function insertBlockComponentAtRange(type, range) {
    const canvas = document.getElementById('canvas');
    const typeConfig = blockComponentTypes[type];
    
    // 创建组件容器
    const component = document.createElement('div');
    component.className = 'block-component';
    component.setAttribute('contenteditable', 'false');
    component.setAttribute('data-type', type);
    component.setAttribute('data-id', Date.now().toString());
    
    // 初始化默认数据
    var data = {};
    if (type === 'table') {
        data = {
            rows: '2',
            cols: '3'
        };
    }
    typeConfig.fields.forEach(function(field) {
        if (field.type === 'select' && field.options) {
            data[field.name] = field.options[0];
        } else if (field.type === 'input' && field.min !== undefined) {
            data[field.name] = field.min.toString();
        } else {
            data[field.name] = '';
        }
    });
    component.setAttribute('data-props', JSON.stringify(data));
    
    // 渲染组件
    component.innerHTML = '<div class="component-body">' + renderBlockComponentPreview(type, data) + '</div>';
    
    // 在指定位置插入
    range.deleteContents();
    
    // 确保在块级组件后面有可编辑的内容
    const afterNode = document.createElement('p');
    afterNode.innerHTML = '<br>';
    
    range.insertNode(afterNode);
    range.setStartBefore(afterNode);
    range.insertNode(component);
    
    // 移动光标到组件后面
    range.setStartAfter(component);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    selectElement(component);
    triggerContentChange();
}

// 渲染块级组件预览
function renderBlockComponentPreview(type, data) {
    switch (type) {
        case 'table':
            const rows = parseInt(data.rows) || 2;
            const cols = parseInt(data.cols) || 3;
            const cells = data.cells || {};
            
            let tableHtml = '<table class="preview-table">';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    const cellKey = i + '-' + j;
                    const cellValue = cells[cellKey] || '';
                    // 第一行是表头，添加 data-cell-type="header"
                    const cellType = i === 0 ? 'header' : 'content';
                    tableHtml += '<td contenteditable="true" data-row="' + i + '" data-col="' + j + '" data-cell-type="' + cellType + '" onblur="updateTableCell(this)">' + cellValue + '</td>';
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table>';
            return tableHtml;
        case 'divider':
            return '<div class="preview-divider"></div>';
        case 'image':
            const size = data.size || 'medium';
            if (data.url) {
                return '<div class="preview-image img-' + size + '"><img src="' + data.url + '" alt="' + (data.alt || '') + '"></div>';
            }
            return '<div class="preview-image-placeholder img-' + size + '">点击设置图片</div>';
        default:
            return '';
    }
}

// 选中元素
function selectElement(element) {
    clearSelection();
    selectedElement = element;
    element.classList.add('selected');
    renderPropertiesPanel(element);
}

// 清除选中
window.clearSelection = function() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
    renderDefaultPanel();
};

// 渲染属性面板
function renderPropertiesPanel(element) {
    const panel = document.getElementById('propertiesContent');
    
    if (element.classList.contains('inline-input')) {
        const placeholder = element.getAttribute('data-placeholder') || '请输入';
        panel.innerHTML = `
            <h3>_ 填空</h3>
            <div class="properties-form">
                <div class="form-group">
                    <label class="form-label">占位提示</label>
                    <input type="text" class="form-input" value="${placeholder}" 
                        oninput="updateInputPlaceholder(this.value)">
                </div>
                <div class="form-group">
                    <button class="btn btn-delete-full" onclick="deleteSelectedElement()">删除此填空</button>
                </div>
            </div>
        `;
    } else if (element.classList.contains('inline-formula')) {
        const formula = element.getAttribute('data-formula') || '';
        panel.innerHTML = `
            <h3>∑ 公式</h3>
            <div class="properties-form">
                <div class="form-group">
                    <label class="form-label">LaTeX 公式</label>
                    <textarea class="form-textarea" oninput="updateFormula(this.value)">${formula}</textarea>
                </div>
                <div class="form-group">
                    <button class="btn btn-delete-full" onclick="deleteSelectedElement()">删除此公式</button>
                </div>
            </div>
        `;
    } else if (element.classList.contains('block-component')) {
        const type = element.getAttribute('data-type');
        const typeConfig = blockComponentTypes[type];
        const data = JSON.parse(element.getAttribute('data-props') || '{}');
        
        let html = '<h3>' + typeConfig.icon + ' ' + typeConfig.name + '</h3>';
        html += '<div class="properties-form">';
        
        typeConfig.fields.forEach(field => {
            const value = data[field.name] || '';
            html += '<div class="form-group">';
            html += '<label class="form-label">' + field.label + '</label>';
            
            switch (field.type) {
                case 'input':
                    // 如果有最小值限制，使用 number 类型输入框
                    if (field.min !== undefined) {
                        html += '<input type="number" class="form-input" name="' + field.name + '" value="' + value + '" min="' + field.min + '" oninput="updateBlockComponent(\'' + field.name + '\', this.value)">';
                    } else {
                        html += '<input type="text" class="form-input" value="' + value + '" oninput="updateBlockComponent(\'' + field.name + '\', this.value)">';
                    }
                    break;
                case 'textarea':
                    html += '<textarea class="form-textarea" oninput="updateBlockComponent(\'' + field.name + '\', this.value)">' + value + '</textarea>';
                    break;
                case 'select':
                    html += '<select class="form-select" onchange="updateBlockComponent(\'' + field.name + '\', this.value)">';
                    field.options.forEach(opt => {
                        const selected = value === opt ? 'selected' : '';
                        html += '<option value="' + opt + '" ' + selected + '>' + opt + '</option>';
                    });
                    html += '</select>';
                    break;
            }
            
            html += '</div>';
        });
        
        html += `<div class="form-group">
            <button class="btn btn-delete-full" onclick="deleteSelectedElement()">删除此组件</button>
        </div>`;
        html += '</div>';
        
        panel.innerHTML = html;
    }
}

// 渲染默认面板
function renderDefaultPanel() {
    const panel = document.getElementById('propertiesContent');
    panel.innerHTML = `
        <div class="help-content">
            <h4>使用说明</h4>
            <ul>
                <li>直接在画布中输入文字</li>
                <li>点击「填空」按钮插入填空项</li>
                <li>点击「公式」按钮插入公式</li>
                <li>拖拽块级元素到画布</li>
                <li>点击元素可编辑其属性</li>
            </ul>
        </div>
    `;
}

// 更新填空占位符
window.updateInputPlaceholder = function(value) {
    if (selectedElement && selectedElement.classList.contains('inline-input')) {
        selectedElement.setAttribute('data-placeholder', value);
        selectedElement.querySelector('.input-content').textContent = value;
    }
};

// 更新公式
window.updateFormula = function(value) {
    if (selectedElement && selectedElement.classList.contains('inline-formula')) {
        selectedElement.setAttribute('data-formula', value);
        selectedElement.querySelector('.formula-display').textContent = `$${value}$`;
        if (window.MathJax) {
            MathJax.typesetPromise([selectedElement]);
        }
    }
};

// 更新块级组件属性
window.updateBlockComponent = function(fieldName, value) {
    if (selectedElement && selectedElement.classList.contains('block-component')) {
        const type = selectedElement.getAttribute('data-type');
        const typeConfig = blockComponentTypes[type];
        const data = JSON.parse(selectedElement.getAttribute('data-props') || '{}');
        
        // 查找字段配置
        const field = typeConfig.fields.find(f => f.name === fieldName);
        
        // 验证最小值
        if (field && field.min !== undefined) {
            const numValue = parseInt(value) || 0;
            if (numValue < field.min) {
                value = field.min.toString();
                // 更新输入框的值
                const input = document.querySelector('.properties-form input[name="' + fieldName + '"]');
                if (input) {
                    input.value = value;
                }
            }
        }
        
        data[fieldName] = value;
        selectedElement.setAttribute('data-props', JSON.stringify(data));
        
        const body = selectedElement.querySelector('.component-body');
        body.innerHTML = renderBlockComponentPreview(type, data);
    }
};

// 更新表格单元格内容
window.updateTableCell = function(cell) {
    var component = cell.closest('.block-component');
    if (!component) return;
    
    var data = JSON.parse(component.getAttribute('data-props') || '{}');
    if (!data.cells) {
        data.cells = {};
    }
    
    var row = cell.getAttribute('data-row');
    var col = cell.getAttribute('data-col');
    var cellKey = row + '-' + col;
    
    data.cells[cellKey] = cell.textContent;
    component.setAttribute('data-props', JSON.stringify(data));
};

// 删除选中元素
window.deleteSelectedElement = function() {
    if (selectedElement) {
        selectedElement.remove();
        clearSelection();
        triggerContentChange();
    }
};

// 触发内容变化
function triggerContentChange() {
    // 可以在这里添加自动保存等逻辑
}

// 清空画布
window.clearCanvas = function() {
    if (confirm('确定要清空画布吗？')) {
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>';
        clearSelection();
    }
};

// 预览模板
window.previewTemplate = function() {
    const canvas = document.getElementById('canvas');
    const content = getTemplateContent();
    
    const previewWindow = window.open('', '_blank');
    let previewContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模板预览</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .component {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        .inline-input-display {
            display: inline-block;
            border-bottom: 1px solid #333;
            min-width: 80px;
            margin: 0 4px;
            padding: 2px 8px;
            background: #f9f9f9;
        }
        .inline-formula-display {
            margin: 0 4px;
        }
    </style>
</head>
<body>
    <h1>${document.getElementById('templateName').value}</h1>
    <p>${document.getElementById('templateDescription').value || ''}</p>
    <hr>
    <div class="component">
        ${renderPreviewContent(canvas)}
    </div>
</body>
</html>`;
    
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
};

// 渲染预览内容
function renderPreviewContent(canvas) {
    let html = canvas.innerHTML;
    
    // 替换填空元素
    html = html.replace(/<span class="inline-input"[^>]*data-placeholder="([^"]*)"[^>]*>[\s\S]*?<\/span>/g, 
        '<span class="inline-input-display">[$1]</span>');
    
    // 替换公式元素
    html = html.replace(/<span class="inline-formula"[^>]*data-formula="([^"]*)"[^>]*>[\s\S]*?<\/span>/g,
        '<span class="inline-formula-display">\\($1\\)</span>');
    
    // 替换块级组件
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    tempDiv.querySelectorAll('.block-component').forEach(comp => {
        const type = comp.getAttribute('data-type');
        const data = JSON.parse(comp.getAttribute('data-props') || '{}');
        const previewHtml = renderBlockPreview(type, data);
        comp.outerHTML = previewHtml;
    });
    
    // 移除 contenteditable 等属性
    tempDiv.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
    });
    
    return tempDiv.innerHTML;
}

// 渲染块级组件预览（预览窗口用）
function renderBlockPreview(type, data) {
    switch (type) {
        case 'table':
            const rows = parseInt(data.rows) || 3;
            const cols = parseInt(data.cols) || 3;
            const cells = data.cells || {};
            const tableName = data.tableName || '';
            let tableHtml = '';
            if (tableName) {
                tableHtml += `<div style="font-weight: bold; margin-bottom: 8px;">${tableName}</div>`;
            }
            tableHtml += '<table border="1" style="width:100%; margin: 10px 0; border-collapse: collapse;">';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    const cellKey = `${i}-${j}`;
                    const cellValue = cells[cellKey] || '&nbsp;';
                    tableHtml += `<td style="padding: 8px; border: 1px solid #ddd;">${cellValue}</td>`;
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table>';
            return tableHtml;
        case 'divider':
            return `<hr style="border: 2px ${data.style || 'solid'} ${data.color || '#ddd'}; margin: 20px 0;">`;
        case 'image':
            if (data.url) {
                return `<div style="text-align: center; margin: 10px 0;">
                    <img src="${data.url}" alt="${data.alt || ''}" style="max-width: 100%;">
                    ${data.alt ? `<p style="font-size: 12px; color: #666;">${data.alt}</p>` : ''}
                </div>`;
            }
            return '<p style="color: #999;">[图片位置]</p>';
        default:
            return '';
    }
}

// 获取模板内容（用于保存）
function getTemplateContent() {
    const canvas = document.getElementById('canvas');
    
    // 提取所有内容，包括文本和组件
    const content = {
        html: canvas.innerHTML,
        elements: []
    };
    
    // 提取内联元素数据
    canvas.querySelectorAll('.inline-input').forEach(el => {
        content.elements.push({
            type: 'input',
            placeholder: el.getAttribute('data-placeholder')
        });
    });
    
    canvas.querySelectorAll('.inline-formula').forEach(el => {
        content.elements.push({
            type: 'formula',
            formula: el.getAttribute('data-formula')
        });
    });
    
    // 提取块级组件数据
    canvas.querySelectorAll('.block-component').forEach(el => {
        content.elements.push({
            type: el.getAttribute('data-type'),
            props: JSON.parse(el.getAttribute('data-props') || '{}')
        });
    });
    
    return content;
}

// 初始化 Turndown 服务（HTML -> Markdown）
function initTurndownService() {
    if (typeof TurndownService === 'undefined') {
        console.error('[TEMPLATE] TurndownService 未加载');
        return null;
    }
    
    var turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        bulletListMarker: '-'
    });

    // 添加对下划线的支持
    turndownService.addRule('underline', {
        filter: 'u',
        replacement: function(content) {
            return '<u>' + content + '</u>';
        }
    });

    // 添加对填空的支持
    turndownService.addRule('inlineInput', {
        filter: function(node) {
            return node.classList && node.classList.contains('inline-input');
        },
        replacement: function(content, node) {
            var placeholder = node.getAttribute('data-placeholder') || '请输入';
            return '*[' + placeholder + ']*';
        }
    });

    // 添加对公式的支持
    turndownService.addRule('inlineFormula', {
        filter: function(node) {
            return node.classList && node.classList.contains('inline-formula');
        },
        replacement: function(content, node) {
            var formula = node.getAttribute('data-formula') || '';
            return '$' + formula + '$';
        }
    });

    // 添加对块级组件的支持
    turndownService.addRule('blockComponent', {
        filter: function(node) {
            return node.classList && node.classList.contains('block-component');
        },
        replacement: function(content, node) {
            var type = node.getAttribute('data-type');
            var data = JSON.parse(node.getAttribute('data-props') || '{}');
            return '\n\n' + convertBlockToMarkdown(type, data) + '\n\n';
        }
    });

    return turndownService;
}

// 转换为 Markdown（使用 Turndown）
function convertToMarkdown(element) {
    var turndownService = initTurndownService();
    if (!turndownService) {
        console.error('[TEMPLATE] 无法初始化 TurndownService，返回原始 HTML');
        return element.innerHTML || '';
    }
    return turndownService.turndown(element);
}

// 转换块级组件为 Markdown
function convertBlockToMarkdown(type, data) {
    switch (type) {
        case 'table':
            const rows = parseInt(data.rows) || 2;
            const cols = parseInt(data.cols) || 3;
            const cells = data.cells || {};
            
            let md = '';
            
            // 第一行：表头（索引0）
            md += '|';
            for (let j = 0; j < cols; j++) {
                const cellKey = '0-' + j;
                const cellValue = cells[cellKey] || '  ';
                md += ' ' + cellValue + ' |';
            }
            
            // 换行
            md += '\n';
            
            // 第二行：分隔线
            md += '|';
            for (let j = 0; j < cols; j++) {
                md += '----|';
            }
            
            // 换行
            md += '\n';
            
            // 数据行（索引1开始）
            for (let i = 1; i < rows; i++) {
                md += '|';
                for (let j = 0; j < cols; j++) {
                    const cellKey = i + '-' + j;
                    const cellValue = cells[cellKey] || '  ';
                    md += ' ' + cellValue + ' |';
                }
                md += '\n';
            }
            
            console.log('表格Markdown格式:', JSON.stringify(md));
            return md;
        case 'divider':
            return '---';
        case 'image':
            if (data.url) {
                return '![' + (data.alt || '图片') + '](' + data.url + ')';
            }
            return '[图片]';
        default:
            return '';
    }
}

// 保存模板
window.saveTemplate = function() {
    const templateName = document.getElementById('templateName').value;
    const templateDescription = document.getElementById('templateDescription').value;
    const canvas = document.getElementById('canvas');

    if (!templateName.trim()) {
        alert('请输入模板名称');
        return;
    }

    // 转换为 Markdown 格式
    const markdownContent = convertToMarkdown(canvas);
    
    const templateData = {
        id: currentTemplateId || null,
        templateName: templateName,
        templateContent: markdownContent,
        description: templateDescription,
        creatorId: getCurrentUserId()
    };

    console.log('保存模板数据:', templateData);

    const apiUrl = currentTemplateId ? '/ems/experimentTemplate/update' : '/ems/experimentTemplate/add';
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(templateData)
    })
    .then(result => {
        console.log('服务器返回结果:', result);

        if (result.code === 200) {
            if (result.data === true) {
                alert('模板保存成功');
            } else {
                alert('模板保存失败：操作未成功');
            }
        } else {
            alert('模板保存失败：' + (result.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('请求失败:', error);
        alert('模板保存失败：' + (error.message || '网络错误'));
    });
};

// 导出 Markdown
window.exportTemplateAsMarkdown = function() {
    const canvas = document.getElementById('canvas');
    let markdown = `# ${document.getElementById('templateName').value}\n\n`;
    
    const description = document.getElementById('templateDescription').value;
    if (description) {
        markdown += `${description}\n\n`;
    }
    
    markdown += '---\n\n';
    
    // 转换内容为 Markdown
    markdown += convertToMarkdown(canvas);
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.getElementById('templateName').value || '模板') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 获取当前用户ID
function getCurrentUserId() {
    return Auth.getUserId() || '1';
}

// 将 Markdown 转换为 HTML（使用 Marked）
function markdownToHtml(markdown) {
    if (!markdown) {
        return '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>';
    }

    var processedMarkdown = markdown;

    // 1. 先处理表格（转换为占位符，避免被 marked 破坏结构）
    var tablePlaceholders = [];
    var tablePattern = /(?:^\|.+\|$[\r\n]*)+/gm;
    processedMarkdown = processedMarkdown.replace(tablePattern, function(match) {
        var lines = match.trim().split(/[\r\n]+/).filter(function(l) { return l.trim(); });
        if (lines.length < 2) return match;

        var dividerLine = lines[1];
        if (!dividerLine.match(/^\|[\s\-:]+\|/)) {
            return match;
        }

        var cols = (dividerLine.match(/\|/g) || []).length - 1;
        if (cols < 1) return match;

        var rows = lines.length - 1;
        var tableData = { rows: rows, cols: cols, cells: {} };

        var headerParts = lines[0].split('|');
        for (var j = 1; j <= cols; j++) {
            tableData.cells['0-' + (j - 1)] = headerParts[j] ? headerParts[j].trim() : '';
        }

        for (var i = 2; i < lines.length; i++) {
            var rowParts = lines[i].split('|');
            for (var k = 1; k <= cols; k++) {
                tableData.cells[(i - 1) + '-' + (k - 1)] = rowParts[k] ? rowParts[k].trim() : '';
            }
        }

        var placeholder = '%%TABLE_' + tablePlaceholders.length + '%%';
        tablePlaceholders.push(tableData);
        return '\n' + placeholder + '\n';
    });

    // 2. 处理填空项（转换为占位符）
    var inputPlaceholders = [];
    processedMarkdown = processedMarkdown.replace(/\*\[([^\]]*)\]\*/g, function(match, placeholder) {
        var inputPlaceholder = '%%INPUT_' + inputPlaceholders.length + '%%';
        inputPlaceholders.push(placeholder);
        return inputPlaceholder;
    });

    // 3. 处理公式（转换为占位符）
    var formulaPlaceholders = [];
    processedMarkdown = processedMarkdown.replace(/\$([^$\n]+)\$/g, function(match, formula) {
        var formulaPlaceholder = '%%FORMULA_' + formulaPlaceholders.length + '%%';
        formulaPlaceholders.push(formula);
        return formulaPlaceholder;
    });

    // 4. 处理图片（转换为占位符）
    var imagePlaceholders = [];
    processedMarkdown = processedMarkdown.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, function(match, alt, url) {
        var imagePlaceholder = '%%IMAGE_' + imagePlaceholders.length + '%%';
        imagePlaceholders.push({ alt: alt, url: url });
        return '\n' + imagePlaceholder + '\n';
    });

    // 5. 处理分割线（转换为占位符）
    var dividerPlaceholders = [];
    processedMarkdown = processedMarkdown.replace(/^---$/gm, function(match) {
        var dividerPlaceholder = '%%DIVIDER_' + dividerPlaceholders.length + '%%';
        dividerPlaceholders.push({});
        return '\n' + dividerPlaceholder + '\n';
    });

    // 6. 配置 marked
    if (typeof marked === 'undefined') {
        console.error('[TEMPLATE] marked 未加载');
        return '<p>' + markdown + '</p>';
    }
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // 7. 使用 marked 转换
    var html = marked.parse(processedMarkdown);

    // 8. 还原表格占位符
    tablePlaceholders.forEach(function(tableData, index) {
        var tableHtml = '<table class="preview-table">';
        for (var i = 0; i < tableData.rows; i++) {
            tableHtml += '<tr>';
            for (var j = 0; j < tableData.cols; j++) {
                var cellKey = i + '-' + j;
                var cellValue = tableData.cells[cellKey] || '';
                var cellType = i === 0 ? 'header' : 'content';
                tableHtml += '<td contenteditable="true" data-row="' + i + '" data-col="' + j + '" data-cell-type="' + cellType + '" onblur="updateTableCell(this)">' + cellValue + '</td>';
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        var blockHtml = '<div class="block-component" contenteditable="false" data-type="table" data-props="' + JSON.stringify(tableData).replace(/"/g, '&quot;') + '"><div class="component-body">' + tableHtml + '</div></div>';
        html = html.replace('%%TABLE_' + index + '%%', blockHtml);
    });

    // 9. 还原填空占位符
    inputPlaceholders.forEach(function(placeholder, index) {
        var inputHtml = '<span class="inline-input" contenteditable="false" data-placeholder="' + placeholder + '"><span class="input-marker">[</span><span class="input-content">' + placeholder + '</span><span class="input-marker">]</span></span>';
        html = html.replace('%%INPUT_' + index + '%%', inputHtml);
    });

    // 10. 还原公式占位符
    formulaPlaceholders.forEach(function(formula, index) {
        var formulaHtml = '<span class="inline-formula" contenteditable="false" data-formula="' + formula + '"><span class="formula-display">$ ' + formula + ' $</span></span>';
        html = html.replace('%%FORMULA_' + index + '%%', formulaHtml);
    });

    // 11. 还原图片占位符
    imagePlaceholders.forEach(function(imageData, index) {
        var props = { url: imageData.url, alt: imageData.alt, size: 'medium' };
        var imageHtml = '<div class="block-component" contenteditable="false" data-type="image" data-props="' + JSON.stringify(props).replace(/"/g, '&quot;') + '"><div class="component-body"><div class="preview-image img-medium"><img src="' + imageData.url + '" alt="' + imageData.alt + '"></div></div></div>';
        html = html.replace('%%IMAGE_' + index + '%%', imageHtml);
    });

    // 12. 还原分割线占位符
    dividerPlaceholders.forEach(function(dividerData, index) {
        var dividerHtml = '<div class="block-component" contenteditable="false" data-type="divider" data-props="' + JSON.stringify(dividerData).replace(/"/g, '&quot;') + '"><div class="component-body"><div class="preview-divider"></div></div></div>';
        html = html.replace('%%DIVIDER_' + index + '%%', dividerHtml);
    });

    return html;
}

// 加载模板
function loadTemplate(templateId) {
    fetch('/ems/experimentTemplate/get?templateId=' + templateId, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            const template = result.data;
            currentTemplateId = template.id;
            document.getElementById('templateName').value = template.templateName;
            document.getElementById('templateDescription').value = template.description || '';
            
            const canvas = document.getElementById('canvas');
            
            // 将 Markdown 内容转换为 HTML
            const htmlContent = markdownToHtml(template.templateContent);
            canvas.innerHTML = htmlContent || '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>';
            
            // 重新渲染公式
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板失败：' + (error.message || '网络错误'));
    });
}
