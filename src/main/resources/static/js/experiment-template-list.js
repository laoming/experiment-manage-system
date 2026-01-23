// 实验模板列表
let currentPage = 1;
let pageSize = 10;
let templates = [];
let searchTemplateName = '';

// 加载模板列表
function loadTemplates() {
    let url = `/ems/experimentTemplate/page?current=${currentPage}&size=${pageSize}`;
    if (searchTemplateName && searchTemplateName.trim()) {
        url += `&templateName=${encodeURIComponent(searchTemplateName)}`;
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(result => {
        if (result.code === 200 && result.data) {
            templates = result.data.records || [];
            renderTemplateList();
            renderPagination(result.data.total, result.data.pages);
        } else {
            alert('加载模板列表失败：' + (result.message || '未知错误'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('加载模板列表失败：' + (error.message || '网络错误'));
    });
}

// 渲染模板列表
function renderTemplateList() {
    const listContainer = document.getElementById('templateList');

    if (templates.length === 0) {
        listContainer.innerHTML = '<div class="empty-tip">暂无实验模板，点击上方"新建模板"开始创建</div>';
        return;
    }

    listContainer.innerHTML = templates.map(template => `
        <div class="template-card" onclick="viewTemplate('${template.id}')">
            <div class="template-card-header">
                <div class="template-card-title">${template.templateName}</div>
                <div class="template-card-actions">
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); editTemplate('${template.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteTemplate('${template.id}')">删除</button>
                </div>
            </div>
            <div class="template-card-description">${template.description || '暂无描述'}</div>
            <div class="template-card-footer">
                <span class="template-card-creator">创建者ID: ${template.creatorId}</span>
                <span class="template-card-time">${formatDate(template.updateTime)}</span>
            </div>
        </div>
    `).join('');
}

// 渲染分页
function renderPagination(total, totalPages) {
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '<div class="pagination-controls">';

    html += `<button class="btn btn-sm ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn btn-sm ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="btn btn-sm ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;

    html += '</div>';
    pagination.innerHTML = html;
}

// 切换页面
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadTemplates();
}

// 搜索模板
function searchTemplates() {
    const searchInput = document.getElementById('templateNameInput');
    searchTemplateName = searchInput.value.trim();
    currentPage = 1;
    loadTemplates();
}

// 处理搜索框回车事件
function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        searchTemplates();
    }
}

// 查看模板
function viewTemplate(templateId) {
    window.location.href = `/ems/pages/experiment-template.html?templateId=${templateId}`;
}

// 编辑模板
function editTemplate(templateId) {
    window.location.href = `/ems/pages/experiment-template.html?templateId=${templateId}`;
}

// 新建模板
function createNewTemplate() {
    window.location.href = '/ems/pages/experiment-template.html';
}

// 删除模板
function deleteTemplate(templateId) {
    if (confirm('确定要删除这个模板吗？')) {
        fetch('/ems/experimentTemplate/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ id: templateId })
        })
        .then(result => {
            if (result.code === 200) {
                alert('删除成功');
                loadTemplates();
            } else {
                alert('删除失败：' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('删除失败：' + (error.message || '网络错误'));
        });
    }
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();
});
