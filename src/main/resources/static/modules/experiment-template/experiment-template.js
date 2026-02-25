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
            { type: 'input', name: 'rows', label: '行数' },
            { type: 'input', name: 'cols', label: '列数' }
        ]
    },
    divider: {
        name: '分割线',
        icon: '─',
        fields: [
            { type: 'select', name: 'style', label: '线条样式', options: ['solid', 'dashed', 'dotted'] },
            { type: 'input', name: 'color', label: '颜色（如 #333）' }
        ]
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

    // 监听键盘删除
    canvas.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedElement && selectedElement.classList.contains('block-component')) {
                e.preventDefault();
                selectedElement.remove();
                clearSelection();
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
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
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
            insertBlockComponent(type);
        }
    });
}

// 插入填空
window.insertInput = function() {
    const placeholder = prompt('请输入填空提示（可选）：', '请输入');
    const html = `<span class="inline-input" contenteditable="false" data-placeholder="${placeholder || '请输入'}">
        <span class="input-marker">[</span>
        <span class="input-content">${placeholder || '请输入'}</span>
        <span class="input-marker">]</span>
    </span>`;
    insertAtCursor(html);
    triggerContentChange();
};

// 插入公式
window.insertFormula = function() {
    const formula = prompt('请输入 LaTeX 公式：', 'E=mc^2');
    if (formula) {
        const html = `<span class="inline-formula" contenteditable="false" data-formula="${formula}">
            <span class="formula-display">$${formula}$</span>
        </span>`;
        insertAtCursor(html);
        triggerContentChange();
        // 触发 MathJax 渲染
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
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
    const data = {};
    typeConfig.fields.forEach(field => {
        if (field.type === 'select' && field.options) {
            data[field.name] = field.options[0];
        } else {
            data[field.name] = '';
        }
    });
    component.setAttribute('data-props', JSON.stringify(data));
    
    // 渲染组件
    component.innerHTML = `
        <div class="component-header">
            <span class="component-type-icon">${typeConfig.icon}</span>
            <span class="component-type-name">${typeConfig.name}</span>
            <button class="component-delete" onclick="this.closest('.block-component').remove(); clearSelection();">×</button>
        </div>
        <div class="component-body">${renderBlockComponentPreview(type, data)}</div>
    `;
    
    canvas.appendChild(component);
    selectElement(component);
    triggerContentChange();
}

// 渲染块级组件预览
function renderBlockComponentPreview(type, data) {
    switch (type) {
        case 'table':
            const rows = parseInt(data.rows) || 3;
            const cols = parseInt(data.cols) || 3;
            let tableHtml = '<table class="preview-table">';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHtml += '<td></td>';
                }
                tableHtml += '</tr>';
            }
            tableHtml += '</table>';
            return tableHtml;
        case 'divider':
            const borderStyle = data.style || 'solid';
            const borderColor = data.color || '#ddd';
            return `<div class="preview-divider" style="border-top: 2px ${borderStyle} ${borderColor};"></div>`;
        case 'image':
            const size = data.size || 'medium';
            if (data.url) {
                return `<div class="preview-image img-${size}"><img src="${data.url}" alt="${data.alt || ''}"></div>`;
            }
            return `<div class="preview-image-placeholder img-${size}">点击设置图片</div>`;
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
function clearSelection() {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
    }
    renderDefaultPanel();
}

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
        
        let html = `<h3>${typeConfig.icon} ${typeConfig.name}</h3>`;
        html += '<div class="properties-form">';
        
        typeConfig.fields.forEach(field => {
            const value = data[field.name] || '';
            html += `<div class="form-group">`;
            html += `<label class="form-label">${field.label}</label>`;
            
            switch (field.type) {
                case 'input':
                    html += `<input type="text" class="form-input" value="${value}" 
                        oninput="updateBlockComponent('${field.name}', this.value)">`;
                    break;
                case 'textarea':
                    html += `<textarea class="form-textarea" 
                        oninput="updateBlockComponent('${field.name}', this.value)">${value}</textarea>`;
                    break;
                case 'select':
                    html += `<select class="form-select" onchange="updateBlockComponent('${field.name}', this.value)">`;
                    field.options.forEach(opt => {
                        const selected = value === opt ? 'selected' : '';
                        html += `<option value="${opt}" ${selected}>${opt}</option>`;
                    });
                    html += `</select>`;
                    break;
            }
            
            html += `</div>`;
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
        const data = JSON.parse(selectedElement.getAttribute('data-props') || '{}');
        data[fieldName] = value;
        selectedElement.setAttribute('data-props', JSON.stringify(data));
        
        const type = selectedElement.getAttribute('data-type');
        const body = selectedElement.querySelector('.component-body');
        body.innerHTML = renderBlockComponentPreview(type, data);
    }
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
            let tableHtml = '<table border="1" style="width:100%; margin: 10px 0;">';
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHtml += '<td>&nbsp;</td>';
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

// 保存模板
window.saveTemplate = function() {
    const templateName = document.getElementById('templateName').value;
    const templateDescription = document.getElementById('templateDescription').value;
    const canvas = document.getElementById('canvas');

    if (!templateName.trim()) {
        alert('请输入模板名称');
        return;
    }

    const templateData = {
        id: currentTemplateId || null,
        templateName: templateName,
        templateContent: canvas.innerHTML,
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

                if (!currentTemplateId) {
                    setTimeout(() => {
                        TabsManager.openTabByPath('/ems/modules/experiment-template-list/experiment-template-list.html', '实验模板管理');
                    }, 1000);
                }
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

// 转换为 Markdown
function convertToMarkdown(element) {
    let markdown = '';
    
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            markdown += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node;
            
            if (el.classList.contains('inline-input')) {
                const placeholder = el.getAttribute('data-placeholder') || '请输入';
                markdown += `*[${placeholder}]*`;
            } else if (el.classList.contains('inline-formula')) {
                const formula = el.getAttribute('data-formula') || '';
                markdown += `$${formula}$`;
            } else if (el.classList.contains('block-component')) {
                const type = el.getAttribute('data-type');
                const data = JSON.parse(el.getAttribute('data-props') || '{}');
                markdown += '\n' + convertBlockToMarkdown(type, data) + '\n';
            } else if (el.tagName === 'BR') {
                markdown += '\n';
            } else if (el.tagName === 'P' || el.tagName === 'DIV') {
                markdown += convertToMarkdown(el) + '\n\n';
            } else {
                markdown += convertToMarkdown(el);
            }
        }
    });
    
    return markdown;
}

// 转换块级组件为 Markdown
function convertBlockToMarkdown(type, data) {
    switch (type) {
        case 'table':
            const rows = parseInt(data.rows) || 3;
            const cols = parseInt(data.cols) || 3;
            let md = '|';
            for (let j = 0; j < cols; j++) md += '   |';
            md += '\n|';
            for (let j = 0; j < cols; j++) md += '---|';
            md += '\n';
            for (let i = 0; i < rows; i++) {
                md += '|';
                for (let j = 0; j < cols; j++) md += '   |';
                md += '\n';
            }
            return md;
        case 'divider':
            return '---';
        case 'image':
            if (data.url) {
                return `![${data.alt || '图片'}](${data.url})`;
            }
            return '[图片]';
        default:
            return '';
    }
}

// 获取当前用户ID
function getCurrentUserId() {
    return Auth.getUserId() || '1';
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
            canvas.innerHTML = template.templateContent || '<p></p>';
            
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
