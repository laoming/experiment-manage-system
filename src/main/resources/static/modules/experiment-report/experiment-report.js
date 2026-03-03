// 实验报告
let currentTemplate = null;
let currentReport = null;
let currentTemplateId = null;
let pendingReports = [];
let submittedReports = [];

// 动态加载必要的脚本
(function() {
    // 加载 TurndownService (HTML -> Markdown)
    if (typeof TurndownService === 'undefined') {
        var turndownScript = document.createElement('script');
        turndownScript.src = '/ems/common/js/turndown.browser.umd.min.js';
        turndownScript.onload = function() {
            console.log('[REPORT] TurndownService 加载成功');
        };
        turndownScript.onerror = function() {
            console.error('[REPORT] TurndownService 加载失败');
        };
        document.head.appendChild(turndownScript);
    }
    
    // 加载 Marked (Markdown -> HTML)
    if (typeof marked === 'undefined') {
        var markedScript = document.createElement('script');
        markedScript.src = '/ems/common/js/marked.min.js';
        markedScript.onload = function() {
            console.log('[REPORT] Marked 加载成功');
        };
        markedScript.onerror = function() {
            console.error('[REPORT] Marked 加载失败');
        };
        document.head.appendChild(markedScript);
    }
    
    // 加载公共 Markdown 转换器
    if (typeof MarkdownConverter === 'undefined') {
        var converterScript = document.createElement('script');
        converterScript.src = '/ems/common/js/markdown-converter.js';
        converterScript.onload = function() {
            console.log('[REPORT] MarkdownConverter 加载成功');
        };
        converterScript.onerror = function() {
            console.error('[REPORT] MarkdownConverter 加载失败');
        };
        document.head.appendChild(converterScript);
    }
})();

// Markdown 转 HTML（使用公共转换器）
function markdownToHtml(markdown) {
    if (typeof MarkdownConverter === 'undefined') {
        console.error('[REPORT] MarkdownConverter 未加载');
        return '<p>' + (markdown || '') + '</p>';
    }
    
    // 使用公共转换器，配置为报告编辑模式
    return MarkdownConverter.markdownToHtml(markdown, {
        editable: true,
        tableClass: 'report-table',
        cellClass: 'report-table-cell'
    });
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
        console.error('[REPORT] MarkdownConverter 未加载:', error.message);
        alert('Markdown转换组件加载失败，请刷新页面重试');
        return '';
    }
    
    return await MarkdownConverter.convertToMarkdownAsync(element);
}

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
            if (!Auth.isLoggedIn()) {
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
async function loadReportOverview() {
    try {
        const result = await API.post('/experimentReport/overview', {});
        
        if (result.code === 200 && result.data) {
            const allReports = result.data || [];
            pendingReports = allReports.filter(r => r.status === 'pending' || r.status === 'draft');
            submittedReports = allReports.filter(r => r.status === 'submitted' || r.status === 'graded');
            
            vueApp.pendingCount = pendingReports.length;
            vueApp.submittedCount = submittedReports.length;
            
            renderPendingList();
            renderSubmittedList();
        } else if (result.code !== 200) {
            console.error('[REPORT] 加载报告列表失败:', result.message);
        }
    } catch (error) {
        console.error('[REPORT] 加载报告列表失败:', error);
    }
}

// 渲染待提交列表
function renderPendingList() {
    const list = document.getElementById('pendingList');

    if (!list) return;
    
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
                    <div class="report-item-name">${report.templateName || '未命名模板'}</div>
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

    if (!list) return;
    
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
                    <div class="report-item-name">${report.reportName || report.templateName || '未命名报告'}</div>
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
window.backToList = function() {
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
    document.getElementById('reportTabs').style.display = 'flex';
    currentReport = null;
    currentTemplate = null;
    currentTemplateId = null;
    loadReportOverview();
}

// 开始填写报告
window.startReport = async function(templateId) {
    currentTemplateId = templateId;
    currentReport = null;
    
    try {
        const result = await API.post(`/experimentTemplate/get?templateId=${templateId}`, {});
        
        if (result.code === 200 && result.data) {
            currentTemplate = result.data;
            document.getElementById('reportName').value = result.data.templateName;
            
            const htmlContent = markdownToHtml(result.data.templateContent);
            renderReportEditorFromHtml(htmlContent);
            showReportEditor();
        } else {
            alert('加载模板失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('[REPORT] 加载模板失败:', error);
        alert('加载模板失败');
    }
}

// 根据模板编辑报告
window.editReportByTemplate = async function(templateId, reportId) {
    currentTemplateId = templateId;
    
    try {
        const result = await API.post(`/experimentReport/get?reportId=${reportId}`, {});
        
        if (result.code === 200 && result.data) {
            currentReport = result.data;
            document.getElementById('reportName').value = result.data.reportName;
            
            const htmlContent = markdownToHtml(result.data.reportContent);
            renderReportEditorFromHtml(htmlContent);
            showReportEditor();
        } else {
            alert('加载报告失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('[REPORT] 加载报告失败:', error);
        alert('加载报告失败');
    }
}

// 渲染报告编辑器（从 HTML 内容）
function renderReportEditorFromHtml(htmlContent) {
    const content = document.getElementById('reportContent');
    
    if (!content) return;
    
    // 创建临时容器解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent || '';
    
    // 1. 将 inline-input 元素（填空区域）转换为可编辑输入框
    let inputIndex = 0;
    tempDiv.querySelectorAll('.inline-input').forEach(el => {
        const placeholder = el.getAttribute('data-placeholder') || '请输入内容';
        const existingValue = el.querySelector('.input-content')?.textContent || '';
        
        // 创建输入框替换原有的 span
        const input = document.createElement('textarea');
        input.className = 'report-form-textarea inline-textarea';
        input.setAttribute('data-input-index', inputIndex);
        input.setAttribute('placeholder', placeholder);
        input.rows = 2;
        input.style.cssText = 'display: inline-block; vertical-align: middle; min-width: 200px;';
        
        // 如果已有内容（可能是已填写的报告），设置值
        if (existingValue && existingValue !== placeholder) {
            input.value = existingValue;
        }
        
        el.replaceWith(input);
        inputIndex++;
    });
    
    // 2. 处理表格块级组件 - 确保单元格可编辑并添加事件监听
    tempDiv.querySelectorAll('.block-component[data-type="table"]').forEach(blockEl => {
        // 支持多种单元格选择器
        const cells = blockEl.querySelectorAll('.report-table-cell, .preview-table td, td[data-cell-key]');
        cells.forEach(cell => {
            cell.setAttribute('contenteditable', 'true');
            // 添加 report-table-cell 类（如果没有）
            if (!cell.classList.contains('report-table-cell')) {
                cell.classList.add('report-table-cell');
            }
            // 添加 cell-header 类给表头单元格
            const cellType = cell.getAttribute('data-cell-type');
            if (cellType === 'header' && !cell.classList.contains('cell-header')) {
                cell.classList.add('cell-header');
            }
        });
    });
    
    // 3. 处理其他块级组件（分割线、图片等）- 保持不可编辑
    tempDiv.querySelectorAll('.block-component').forEach(blockEl => {
        const type = blockEl.getAttribute('data-type');
        if (type !== 'table') {
            blockEl.classList.remove('selected');
            blockEl.removeAttribute('contenteditable');
        }
    });
    
    // 将处理后的 HTML 设置到编辑器
    content.innerHTML = tempDiv.innerHTML;
    
    // 为整个内容区域添加只读样式
    content.classList.add('report-read-only');
    
    // 4. 添加表格单元格事件监听（必须在DOM插入后）
    content.querySelectorAll('.block-component[data-type="table"]').forEach(blockEl => {
        const cells = blockEl.querySelectorAll('.report-table-cell, td[data-cell-key]');
        cells.forEach(cell => {
            cell.addEventListener('blur', function() {
                updateReportTableCell(blockEl, this);
            });
        });
    });
    
    // 渲染 MathJax 公式
    if (window.MathJax) {
        MathJax.typesetPromise([content]);
    }
}

// 更新报告表格单元格数据
function updateReportTableCell(blockEl, cell) {
    const propsStr = blockEl.getAttribute('data-props') || '{}';
    let props;
    try {
        props = JSON.parse(propsStr);
    } catch (e) {
        props = { rows: 3, cols: 3, cells: {} };
    }
    
    if (!props.cells) {
        props.cells = {};
    }
    
    // 支持多种属性获取单元格键值
    let cellKey = cell.getAttribute('data-cell-key');
    if (!cellKey) {
        const row = cell.getAttribute('data-row');
        const col = cell.getAttribute('data-col');
        if (row !== null && col !== null) {
            cellKey = row + '-' + col;
        }
    }
    
    if (cellKey) {
        props.cells[cellKey] = cell.textContent;
        blockEl.setAttribute('data-props', JSON.stringify(props));
    }
}

// 显示报告编辑器
function showReportEditor() {
    document.getElementById('templateSelector').style.display = 'none';
    document.getElementById('reportEditor').style.display = 'flex';
    document.getElementById('reportPreview').style.display = 'none';
    document.getElementById('pendingContainer').style.display = 'none';
    document.getElementById('submittedContainer').style.display = 'none';
    document.getElementById('reportTabs').style.display = 'none';
}

// 保存草稿
window.saveDraft = function() {
    saveReport(false);
}

// 提交报告
window.submitReport = function() {
    if (confirm('确定要提交报告吗？提交后将不能修改。')) {
        saveReport(true);
    }
}

// 保存报告（使用 Markdown 格式）
window.saveReport = async function(isSubmit) {
    const reportName = document.getElementById('reportName').value;

    if (!reportName.trim()) {
        alert('请输入报告名称');
        return;
    }

    const reportContentEl = document.getElementById('reportContent');
    
    // 转换为 Markdown 格式
    const markdownContent = await convertToMarkdownAsync(reportContentEl);
    
    if (markdownContent === '' && reportContentEl.innerHTML.trim() !== '') {
        console.error('[REPORT] Markdown 转换失败');
        alert('保存失败：Markdown 转换错误');
        return;
    }

    const reportData = {
        id: currentReport ? currentReport.id : null,
        templateId: currentTemplateId,
        reportName: reportName,
        reportContent: markdownContent,
        studentId: Auth.getUserId() || '1'
    };

    const apiUrl = currentReport ? '/experimentReport/update' : '/experimentReport/add';

    try {
        const result = await API.post(apiUrl, reportData);
        
        if (result.code === 200) {
            if (isSubmit) {
                const reportId = currentReport ? currentReport.id : result.data;
                const submitResult = await API.post('/experimentReport/submit', { id: reportId });
                
                if (submitResult.code === 200) {
                    alert('报告提交成功');
                    showReportList();
                } else {
                    alert('提交失败：' + (submitResult.message || '未知错误'));
                }
            } else {
                alert('草稿保存成功');
                if (!currentReport && result.data) {
                    currentReport = { id: result.data };
                }
            }
        } else {
            alert('保存失败：' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('[REPORT] 保存报告失败:', error);
        alert('保存失败');
    }
}

// 预览报告
window.previewReport = function() {
    const previewEl = document.getElementById('reportPreview');
    const previewContent = document.getElementById('previewContent');
    
    if (!previewEl || !previewContent) return;
    
    previewEl.style.display = 'flex';
    previewContent.innerHTML = `<h1>${document.getElementById('reportName').value}</h1>`;
    previewContent.innerHTML += document.getElementById('reportContent').innerHTML;
    
    // 渲染公式
    if (window.MathJax) {
        MathJax.typesetPromise([previewContent]);
    }
}

// 关闭预览
window.closePreview = function() {
    const previewEl = document.getElementById('reportPreview');
    if (previewEl) {
        previewEl.style.display = 'none';
    }
}

// 打印报告
window.printReport = function() {
    window.print();
}

// 导出 Markdown（直接下载当前内容）
window.exportMarkdown = async function() {
    const reportName = document.getElementById('reportName').value || '实验报告';
    const reportContentEl = document.getElementById('reportContent');
    
    // 转换为 Markdown 格式
    const markdownContent = await convertToMarkdownAsync(reportContentEl);
    
    let markdown = `# ${reportName}\n\n`;
    markdown += markdownContent;
    
    console.log('[REPORT] 导出Markdown:', markdown);
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportName + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('导出成功');
}

// 查看报告
window.viewReport = async function(reportId) {
    try {
        const result = await API.post(`/experimentReport/get?reportId=${reportId}`, {});
        
        if (result.code === 200 && result.data) {
            currentReport = result.data;
            currentTemplateId = result.data.templateId;
            document.getElementById('reportName').value = result.data.reportName;
            
            const htmlContent = markdownToHtml(result.data.reportContent);
            renderReportEditorFromHtml(htmlContent);
            showReportEditor();
        } else {
            alert('加载报告失败: ' + (result.message || '未知错误'));
        }
    } catch (error) {
        console.error('[REPORT] 加载报告失败:', error);
        alert('加载报告失败');
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
