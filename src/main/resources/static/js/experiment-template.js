// 实验模板编辑器
let components = [];
let selectedComponentIndex = -1;
let currentTemplateId = null;

const { createApp } = Vue;

const app = createApp({
    mounted() {
        this.checkLogin();
        initDragDrop();
        renderCanvas();
        renderPropertiesPanel();

        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('templateId');
        if (templateId) {
            loadTemplate(templateId);
        }
    },
    methods: {
        checkLogin() {
            try {
                const token = Auth.getToken();
                if (!token) {
                    window.location.href = '/ems/pages/index.html';
                    return;
                }
            } catch (error) {
                console.error('[TEMPLATE] 检查登录状态失败:', error);
                window.location.href = '/ems/pages/index.html';
            }
        }
    }
});

app.component('header-component', HeaderComponent);
app.mount('#app');

// 组件类型定义（简化版）
const componentTypes = {
    text: {
        name: '文本',
        icon: 'A',
        fields: [
            { type: 'textarea', name: 'content', label: '文本内容' }
        ]
    },
    table: {
        name: '表格',
        icon: '▦',
        fields: [
            { type: 'input', name: 'rows', label: '行数' },
            { type: 'input', name: 'cols', label: '列数' }
        ]
    },
    input: {
        name: '填空',
        icon: '_',
        fields: [
            { type: 'input', name: 'label', label: '问题' },
            { type: 'input', name: 'placeholder', label: '占位符' }
        ]
    },
    richtext: {
        name: '富文本',
        icon: '📝',
        fields: [
            { type: 'textarea', name: 'content', label: '富文本内容' },
            { type: 'select', name: 'alignment', label: '对齐方式', options: ['left', 'center', 'right'] }
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
    formula: {
        name: '公式',
        icon: '∑',
        fields: [
            { type: 'textarea', name: 'formula', label: 'LaTeX公式' },
            { type: 'textarea', name: 'description', label: '公式说明' }
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
        e.stopPropagation();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData('type');
        if (type) {
            addComponent(type);
        }
    });
}

// 添加组件
function addComponent(type) {
    const component = {
        id: Date.now().toString(),
        type: type,
        data: {}
    };

    // 初始化组件数据
    const typeConfig = componentTypes[type];
    typeConfig.fields.forEach(field => {
        component.data[field.name] = field.type === 'input' ? '' : '';
        if (field.type === 'textarea') {
            component.data[field.name] = '';
        }
        if (field.type === 'select' && field.options) {
            component.data[field.name] = field.options[0];
        }
    });

    components.push(component);
    renderCanvas();
    selectComponent(components.length - 1);
}

// 渲染画布
function renderCanvas() {
    const canvas = document.getElementById('canvas');
    const emptyTip = document.getElementById('emptyTip');

    if (components.length === 0) {
        // 显示空提示
        if (!canvas.querySelector('#emptyTip')) {
            canvas.innerHTML = '<div class="empty-tip" id="emptyTip"><p>从左侧拖拽组件到此处开始创建模板</p></div>';
        } else {
            emptyTip.style.display = 'block';
        }
        return;
    }

    // 隐藏空提示
    if (emptyTip) {
        emptyTip.style.display = 'none';
    }

    // 只重新渲染组件部分
    const existingComponents = canvas.querySelectorAll('.canvas-component');
    existingComponents.forEach(el => el.remove());

    components.forEach((component, index) => {
        const componentEl = createComponentElement(component, index);
        canvas.appendChild(componentEl);
    });
}

// 创建组件元素
function createComponentElement(component, index) {
    const typeConfig = componentTypes[component.type];
    const el = document.createElement('div');
    el.className = 'canvas-component';
    if (index === selectedComponentIndex) {
        el.classList.add('selected');
    }
    el.dataset.index = index;

    el.innerHTML = `
        <div class="component-header">
            <span class="component-type-icon">${typeConfig.icon}</span>
            <span class="component-type-name">${typeConfig.name}</span>
        </div>
        <div class="canvas-component-actions">
            <button class="component-btn component-btn-edit" data-index="${index}" data-action="edit">✎</button>
            <button class="component-btn component-btn-delete" data-index="${index}" data-action="delete">✕</button>
        </div>
        <div class="component-preview">
            ${renderComponentPreview(component)}
        </div>
    `;

    // 绑定点击事件
    el.addEventListener('click', (e) => {
        e.stopPropagation();

        // 检查是否点击了按钮
        if (e.target.tagName === 'BUTTON') {
            const action = e.target.dataset.action;
            const btnIndex = parseInt(e.target.dataset.index);

            if (action === 'edit') {
                editComponent(btnIndex);
            } else if (action === 'delete') {
                deleteComponent(btnIndex);
            }
        } else {
            // 点击组件本身，选择该组件
            selectComponent(index);
        }
    });

    return el;
}

// 渲染组件预览
function renderComponentPreview(component) {
    const data = component.data;
    switch (component.type) {
        case 'text':
            return `<div>${data.content || '暂无文本内容'}</div>`;
        case 'table':
            return `<div>${data.rows || 0} 行 × ${data.cols || 0} 列</div>`;
        case 'input':
            return `<label>${data.label || '未设置问题'}</label><br><input type="text" placeholder="${data.placeholder || ''}" disabled>`;
        case 'richtext':
            return `<div class="richtext-preview" style="text-align: ${data.alignment || 'left'}">${data.content || '暂无富文本内容'}</div>`;
        case 'divider':
            const borderStyle = data.style || 'solid';
            const borderColor = data.color || '#ddd';
            return `<div style="border-top: 2px ${borderStyle} ${borderColor}; margin: 20px 0;"></div>`;
        case 'formula':
            const previewFormula = data.formula || '暂无公式';
            return `<div class="formula-preview">
                <div class="formula-display">$${previewFormula}$</div>
                ${data.description ? `<div class="formula-desc">${data.description}</div>` : ''}
            </div>`;
        case 'image':
            const imgUrl = data.url || '';
            const imgAlt = data.alt || '图片';
            const imgSize = data.size || 'medium';
            const sizeClass = `img-${imgSize}`;
            return imgUrl 
                ? `<div class="image-preview ${sizeClass}"><img src="${imgUrl}" alt="${imgAlt}" /></div>`
                : `<div class="image-placeholder">暂无图片</div>`;
        default:
            return '未知组件类型';
    }
}

// 选择组件
function selectComponent(index) {
    selectedComponentIndex = index;
    renderCanvas();
    renderPropertiesPanel();
}

// 编辑组件
function editComponent(index) {
    selectComponent(index);
}

// 删除组件
function deleteComponent(index) {
    if (confirm('确定要删除这个组件吗？')) {
        components.splice(index, 1);
        if (selectedComponentIndex === index) {
            selectedComponentIndex = -1;
        } else if (selectedComponentIndex > index) {
            selectedComponentIndex--;
        }
        renderCanvas();
        renderPropertiesPanel();
    }
}

// 渲染属性面板
function renderPropertiesPanel() {
    const panel = document.getElementById('propertiesContent');

    if (selectedComponentIndex === -1) {
        panel.innerHTML = '<p class="empty-tip">请选择画布中的组件进行配置</p>';
        return;
    }

    const component = components[selectedComponentIndex];
    const typeConfig = componentTypes[component.type];

    let html = `<h3>${typeConfig.icon} ${typeConfig.name}</h3>`;
    html += '<div class="properties-form">';

    typeConfig.fields.forEach(field => {
        const value = component.data[field.name] || '';
        html += `<div class="form-group">`;
        html += `<label class="form-label">${field.label}</label>`;

        switch (field.type) {
            case 'input':
                html += `<input type="text" class="form-input" name="${field.name}" value="${value}" oninput="updateComponentData('${field.name}', this.value)">`;
                break;
            case 'textarea':
                html += `<textarea class="form-textarea" name="${field.name}" oninput="updateComponentData('${field.name}', this.value)">${value}</textarea>`;
                break;
            case 'select':
                html += `<select class="form-select" name="${field.name}" onchange="updateComponentData('${field.name}', this.value)">`;
                field.options.forEach(opt => {
                    const selected = value === opt ? 'selected' : '';
                    html += `<option value="${opt}" ${selected}>${opt}</option>`;
                });
                html += `</select>`;
                break;
        }

        html += `</div>`;
    });

    html += '</div>';
    panel.innerHTML = html;
}

// 更新组件数据
function updateComponentData(fieldName, value) {
    if (selectedComponentIndex === -1) return;
    components[selectedComponentIndex].data[fieldName] = value;
    renderCanvas();
}

// 清空画布
function clearCanvas() {
    if (confirm('确定要清空画布吗？所有组件将被删除。')) {
        components = [];
        selectedComponentIndex = -1;
        renderCanvas();
        renderPropertiesPanel();
    }
}

// 预览模板
function previewTemplate() {
    if (components.length === 0) {
        alert('请先添加组件');
        return;
    }

    const previewWindow = window.open('', '_blank');
    let previewContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>模板预览</title>
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
        .component-label {
            font-weight: bold;
            margin-bottom: 10px;
            display: block;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <h1>${document.getElementById('templateName').value}</h1>
    <p>${document.getElementById('templateDescription').value || ''}</p>
    <hr>
`;

    components.forEach(component => {
        const data = component.data;
        previewContent += '<div class="component">';
        
        switch (component.type) {
            case 'text':
                previewContent += `<div>${data.content || '暂无文本内容'}</div>`;
                break;
            case 'table':
                const rows = parseInt(data.rows) || 0;
                const cols = parseInt(data.cols) || 0;
                if (rows > 0 && cols > 0) {
                    previewContent += '<table border="1">';
                    for (let i = 0; i < rows; i++) {
                        previewContent += '<tr>';
                        for (let j = 0; j < cols; j++) {
                            previewContent += '<td>&nbsp;</td>';
                        }
                        previewContent += '</tr>';
                    }
                    previewContent += '</table>';
                }
                break;
            case 'input':
                previewContent += `<label>${data.label || '问题'}</label>`;
                previewContent += `<p>【填写区域：${data.placeholder || '请输入内容'}】</p>`;
                break;
            case 'richtext':
                previewContent += `<div style="text-align: ${data.alignment || 'left'}">${data.content || '暂无内容'}</div>`;
                break;
            case 'divider':
                previewContent += `<hr style="border: 2px ${data.style || 'solid'} ${data.color || '#ddd'}; margin: 20px 0;">`;
                break;
            case 'formula':
                previewContent += `<div style="padding: 10px; background: #f9f9f9; margin: 10px 0;">`;
                previewContent += `<p><strong>公式：</strong>${data.formula || '未设置'}</p>`;
                if (data.description) {
                    previewContent += `<p><strong>说明：</strong>${data.description}</p>`;
                }
                previewContent += `</div>`;
                break;
            case 'image':
                const imgPreviewUrl = data.url || '';
                const imgPreviewAlt = data.alt || '图片';
                if (imgPreviewUrl) {
                    previewContent += `<img src="${imgPreviewUrl}" alt="${imgPreviewAlt}" style="max-width: 100%;">`;
                    if (data.alt) {
                        previewContent += `<p style="font-size: 12px; color: #666;">${data.alt}</p>`;
                    }
                } else {
                    previewContent += `<p style="color: #999;">[图片位置]</p>`;
                }
                break;
        }
        
        previewContent += '</div>';
    });

    previewContent += `
</body>
</html>`;

    previewWindow.document.write(previewContent);
    previewWindow.document.close();
}

// 保存模板
function saveTemplate() {
    const templateName = document.getElementById('templateName').value;
    const templateDescription = document.getElementById('templateDescription').value;

    if (!templateName.trim()) {
        alert('请输入模板名称');
        return;
    }

    if (components.length === 0) {
        alert('请至少添加一个组件');
        return;
    }

    const templateData = {
        id: currentTemplateId || null,
        templateName: templateName,
        templateContent: JSON.stringify(components),
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

                // 如果是新增模板（没有currentTemplateId），跳转到列表页面
                if (!currentTemplateId) {
                    setTimeout(() => {
                        // 使用 TabsManager 打开新标签页
                        TabsManager.openTabByPath('/ems/pages/experiment-template-list.html', '实验模板管理');
                    }, 1000);
                }
                // 如果是编辑模板，保持在当前页面
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
}

// 导出模板为Markdown示例
function exportTemplateAsMarkdown() {
    if (components.length === 0) {
        alert('请先添加组件');
        return;
    }

    let markdown = `# ${document.getElementById('templateName').value}\n\n`;
    
    const description = document.getElementById('templateDescription').value;
    if (description) {
        markdown += `${description}\n\n`;
    }

    markdown += '---\n\n';

    components.forEach(component => {
        const data = component.data;
        
        switch (component.type) {
            case 'text':
                markdown += `${data.content || ''}\n\n`;
                break;
            case 'table':
                const rows = parseInt(data.rows) || 0;
                const cols = parseInt(data.cols) || 0;
                if (rows > 0 && cols > 0) {
                    markdown += '|';
                    for (let j = 0; j < cols; j++) {
                        markdown += '   |';
                    }
                    markdown += '\n|';
                    for (let j = 0; j < cols; j++) {
                        markdown += '---|';
                    }
                    markdown += '\n';
                    for (let i = 0; i < rows; i++) {
                        markdown += '|';
                        for (let j = 0; j < cols; j++) {
                            markdown += '   |';
                        }
                        markdown += '\n';
                    }
                    markdown += '\n';
                }
                break;
            case 'input':
                if (data.label) {
                    markdown += `### ${data.label}\n\n`;
                }
                markdown += `*${data.placeholder || '待填写'}*\n\n`;
                break;
            case 'richtext':
                markdown += `${data.content || ''}\n\n`;
                break;
            case 'divider':
                markdown += '---\n\n';
                break;
            case 'formula':
                if (data.formula) {
                    markdown += `$$\n${data.formula}\n$$\n\n`;
                }
                if (data.description) {
                    markdown += `> ${data.description}\n\n`;
                }
                break;
            case 'image':
                if (data.url) {
                    markdown += `![${data.alt || '图片'}](${data.url})\n\n`;
                    if (data.alt) {
                        markdown += `*${data.alt}*\n\n`;
                    }
                } else {
                    markdown += `[图片]\n\n`;
                }
                break;
        }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.getElementById('templateName').value || '模板') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            components = JSON.parse(template.templateContent);
            selectedComponentIndex = -1;
            renderCanvas();
            renderPropertiesPanel();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板失败：' + (error.message || '网络错误'));
    });
}
