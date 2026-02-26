// 实验报告
let currentTemplate = null;
let currentReport = null;
let reportComponents = [];
let currentTemplateId = null;
let pendingReports = [];
let submittedReports = [];

const app = Vue.createApp({
    data() {
        return {
            currentTab: 'pending',
            pendingCount: 0,
            submittedCount: 0
        };
    },
    mounted() {
        this.checkLogin();
        init();
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
                console.error('[REPORT] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },
        switchTab(tab) {
            this.currentTab = tab;
        }
    }
});

app.component('header-component', HeaderComponent);
const vueApp = app.mount('#app');

// 初始化
function init() {
    loadReportOverview();
}

// 加载报告概览
function loadReportOverview() {
    fetch('/ems/experimentReport/overview', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            const allReports = result.data || [];
            pendingReports = allReports.filter(r => r.status === 'pending' || r.status === 'draft');
            submittedReports = allReports.filter(r => r.status === 'submitted' || r.status === 'graded');
            
            vueApp.pendingCount = pendingReports.length;
            vueApp.submittedCount = submittedReports.length;
            
            renderPendingList();
            renderSubmittedList();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载报告列表失败');
    });
}

// 渲染待提交列表
function renderPendingList() {
    const list = document.getElementById('pendingList');

    if (pendingReports.length === 0) {
        list.innerHTML = '<div class="empty-tip">暂无待提交的实验报告</div>';
        return;
    }

    list.innerHTML = pendingReports.map(report => {
        let statusText = '待填写';
        let statusClass = 'pending';
        
        if (report.status === 'draft') {
            statusText = '草稿';
            statusClass = 'draft';
        }

        return `
            <div class="report-item">
                <div class="report-item-info">
                    <div class="report-item-name">${report.templateName}</div>
                    <div class="report-item-meta">
                        课程: ${report.courseName || '未知课程'}
                    </div>
                </div>
                <div class="report-item-status ${statusClass}">${statusText}</div>
                <div class="report-item-actions">
                    ${report.status === 'draft' ? 
                        `<button class="btn btn-sm btn-secondary" onclick="editReportByTemplate('${report.templateId}', '${report.reportId}')">继续编辑</button>` :
                        `<button class="btn btn-sm btn-primary" onclick="startReport('${report.templateId}')">开始填写</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// 渲染已提交列表
function renderSubmittedList() {
    const list = document.getElementById('submittedList');

    if (submittedReports.length === 0) {
        list.innerHTML = '<div class="empty-tip">暂无已提交的实验报告</div>';
        return;
    }

    list.innerHTML = submittedReports.map(report => {
        let statusText = '已提交';
        let statusClass = 'submitted';
        
        if (report.status === 'graded') {
            statusText = '已评分';
            statusClass = 'graded';
        }

        return `
            <div class="report-item">
                <div class="report-item-info">
                    <div class="report-item-name">${report.reportName || report.templateName}</div>
                    <div class="report-item-meta">
                        提交时间: ${report.submitTime ? formatDate(report.submitTime) : '未知'}
                    </div>
                </div>
                <div class="report-item-status ${statusClass}">${statusText}</div>
                <div class="report-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewReport('${report.reportId}')">查看</button>
                </div>
                ${report.score !== null && report.score !== undefined ? `
                    <div class="report-item-score">
                        <div class="score-label">得分</div>
                        <div class="score-value">${report.score}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 返回列表
function backToList() {
    if (currentReport && confirm('返回将不保存当前编辑内容，确定要返回吗？')) {
        showReportList();
    } else if (!currentReport) {
        showReportList();
    }
}

// 显示报告列表
function showReportList() {
    document.getElementById('templateSelector').style.display = 'none';
    document.getElementById('reportEditor').style.display = 'none';
    document.getElementById('reportPreview').style.display = 'none';
    document.getElementById('pendingContainer').style.display = 'block';
    document.getElementById('submittedContainer').style.display = 'block';
    currentReport = null;
    currentTemplate = null;
    currentTemplateId = null;
    loadReportOverview();
}

// 开始填写报告
function startReport(templateId) {
    currentTemplateId = templateId;
    currentReport = null;
    
    fetch(`/ems/experimentTemplate/get?templateId=${templateId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            currentTemplate = result.data;
            reportComponents = JSON.parse(result.data.templateContent);
            document.getElementById('reportName').value = result.data.templateName;
            renderReportEditor();
            showReportEditor();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板失败');
    });
}

// 根据模板编辑报告
function editReportByTemplate(templateId, reportId) {
    currentTemplateId = templateId;
    
    fetch(`/ems/experimentReport/get?reportId=${reportId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            currentReport = result.data;
            const contentData = JSON.parse(result.data.reportContent);
            reportComponents = contentData.components || [];
            
            fetch(`/ems/experimentTemplate/get?templateId=${templateId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(result => {
                if (result.code === 200 && result.data) {
                    currentTemplate = result.data;
                    document.getElementById('reportName').value = currentReport.reportName || result.data.templateName;
                    renderReportEditor();
                    
                    setTimeout(() => {
                        restoreInputData(contentData.inputData || {});
                    }, 100);
                    
                    showReportEditor();
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载报告失败');
    });
}

// 恢复输入数据
function restoreInputData(inputData) {
    Object.keys(inputData).forEach(index => {
        const input = document.querySelector(`[data-component-index="${index}"]`);
        if (input && inputData[index].value !== undefined) {
            input.value = inputData[index].value;
        }
        
        const data = inputData[index];
        if (data) {
            Object.keys(data).forEach(key => {
                if (key.startsWith('cell_')) {
                    const tableInput = document.querySelector(`[data-cell-key="${key}"]`);
                    if (tableInput) {
                        tableInput.value = data[key];
                    }
                }
            });
        }
    });
}

// 渲染报告编辑器
function renderReportEditor() {
    const content = document.getElementById('reportContent');

    content.innerHTML = reportComponents.map((component, index) => {
        return renderReportComponent(component, index);
    }).join('');
}

// 渲染报告组件
function renderReportComponent(component, index) {
    const data = component.data;
    let html = `<div class="report-component" data-index="${index}">`;

    switch (component.type) {
        case 'text':
            html += `<label class="report-component-label">文本内容</label>`;
            html += `<div class="component-content">${data.content || ''}</div>`;
            break;

        case 'table':
            html += `<label class="report-component-label">表格</label>`;
            html += `<div class="component-content">`;
            const rows = parseInt(data.rows) || 0;
            const cols = parseInt(data.cols) || 0;
            if (rows > 0 && cols > 0) {
                html += `<table border="1" style="border-collapse: collapse; width: 100%;">`;
                for (let i = 0; i < rows; i++) {
                    html += '<tr>';
                    for (let j = 0; j < cols; j++) {
                        html += `<td style="padding: 8px; min-width: 100px;"><input type="text" data-cell-key="${index}_cell_${i}_${j}" style="width: 100%; border: none; outline: none;" placeholder="填写内容"></td>`;
                    }
                    html += '</tr>';
                }
                html += '</table>';
            }
            html += `</div>`;
            break;

        case 'input':
            html += `<label class="report-component-label">${data.label || '问题'}</label>`;
            html += `<div class="component-content">`;
            html += `<textarea class="report-form-textarea" rows="4" placeholder="${data.placeholder || '请输入内容'}" data-component-index="${index}"></textarea>`;
            html += `</div>`;
            break;
    }

    html += '</div>';

    return html;
}

// 显示报告编辑器
function showReportEditor() {
    document.getElementById('templateSelector').style.display = 'none';
    document.getElementById('reportEditor').style.display = 'flex';
    document.getElementById('reportPreview').style.display = 'none';
    document.getElementById('pendingContainer').style.display = 'none';
    document.getElementById('submittedContainer').style.display = 'none';
}

// 保存草稿
function saveDraft() {
    saveReport(false);
}

// 提交报告
function submitReport() {
    if (confirm('确定要提交报告吗？提交后将不能修改。')) {
        saveReport(true);
    }
}

// 保存报告
function saveReport(isSubmit) {
    const reportName = document.getElementById('reportName').value;

    if (!reportName.trim()) {
        alert('请输入报告名称');
        return;
    }

    // 收集输入组件的数据
    const inputs = document.querySelectorAll('[data-component-index]');
    const inputData = {};

    inputs.forEach(input => {
        const index = input.dataset.componentIndex;
        if (!inputData[index]) {
            inputData[index] = {};
        }
        inputData[index].value = input.value;
    });

    // 收集表格数据
    const tableInputs = document.querySelectorAll('[data-cell-key]');
    tableInputs.forEach(input => {
        const cellKey = input.dataset.cellKey;
        const parts = cellKey.split('_');
        const componentIndex = parts[0];
        
        if (!inputData[componentIndex]) {
            inputData[componentIndex] = {};
        }
        
        inputData[componentIndex][cellKey] = input.value;
    });

    const reportData = {
        id: currentReport ? currentReport.id : null,
        templateId: currentTemplateId,
        reportName: reportName,
        reportContent: JSON.stringify({
            components: reportComponents,
            inputData: inputData
        }),
        studentId: getCurrentUserId()
    };

    const apiUrl = currentReport ? '/ems/experimentReport/update' : '/ems/experimentReport/add';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(reportData)
    })
    .then(result => {
        if (result.code === 200) {
            if (isSubmit) {
                const reportId = currentReport ? currentReport.id : result.data;
                fetch('/ems/experimentReport/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ id: reportId })
                })
                .then(result => {
                    if (result.code === 200) {
                        alert('报告提交成功');
                        showReportList();
                    } else {
                        alert('提交失败：' + result.message);
                    }
                });
            } else {
                alert('草稿保存成功');
                if (!currentReport && result.data) {
                    currentReport = { id: result.data };
                }
            }
        } else {
            alert('保存失败：' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('保存失败');
    });
}

// 预览报告
function previewReport() {
    document.getElementById('reportPreview').style.display = 'flex';
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `<h1>${document.getElementById('reportName').value}</h1>`;
    previewContent.innerHTML += document.getElementById('reportContent').innerHTML;
}

// 关闭预览
function closePreview() {
    document.getElementById('reportPreview').style.display = 'none';
}

// 打印报告
function printReport() {
    window.print();
}

// 导出Markdown
function exportMarkdown() {
    const reportId = currentReport ? currentReport.id : null;
    if (!reportId) {
        alert('请先保存报告');
        return;
    }

    fetch(`/ems/experimentReport/exportMarkdown?reportId=${reportId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('导出失败');
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const reportName = document.getElementById('reportName').value || '实验报告';
        a.download = reportName + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('导出成功');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('导出失败');
    });
}

// 查看报告
function viewReport(reportId) {
    fetch(`/ems/experimentReport/get?reportId=${reportId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            currentReport = result.data;
            const contentData = JSON.parse(result.data.reportContent);
            currentTemplateId = result.data.templateId;
            reportComponents = contentData.components || [];

            fetch(`/ems/experimentTemplate/get?templateId=${currentTemplateId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(result => {
                if (result.code === 200 && result.data) {
                    currentTemplate = result.data;
                    document.getElementById('reportName').value = currentReport.reportName;
                    renderReportEditor();
                    
                    setTimeout(() => {
                        restoreInputData(contentData.inputData || {});
                    }, 100);
                    
                    showReportEditor();
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载报告失败');
    });
}

// 获取当前用户ID
function getCurrentUserId() {
    return Auth.getUserId() || '1';
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
