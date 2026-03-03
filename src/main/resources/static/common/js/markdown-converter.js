/**
 * Markdown 转换器公共工具
 * 用于实验模板和实验报告的 HTML <-> Markdown 互转
 * 
 * 依赖:
 * - marked.min.js (Markdown -> HTML)
 * - turndown.browser.umd.min.js (HTML -> Markdown)
 */

(function(global) {
    'use strict';

    // ==================== Markdown 转 HTML ====================

    /**
     * 将 Markdown 转换为 HTML
     * @param {string} markdown - Markdown 内容
     * @param {Object} options - 配置选项
     * @param {boolean} options.editable - 是否生成可编辑的表格单元格（默认 true）
     * @param {string} options.tableClass - 表格 CSS 类名（默认 'preview-table'）
     * @param {string} options.cellClass - 单元格 CSS 类名（默认 ''）
     * @param {string} options.onBlurHandler - 单元格 blur 事件处理器名称（默认 'updateTableCell'）
     * @returns {string} HTML 内容
     */
    function markdownToHtml(markdown, options) {
        options = options || {};
        var editable = options.editable !== false;
        var tableClass = options.tableClass || 'preview-table';
        var cellClass = options.cellClass || '';
        var onBlurHandler = options.onBlurHandler || 'updateTableCell';

        if (!markdown) {
            return '';
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
        processedMarkdown = processedMarkdown.replace(/^[ \t]*(?:---|\*\*\*|___)[ \t]*$/gm, function(match) {
            var dividerPlaceholder = '%%DIVIDER_' + dividerPlaceholders.length + '%%';
            dividerPlaceholders.push({});
            return '\n' + dividerPlaceholder + '\n';
        });

        // 6. 配置 marked
        if (typeof marked === 'undefined') {
            console.error('[MarkdownConverter] marked 未加载');
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
            var tableHtml = '<table class="' + tableClass + '">';
            for (var i = 0; i < tableData.rows; i++) {
                tableHtml += '<tr>';
                for (var j = 0; j < tableData.cols; j++) {
                    var cellKey = i + '-' + j;
                    var cellValue = tableData.cells[cellKey] || '';
                    var cellType = i === 0 ? 'header' : 'content';
                    var cellClassAttr = cellClass ? ' class="' + cellClass + (cellType === 'header' ? ' cell-header' : '') + '"' : '';
                    var editableAttr = editable ? ' contenteditable="true"' : '';
                    var onBlurAttr = editable && onBlurHandler ? ' onblur="' + onBlurHandler + '(this)"' : '';
                    tableHtml += '<td' + cellClassAttr + editableAttr + ' data-row="' + i + '" data-col="' + j + '" data-cell-key="' + cellKey + '" data-cell-type="' + cellType + '"' + onBlurAttr + '>' + cellValue + '</td>';
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
            html = html.replace(new RegExp('<p>%%DIVIDER_' + index + '%%</p>|%%DIVIDER_' + index + '%%', 'g'), dividerHtml);
        });

        return html;
    }

    // ==================== HTML 转 Markdown ====================

    /**
     * 初始化 Turndown 服务
     * @param {Object} options - 配置选项
     * @param {Function} options.getCellData - 自定义获取单元格数据的函数
     * @returns {Object|null} TurndownService 实例
     */
    function initTurndownService(options) {
        options = options || {};

        if (typeof TurndownService === 'undefined') {
            console.error('[MarkdownConverter] TurndownService 未加载');
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

        // 添加对填空输入框的支持（textarea 形式，用于实验报告）
        turndownService.addRule('inlineTextarea', {
            filter: function(node) {
                return node.tagName === 'TEXTAREA' && node.classList.contains('inline-textarea');
            },
            replacement: function(content, node) {
                var value = node.value || '';
                var placeholder = node.getAttribute('placeholder') || '请输入';
                return value ? '*[' + value + ']*' : '*[' + placeholder + ']*';
            }
        });

        // 添加对原始填空区域的支持（span 形式，用于模板）
        turndownService.addRule('inlineInput', {
            filter: function(node) {
                return node.classList && node.classList.contains('inline-input');
            },
            replacement: function(content, node) {
                var placeholder = node.getAttribute('data-placeholder') || '请输入';
                // 检查是否有用户填写的内容
                var inputContent = node.querySelector('.input-content');
                var value = inputContent ? inputContent.textContent : '';
                return value && value !== placeholder ? '*[' + value + ']*' : '*[' + placeholder + ']*';
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
                var propsStr = node.getAttribute('data-props') || '{}';
                var data;
                try {
                    data = JSON.parse(propsStr);
                } catch (e) {
                    data = {};
                }

                if (type === 'table') {
                    // 从 DOM 中读取最新的单元格数据
                    var cells = data.cells || {};

                    // 支持多种单元格选择器
                    var cellSelectors = [
                        '.preview-table td',
                        '.report-table td',
                        '.report-table-cell',
                        'td[data-cell-key]',
                        'td[data-row][data-col]'
                    ];

                    for (var i = 0; i < cellSelectors.length; i++) {
                        var cellElements = node.querySelectorAll(cellSelectors[i]);
                        if (cellElements.length > 0) {
                            cellElements.forEach(function(cell) {
                                var key = cell.getAttribute('data-cell-key');
                                if (!key) {
                                    var row = cell.getAttribute('data-row');
                                    var col = cell.getAttribute('data-col');
                                    if (row !== null && col !== null) {
                                        key = row + '-' + col;
                                    }
                                }
                                if (key) {
                                    cells[key] = cell.textContent || '';
                                }
                            });
                            break;
                        }
                    }

                    data.cells = cells;
                    return convertBlockToMarkdown('table', data);
                } else if (type === 'divider') {
                    return convertBlockToMarkdown('divider', data);
                } else if (type === 'image') {
                    return convertBlockToMarkdown('image', data);
                }
                return '';
            }
        });

        return turndownService;
    }

    /**
     * 将块级组件转换为 Markdown
     * @param {string} type - 组件类型
     * @param {Object} data - 组件数据
     * @returns {string} Markdown 内容
     */
    function convertBlockToMarkdown(type, data) {
        switch (type) {
            case 'table':
                var rows = parseInt(data.rows) || 2;
                var cols = parseInt(data.cols) || 3;
                var cells = data.cells || {};

                var md = '';

                // 第一行：表头
                md += '|';
                for (var j = 0; j < cols; j++) {
                    var cellKey = '0-' + j;
                    var cellValue = cells[cellKey] || '  ';
                    md += ' ' + cellValue + ' |';
                }
                md += '\n';

                // 第二行：分隔线
                md += '|';
                for (var j = 0; j < cols; j++) {
                    md += '----|';
                }
                md += '\n';

                // 数据行
                for (var i = 1; i < rows; i++) {
                    md += '|';
                    for (var j = 0; j < cols; j++) {
                        var cellKey = i + '-' + j;
                        var cellValue = cells[cellKey] || '  ';
                        md += ' ' + cellValue + ' |';
                    }
                    md += '\n';
                }

                return '\n\n' + md + '\n\n';
            case 'divider':
                return '\n\n---\n\n';
            case 'image':
                if (data.url) {
                    return '![' + (data.alt || '图片') + '](' + data.url + ')';
                }
                return '[图片]';
            default:
                return '';
        }
    }

    /**
     * 等待 TurndownService 加载完成
     * @param {number} maxWaitTime - 最大等待时间（毫秒）
     * @returns {Promise}
     */
    function waitForTurndownService(maxWaitTime) {
        maxWaitTime = maxWaitTime || 5000;
        return new Promise(function(resolve, reject) {
            if (typeof TurndownService !== 'undefined') {
                resolve();
                return;
            }

            var startTime = Date.now();
            var checkInterval = setInterval(function() {
                if (typeof TurndownService !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                } else if (Date.now() - startTime > maxWaitTime) {
                    clearInterval(checkInterval);
                    reject(new Error('TurndownService 加载超时'));
                }
            }, 100);
        });
    }

    /**
     * 将 HTML 元素转换为 Markdown（异步版本）
     * @param {HTMLElement} element - HTML 元素
     * @param {Object} options - 配置选项
     * @returns {Promise<string>} Markdown 内容
     */
    async function convertToMarkdownAsync(element, options) {
        try {
            await waitForTurndownService(5000);
        } catch (error) {
            console.error('[MarkdownConverter] TurndownService 未加载:', error.message);
            throw error;
        }

        var turndownService = initTurndownService(options);
        if (!turndownService) {
            throw new Error('无法初始化 TurndownService');
        }

        // 临时克隆元素进行转换，避免修改原始 DOM
        var cloneElement = element.cloneNode(true);

        // 清理无效的 HTML 结构：将嵌套在 <p> 标签内的块级组件移出来
        var nestedBlocks = cloneElement.querySelectorAll('p .block-component');
        nestedBlocks.forEach(function(block) {
            var parentP = block.closest('p');
            if (parentP && parentP.parentNode === cloneElement) {
                if (parentP.nextSibling) {
                    cloneElement.insertBefore(block, parentP.nextSibling);
                } else {
                    cloneElement.appendChild(block);
                }
                if (!parentP.textContent.trim() && !parentP.querySelector('br')) {
                    parentP.remove();
                }
            }
        });

        // 预处理块级组件为占位符
        var blockPlaceholders = [];
        var blockIndex = 0;

        var children = Array.from(cloneElement.childNodes);
        children.forEach(function(child) {
            if (child.nodeType === Node.ELEMENT_NODE &&
                child.classList && child.classList.contains('block-component')) {
                var type = child.getAttribute('data-type');
                var propsStr = child.getAttribute('data-props') || '{}';
                var data;
                try {
                    data = JSON.parse(propsStr);
                } catch (e) {
                    data = {};
                }

                // 从 DOM 中读取最新的单元格数据
                if (type === 'table') {
                    var cells = data.cells || {};
                    var cellElements = child.querySelectorAll('td[data-cell-key], td[data-row][data-col]');
                    cellElements.forEach(function(cell) {
                        var key = cell.getAttribute('data-cell-key');
                        if (!key) {
                            var row = cell.getAttribute('data-row');
                            var col = cell.getAttribute('data-col');
                            if (row !== null && col !== null) {
                                key = row + '-' + col;
                            }
                        }
                        if (key) {
                            cells[key] = cell.textContent || '';
                        }
                    });
                    data.cells = cells;
                }

                var md = convertBlockToMarkdown(type, data);
                var placeholder = 'BLOCKPLACEHOLDER' + blockIndex + 'BLOCKPLACEHOLDER';
                blockPlaceholders.push(md);
                blockIndex++;

                var placeholderNode = document.createTextNode('\n\n' + placeholder + '\n\n');
                cloneElement.replaceChild(placeholderNode, child);
            }
        });

        // 使用 TurndownService 转换
        var markdown = turndownService.turndown(cloneElement);

        // 还原块级组件占位符
        blockPlaceholders.forEach(function(md, index) {
            var placeholder = 'BLOCKPLACEHOLDER' + index + 'BLOCKPLACEHOLDER';
            markdown = markdown.replace(placeholder, md);
        });

        return markdown;
    }

    /**
     * 将 HTML 元素转换为 Markdown（同步版本）
     * @param {HTMLElement} element - HTML 元素
     * @param {Object} options - 配置选项
     * @returns {string} Markdown 内容
     */
    function convertToMarkdown(element, options) {
        if (typeof TurndownService === 'undefined') {
            console.error('[MarkdownConverter] TurndownService 未加载');
            return '';
        }

        var turndownService = initTurndownService(options);
        if (!turndownService) {
            return '';
        }

        return turndownService.turndown(element);
    }

    // ==================== 导出 ====================

    global.MarkdownConverter = {
        // Markdown -> HTML
        markdownToHtml: markdownToHtml,

        // HTML -> Markdown
        convertToMarkdown: convertToMarkdown,
        convertToMarkdownAsync: convertToMarkdownAsync,

        // 工具方法
        initTurndownService: initTurndownService,
        convertBlockToMarkdown: convertBlockToMarkdown,
        waitForTurndownService: waitForTurndownService
    };

})(typeof window !== 'undefined' ? window : this);
