// 实验模板编辑器
let components = [];
let selectedComponentIndex = -1;
let currentTemplateId = null;

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
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
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
        emptyTip.style.display = 'block';
        canvas.innerHTML = '';
        canvas.appendChild(emptyTip);
        return;
    }

    emptyTip.style.display = 'none';
    canvas.innerHTML = '';

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
            <button class="component-btn component-btn-edit" onclick="editComponent(${index})">✎</button>
            <button class="component-btn component-btn-delete" onclick="deleteComponent(${index})">✕</button>
        </div>
        <div class="component-preview">
            ${renderComponentPreview(component)}
        </div>
    `;

    el.addEventListener('click', () => {
        selectComponent(index);
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

    const apiUrl = currentTemplateId ? '/ems/experimentTemplate/update' : '/ems/experimentTemplate/add';
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(templateData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            alert('模板保存成功');
            if (result.data) {
                currentTemplateId = result.data.id || currentTemplateId;
            }
        } else {
            alert('模板保存失败：' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('模板保存失败');
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
    .then(response => response.json())
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
        alert('加载模板失败');
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initDragDrop();

    // 检查URL参数，如果有模板ID则加载模板
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('templateId');
    if (templateId) {
        loadTemplate(templateId);
    }
});
