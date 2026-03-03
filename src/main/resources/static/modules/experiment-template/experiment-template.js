// 实验模板编辑器
let currentTemplateId = null;
let selectedElement = null;

// 动态加载必要的脚本库
(function loadRequiredScripts() {
    // 加载 TurndownService (HTML -> Markdown)
    if (typeof TurndownService === 'undefined') {
        var turndownScript = document.createElement('script');
        turndownScript.src = '/ems/common/js/turndown.browser.umd.min.js';
        turndownScript.onload = function() {
            console.log('[TEMPLATE] TurndownService 加载成功');
        };
        turndownScript.onerror = function() {
            console.error('[TEMPLATE] TurndownService 加载失败');
        };
        document.head.appendChild(turndownScript);
    }
    
    // 加载 Marked (Markdown -> HTML)
    if (typeof marked === 'undefined') {
        var markedScript = document.createElement('script');
        markedScript.src = '/ems/common/js/marked.min.js';
        markedScript.onload = function() {
            console.log('[TEMPLATE] Marked 加载成功');
        };
        markedScript.onerror = function() {
            console.error('[TEMPLATE] Marked 加载失败');
        };
        document.head.appendChild(markedScript);
    }
    
    // 加载公共 Markdown 转换器
    if (typeof MarkdownConverter === 'undefined') {
        var converterScript = document.createElement('script');
        converterScript.src = '/ems/common/js/markdown-converter.js';
        converterScript.onload = function() {
            console.log('[TEMPLATE] MarkdownConverter 加载成功');
        };
        converterScript.onerror = function() {
            console.error('[TEMPLATE] MarkdownConverter 加载失败');
        };
        document.head.appendChild(converterScript);
    }
})();

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
            // 使用公共 Auth 工具类检查登录状态
            if (!Auth.isLoggedIn()) {
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

    // 处理点击块级组件上下区域（通过伪元素扩展的区域）
    canvas.addEventListener('click', (e) => {
        const blockComponent = e.target.closest('.block-component');
        if (blockComponent) {
            // 如果点击的是表格单元格，不处理，让单元格正常编辑
            if (e.target.closest('.preview-table td')) {
                return;
            }
            
            // 判断点击是在组件上方还是下方（伪元素区域）
            const rect = blockComponent.getBoundingClientRect();
            const clickY = e.clientY;
            const blockCenterY = rect.top + rect.height / 2;
            const parent = blockComponent.parentNode;
            
            // 找到前后可编辑的段落
            let editTarget;
            if (clickY < blockCenterY) {
                // 点击在组件上方，定位到前面的段落
                editTarget = blockComponent.previousElementSibling;
                // 如果前面没有段落或前面也是块级组件，创建一个新段落
                if (!editTarget || editTarget.classList.contains('block-component')) {
                    const newP = document.createElement('p');
                    newP.innerHTML = '<br>';
                    parent.insertBefore(newP, blockComponent);
                    editTarget = newP;
                }
            } else {
                // 点击在组件下方，定位到后面的段落
                editTarget = blockComponent.nextElementSibling;
                // 如果后面没有段落或后面也是块级组件，创建一个新段落
                if (!editTarget || editTarget.classList.contains('block-component')) {
                    const newP = document.createElement('p');
                    newP.innerHTML = '<br>';
                    if (blockComponent.nextSibling) {
                        parent.insertBefore(newP, blockComponent.nextSibling);
                    } else {
                        parent.appendChild(newP);
                    }
                    editTarget = newP;
                }
            }
            
            // 将光标移动到目标段落
            if (editTarget && (editTarget.tagName === 'P' || editTarget.tagName === 'DIV')) {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(editTarget);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                editTarget.focus();
            }
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
            rows: '3',
            cols: '3'
        };
    }
    typeConfig.fields.forEach(function(field) {
        // 如果已经有默认值则跳过
        if (data[field.name] !== undefined) {
            return;
        }
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
            // 检查是否在块级组件内部，如果是则移到外部
            let insertNode = range.commonAncestorContainer;
            let parentBlock = null;
            
            // 向上查找最近的块级组件
            while (insertNode && insertNode !== canvas) {
                if (insertNode.nodeType === Node.ELEMENT_NODE && 
                    insertNode.classList && 
                    insertNode.classList.contains('block-component')) {
                    parentBlock = insertNode;
                    break;
                }
                insertNode = insertNode.parentNode;
            }
            
            // 如果在块级组件内部，在块级组件后面插入
            if (parentBlock) {
                // 确保在块级组件后面有可编辑的内容
                const afterNode = document.createElement('p');
                afterNode.innerHTML = '<br>';
                
                // 在父块级组件后面插入（使用 parentBlock.parentNode 而非 canvas）
                const insertParent = parentBlock.parentNode;
                if (parentBlock.nextSibling) {
                    insertParent.insertBefore(afterNode, parentBlock.nextSibling);
                    insertParent.insertBefore(component, afterNode);
                } else {
                    insertParent.appendChild(component);
                    insertParent.appendChild(afterNode);
                }
            } else {
                // 不在块级组件内部，需要找到合适的插入位置
                // 查找光标所在的最近块级元素（P, DIV 等）
                let insertPoint = range.commonAncestorContainer;
                while (insertPoint && insertPoint !== canvas && insertPoint.parentNode !== canvas) {
                    insertPoint = insertPoint.parentNode;
                }
                
                // 清理选区内容
                range.deleteContents();
                
                // 确保在块级组件后面有可编辑的内容
                const afterNode = document.createElement('p');
                afterNode.innerHTML = '<br>';
                
                if (insertPoint === canvas) {
                    // 光标直接在 canvas 中，直接追加
                    canvas.appendChild(component);
                    canvas.appendChild(afterNode);
                } else {
                    // 在找到的块级元素后插入
                    if (insertPoint.nextSibling) {
                        canvas.insertBefore(afterNode, insertPoint.nextSibling);
                        canvas.insertBefore(component, afterNode);
                    } else {
                        canvas.appendChild(component);
                        canvas.appendChild(afterNode);
                    }
                }
            }
            
            // 确保块级组件前面也有可编辑区域（如果是第一个元素）
            if (!component.previousSibling || component.previousSibling.nodeType !== Node.ELEMENT_NODE) {
                const beforeNode = document.createElement('p');
                beforeNode.innerHTML = '<br>';
                component.parentNode.insertBefore(beforeNode, component);
            }
            
            // 移动光标到组件后面的可编辑区域
            const editTarget = component.nextSibling;
            const newRange = document.createRange();
            if (editTarget && editTarget.tagName === 'P') {
                newRange.selectNodeContents(editTarget);
                newRange.collapse(true);
            } else {
                newRange.setStartAfter(component);
                newRange.collapse(true);
            }
            selection.removeAllRanges();
            selection.addRange(newRange);
            
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
            rows: '3',
            cols: '3'
        };
    }
    typeConfig.fields.forEach(function(field) {
        // 如果已经有默认值则跳过
        if (data[field.name] !== undefined) {
            return;
        }
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
    
    // 检查是否在块级组件内部，如果是则移到外部
    let insertNode = range.commonAncestorContainer;
    let parentBlock = null;
    
    // 向上查找最近的块级组件
    while (insertNode && insertNode !== canvas) {
        if (insertNode.nodeType === Node.ELEMENT_NODE && 
            insertNode.classList && 
            insertNode.classList.contains('block-component')) {
            parentBlock = insertNode;
            break;
        }
        insertNode = insertNode.parentNode;
    }
    
    // 如果在块级组件内部，在块级组件后面插入
    if (parentBlock) {
        // 确保在块级组件后面有可编辑的内容
        const afterNode = document.createElement('p');
        afterNode.innerHTML = '<br>';
        
        // 在父块级组件后面插入（使用 parentBlock.parentNode 而非 canvas）
        const insertParent = parentBlock.parentNode;
        if (parentBlock.nextSibling) {
            insertParent.insertBefore(afterNode, parentBlock.nextSibling);
            insertParent.insertBefore(component, afterNode);
        } else {
            insertParent.appendChild(component);
            insertParent.appendChild(afterNode);
        }
    } else {
        // 不在块级组件内部，需要找到合适的插入位置
        // 查找光标所在的最近块级元素（P, DIV 等）的父级（canvas 的直接子元素）
        let insertPoint = range.commonAncestorContainer;
        while (insertPoint && insertPoint !== canvas && insertPoint.parentNode !== canvas) {
            insertPoint = insertPoint.parentNode;
        }
        
        // 清理选区内容
        range.deleteContents();
        
        // 确保在块级组件后面有可编辑的内容
        const afterNode = document.createElement('p');
        afterNode.innerHTML = '<br>';
        
        if (insertPoint === canvas) {
            // 光标直接在 canvas 中，直接追加
            canvas.appendChild(component);
            canvas.appendChild(afterNode);
        } else {
            // 在找到的块级元素后插入
            if (insertPoint.nextSibling) {
                canvas.insertBefore(afterNode, insertPoint.nextSibling);
                canvas.insertBefore(component, afterNode);
            } else {
                canvas.appendChild(component);
                canvas.appendChild(afterNode);
            }
        }
    }
    
    // 确保块级组件前面也有可编辑区域（如果是第一个元素）
    if (!component.previousSibling || component.previousSibling.nodeType !== Node.ELEMENT_NODE) {
        const beforeNode = document.createElement('p');
        beforeNode.innerHTML = '<br>';
        component.parentNode.insertBefore(beforeNode, component);
    }
    
    // 移动光标到组件后面的可编辑区域
    const editTarget = component.nextSibling;
    const newRange = document.createRange();
    if (editTarget && editTarget.tagName === 'P') {
        newRange.selectNodeContents(editTarget);
        newRange.collapse(true);
    } else {
        newRange.setStartAfter(component);
        newRange.collapse(true);
    }
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
    
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

// 等待 MarkdownConverter 加载完成
function waitForMarkdownConverter(maxWaitTime) {
    maxWaitTime = maxWaitTime || 5000;
    return new Promise(function(resolve, reject) {
        if (typeof MarkdownConverter !== 'undefined') {
            resolve();
            return;
        }
        
        var startTime = Date.now();
        var checkInterval = setInterval(function() {
            if (typeof MarkdownConverter !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            } else if (Date.now() - startTime > maxWaitTime) {
                clearInterval(checkInterval);
                reject(new Error('MarkdownConverter 加载超时'));
            }
        }, 100);
    });
}

// 转换为 Markdown（使用公共转换器）
async function convertToMarkdownAsync(element) {
    try {
        await waitForMarkdownConverter(5000);
    } catch (error) {
        console.error('[TEMPLATE] MarkdownConverter 未加载:', error.message);
        alert('Markdown转换组件加载失败，请刷新页面重试');
        return '';
    }
    
    return await MarkdownConverter.convertToMarkdownAsync(element);
}

// 转换为 Markdown（同步版本，兼容旧调用）
function convertToMarkdown(element) {
    if (typeof MarkdownConverter === 'undefined') {
        console.error('[TEMPLATE] MarkdownConverter 未加载');
        alert('Markdown转换组件未加载，请刷新页面重试');
        return '';
    }
    return MarkdownConverter.convertToMarkdown(element);
}

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

// 保存模板
window.saveTemplate = async function() {
    const templateName = document.getElementById('templateName').value;
    const templateDescription = document.getElementById('templateDescription').value;
    const canvas = document.getElementById('canvas');

    if (!templateName.trim()) {
        alert('请输入模板名称');
        return;
    }

    // 调试：检查 canvas 中的块级组件
    const blockComponents = canvas.querySelectorAll('.block-component');
    console.log('[TEMPLATE] Canvas 中的块级组件数量:', blockComponents.length);
    blockComponents.forEach(function(block, index) {
        console.log('[TEMPLATE] 块级组件 ' + index + ':', block.getAttribute('data-type'), block);
    });

    // 转换为 Markdown 格式（异步等待脚本加载）
    const markdownContent = await convertToMarkdownAsync(canvas);
    
    // 如果转换失败，不继续保存
    if (!markdownContent && markdownContent !== '') {
        console.error('[TEMPLATE] Markdown 转换结果为空');
        return;
    }
    
    const templateData = {
        id: currentTemplateId || null,
        templateName: templateName,
        templateContent: markdownContent,
        description: templateDescription,
        creatorId: Auth.getUserId() || '1'  // 使用公共 Auth 工具类
    };

    console.log('[TEMPLATE] 保存模板数据，内容格式: Markdown');
    console.log('[TEMPLATE] Markdown内容:', markdownContent);

    // 使用公共 API 工具类
    const apiUrl = currentTemplateId ? '/experimentTemplate/update' : '/experimentTemplate/add';
    
    API.post(apiUrl, templateData)
    .then(result => {
        console.log('[TEMPLATE] 服务器返回结果:', result);

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
        console.error('[TEMPLATE] 请求失败:', error);
        alert('模板保存失败：' + (error.message || '网络错误'));
    });
};

// 导出 Markdown
window.exportTemplateAsMarkdown = async function() {
    const templateName = document.getElementById('templateName').value;
    const description = document.getElementById('templateDescription').value;
    const canvas = document.getElementById('canvas');
    
    if (!templateName.trim()) {
        alert('请输入模板名称');
        return;
    }
    
    let markdown = `# ${templateName}\n\n`;
    
    if (description) {
        markdown += `${description}\n\n`;
    }
    
    markdown += '---\n\n';
    
    // 转换内容为 Markdown（异步等待脚本加载）
    const contentMarkdown = await convertToMarkdownAsync(canvas);
    
    // 如果转换失败，不继续导出
    if (contentMarkdown === '') {
        console.error('[TEMPLATE] Markdown 转换结果为空');
        return;
    }
    
    markdown += contentMarkdown;
    
    console.log('[TEMPLATE] 导出Markdown内容:', markdown);
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (templateName || '模板') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 将 Markdown 转换为 HTML（使用公共转换器）
function markdownToHtml(markdown) {
    if (typeof MarkdownConverter === 'undefined') {
        console.error('[TEMPLATE] MarkdownConverter 未加载');
        return '<p>' + (markdown || '在此输入内容，使用左侧按钮插入填空或公式...') + '</p>';
    }
    
    // 使用公共转换器，配置为模板编辑模式
    var html = MarkdownConverter.markdownToHtml(markdown, {
        editable: true,
        tableClass: 'preview-table',
        onBlurHandler: 'updateTableCell'
    });
    
    if (!html) {
        return '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>';
    }
    
    // 确保块级组件前后有可编辑区域
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    var blockComponents = tempDiv.querySelectorAll('.block-component');
    blockComponents.forEach(function(block) {
        if (!block.previousElementSibling || block.previousElementSibling.classList.contains('block-component')) {
            var beforeP = document.createElement('p');
            beforeP.innerHTML = '<br>';
            block.parentNode.insertBefore(beforeP, block);
        }
        if (!block.nextElementSibling || block.nextElementSibling.classList.contains('block-component')) {
            var afterP = document.createElement('p');
            afterP.innerHTML = '<br>';
            if (block.nextSibling) {
                block.parentNode.insertBefore(afterP, block.nextSibling);
            } else {
                block.parentNode.appendChild(afterP);
            }
        }
    });

    return tempDiv.innerHTML;
}

// 加载模板
async function loadTemplate(templateId) {
    try {
        // 使用公共 API 工具类
        const result = await API.post('/experimentTemplate/get?templateId=' + templateId, {});
        
        if (result.code === 200 && result.data) {
            const template = result.data;
            currentTemplateId = template.id;
            document.getElementById('templateName').value = template.templateName;
            document.getElementById('templateDescription').value = template.description || '';
            
            const canvas = document.getElementById('canvas');
            const htmlContent = markdownToHtml(template.templateContent);
            canvas.innerHTML = htmlContent || '<p>在此输入内容，使用左侧按钮插入填空或公式...</p>';
            
            // 重新渲染公式
            if (window.MathJax) {
                MathJax.typesetPromise();
            }
        }
    } catch (error) {
        console.error('[TEMPLATE] 加载模板失败:', error);
        alert('加载模板失败：' + (error.message || '网络错误'));
    }
}
