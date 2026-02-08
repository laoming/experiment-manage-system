// 实验报告
let currentTemplate = null;
let currentReport = null;
let reportComponents = [];
let currentTemplateId = null;

const app = Vue.createApp({
    data() {
        return {
            showUserProfileModal: false,
            userProfileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
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
        openUserProfileModal() {
            const userInfo = Auth.getUserInfo();
            this.userProfileForm = {
                username: userInfo.username || '',
                displayName: userInfo.displayName || '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showUserProfileModal = true;
        },
        closeUserProfileModal() {
            this.showUserProfileModal = false;
            this.userProfileForm = {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        },
        async handleUserProfileSubmit() {
            if (!this.userProfileForm.displayName.trim()) {
                alert('请输入用户名称');
                return;
            }

            if (this.userProfileForm.newPassword || this.userProfileForm.oldPassword) {
                if (!this.userProfileForm.oldPassword) {
                    alert('请输入旧密码');
                    return;
                }
                if (!this.userProfileForm.newPassword) {
                    alert('请输入新密码');
                    return;
                }
                if (this.userProfileForm.newPassword !== this.userProfileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                if (this.userProfileForm.newPassword.length < 6) {
                    alert('新密码长度不能少于6位');
                    return;
                }
            }

            try {
                const response = await fetch('/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.userProfileForm.username,
                        displayName: this.userProfileForm.displayName
                    })
                });

                if (response.code === 200) {
                    if (this.userProfileForm.newPassword) {
                        const passwordResponse = await fetch('/user/resetPassword', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: this.userProfileForm.username,
                                password: this.userProfileForm.newPassword
                            })
                        });

                        if (passwordResponse.code === 200) {
                            alert('个人信息和密码修改成功，请重新登录');
                            Auth.logout();
                        } else {
                            alert('密码修改失败：' + (passwordResponse.message || '未知错误'));
                        }
                    } else {
                        alert('个人信息修改成功');
                        this.closeUserProfileModal();
                    }
                } else {
                    alert('个人信息修改失败：' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('修改个人信息失败:', error);
                alert('修改失败：' + (error.message || '网络错误，请稍后重试'));
            }
        }
    }
});

app.component('header-component', HeaderComponent);
app.mount('#app');

// 初始化
function init() {
    showTemplateSelector();
}

// 显示模板选择器
function showTemplateSelector() {
    document.getElementById('templateSelector').style.display = 'block';
    document.getElementById('reportEditor').style.display = 'none';
    document.getElementById('reportPreview').style.display = 'none';
    document.getElementById('reportListContainer').style.display = 'none';
    loadTemplates();
}

// 显示报告列表
function showReportList() {
    document.getElementById('templateSelector').style.display = 'none';
    document.getElementById('reportEditor').style.display = 'none';
    document.getElementById('reportPreview').style.display = 'none';
    document.getElementById('reportListContainer').style.display = 'block';
    loadReports();
}

// 加载模板列表
function loadTemplates() {
    fetch('/ems/experimentTemplate/page?current=1&size=100', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200 && result.data) {
            renderTemplateGrid(result.data.records || []);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板列表失败');
    });
}

// 渲染模板网格
function renderTemplateGrid(templates) {
    const grid = document.getElementById('templateGrid');

    if (templates.length === 0) {
        grid.innerHTML = '<div class="empty-tip" style="grid-column: 1/-1;">暂无可用模板</div>';
        return;
    }

    grid.innerHTML = templates.map(template => `
        <div class="template-card" onclick="selectTemplate('${template.id}')">
            <div class="template-card-title">${template.templateName}</div>
            <div class="template-card-description">${template.description || '暂无描述'}</div>
            <div class="template-card-footer">
                <span class="template-card-creator">创建者ID: ${template.creatorId}</span>
                <span class="template-card-time">${formatDate(template.updateTime)}</span>
            </div>
        </div>
    `).join('');
}

// 选择模板
function selectTemplate(templateId) {
    fetch(`/ems/experimentTemplate/get?templateId=${templateId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200 && result.data) {
            currentTemplate = result.data;
            currentTemplateId = templateId;
            reportComponents = JSON.parse(result.data.templateContent);
            renderReportEditor();
            showReportEditor();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板失败');
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
            html += `<label class="component-label">文本内容</label>`;
            html += `<div class="component-content">${data.content || ''}</div>`;
            break;

        case 'table':
            html += `<label class="component-label">表格</label>`;
            html += `<div class="component-content">`;
            const rows = parseInt(data.rows) || 0;
            const cols = parseInt(data.cols) || 0;
            if (rows > 0 && cols > 0) {
                html += `<table border="1" style="border-collapse: collapse; width: 100%;">`;
                for (let i = 0; i < rows; i++) {
                    html += '<tr>';
                    for (let j = 0; j < cols; j++) {
                        html += `<td style="padding: 8px; min-width: 100px;"><input type="text" data-cell-key="cell_${i}_${j}" style="width: 100%; border: none; outline: none;" placeholder="填写内容"></td>`;
                    }
                    html += '</tr>';
                }
                html += '</table>';
            }
            html += `</div>`;
            break;

        case 'input':
            html += `<label class="component-label">${data.label || '问题'}</label>`;
            html += `<div class="component-content">`;
            html += `<textarea class="form-textarea" rows="4" placeholder="${data.placeholder || '请输入内容'}" data-component-index="${index}"></textarea>`;
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
    document.getElementById('reportListContainer').style.display = 'none';
}

// 返回模板选择
function backToTemplates() {
    if (confirm('返回将不保存当前编辑内容，确定要返回吗？')) {
        showTemplateSelector();
    }
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
        const [componentIndex, row, col] = cellKey.split('_');
        
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
    .then(response => response.json())
    .then(result => {
        if (result.code === 200) {
            alert(isSubmit ? '报告提交成功' : '草稿保存成功');

            if (isSubmit) {
                const reportId = result.data.id || currentReport.id;
                fetch('/ems/experimentReport/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({ id: reportId })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.code === 200) {
                        alert('报告提交成功');
                        showReportList();
                    } else {
                        alert('提交失败：' + result.message);
                    }
                });
            } else {
                currentReport = result.data;
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

// 加载报告列表
function loadReports() {
    fetch(`/ems/experimentReport/page?current=1&size=20&studentId=${getCurrentUserId()}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200 && result.data) {
            renderReportList(result.data.records || []);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载报告列表失败');
    });
}

// 渲染报告列表
function renderReportList(reports) {
    const list = document.getElementById('reportList');

    if (reports.length === 0) {
        list.innerHTML = '<div class="empty-tip">暂无实验报告</div>';
        return;
    }

    list.innerHTML = reports.map(report => {
        let status = 'draft';
        let statusText = '草稿';

        if (report.submitTime) {
            status = 'submitted';
            statusText = '已提交';
        }

        if (report.score !== null && report.score !== undefined) {
            status = 'graded';
            statusText = '已评分';
        }

        return `
            <div class="report-item">
                <div class="report-item-info">
                    <div class="report-item-name">${report.reportName}</div>
                    <div class="report-item-meta">
                        提交时间: ${report.submitTime ? formatDate(report.submitTime) : '未提交'}
                    </div>
                </div>
                <div class="report-item-status ${status}">${statusText}</div>
                <div class="report-item-actions">
                    ${!report.submitTime ? `<button class="btn btn-sm btn-secondary" onclick="editReport('${report.id}')">编辑</button>` : ''}
                    <button class="btn btn-sm btn-primary" onclick="viewReport('${report.id}')">查看</button>
                    ${!report.submitTime ? `<button class="btn btn-sm btn-danger" onclick="deleteReport('${report.id}')">删除</button>` : ''}
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

// 编辑报告
function editReport(reportId) {
    fetch(`/ems/experimentReport/get?reportId=${reportId}`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.code === 200 && result.data) {
            currentReport = result.data;
            const contentData = JSON.parse(result.data.reportContent);

            // 恢复报告数据
            currentTemplateId = result.data.templateId;
            reportComponents = contentData.components || [];

            // 加载模板
            fetch(`/ems/experimentTemplate/get?templateId=${currentTemplateId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.code === 200 && result.data) {
                    currentTemplate = result.data;
                    document.getElementById('reportName').value = result.data.reportName;
                    renderReportEditor();

                    // 恢复输入数据
                    setTimeout(() => {
                        const inputData = contentData.inputData || {};
                        Object.keys(inputData).forEach(index => {
                            const input = document.querySelector(`[data-component-index="${index}"]`);
                            if (input) {
                                input.value = inputData[index].value;
                            }
                        });

                        // 恢复表格数据
                        Object.keys(inputData).forEach(index => {
                            const data = inputData[index];
                            Object.keys(data).forEach(key => {
                                if (key.startsWith('cell_')) {
                                    const tableInput = document.querySelector(`[data-cell-key="${key}"]`);
                                    if (tableInput) {
                                        tableInput.value = data[key];
                                    }
                                }
                            });
                        });
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

// 查看报告
function viewReport(reportId) {
    editReport(reportId);
}

// 删除报告
function deleteReport(reportId) {
    if (confirm('确定要删除这个报告吗？')) {
        fetch('/ems/experimentReport/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ id: reportId })
        })
        .then(response => response.json())
        .then(result => {
            if (result.code === 200) {
                alert('删除成功');
                loadReports();
            } else {
                alert('删除失败：' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败');
        });
    }
}

// 新建报告
function createNewReport() {
    showTemplateSelector();
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


