package cn.gzus.lyf.service.experiment;

import cn.gzus.lyf.common.dto.PageDto;
import cn.gzus.lyf.dao.ExperimentReportDAO;
import cn.gzus.lyf.dao.entity.ExperimentReportEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class ExperimentReportService {

    private ExperimentReportDAO reportDAO;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public void setReportDAO(ExperimentReportDAO reportDAO) {
        this.reportDAO = reportDAO;
    }

    /**
     * 新增报告
     * @param reportEntity 报告实体
     * @return 是否成功
     */
    public boolean addReport(ExperimentReportEntity reportEntity) {
        return reportDAO.addReport(reportEntity);
    }

    /**
     * 删除报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean deleteReport(String reportId) {
        return reportDAO.deleteReport(reportId);
    }

    /**
     * 修改报告
     * @param reportEntity 报告实体
     * @return 是否成功
     */
    public boolean updateReport(ExperimentReportEntity reportEntity) {
        return reportDAO.updateReport(reportEntity);
    }

    /**
     * 提交报告
     * @param reportId 报告ID
     * @return 是否成功
     */
    public boolean submitReport(String reportId) {
        return reportDAO.submitReport(reportId);
    }

    /**
     * 评分
     * @param reportId 报告ID
     * @param score 分数
     * @param comment 评语
     * @return 是否成功
     */
    public boolean gradeReport(String reportId, Integer score, String comment) {
        return reportDAO.gradeReport(reportId, score, comment);
    }

    /**
     * 根据ID获取报告
     * @param reportId 报告ID
     * @return 报告实体
     */
    public ExperimentReportEntity getReportById(String reportId) {
        return reportDAO.getReportById(reportId);
    }

    /**
     * 根据模板ID获取报告列表
     * @param templateId 模板ID
     * @return 报告列表
     */
    public List<ExperimentReportEntity> getReportsByTemplateId(String templateId) {
        return reportDAO.getReportsByTemplateId(templateId);
    }

    /**
     * 分页查询报告
     * @param current 当前页码
     * @param size 每页大小
     * @param studentId 学生ID
     * @return 分页结果
     */
    public PageDto<ExperimentReportEntity> getReportPage(Integer current, Integer size, String studentId) {
        return reportDAO.getReportPage(current, size, studentId);
    }

    /**
     * 导出报告为Markdown格式
     * @param reportId 报告ID
     * @return Markdown内容
     */
    public String exportToMarkdown(String reportId) {
        ExperimentReportEntity report = reportDAO.getReportById(reportId);
        if (report == null) {
            return "";
        }

        StringBuilder markdown = new StringBuilder();
        markdown.append("# ").append(report.getReportName()).append("\n\n");

        try {
            JsonNode content = objectMapper.readTree(report.getReportContent());
            JsonNode components = content.get("components");
            JsonNode inputData = content.get("inputData");

            if (components != null && components.isArray()) {
                for (int i = 0; i < components.size(); i++) {
                    JsonNode component = components.get(i);
                    String type = component.has("type") ? component.get("type").asText() : "";
                    JsonNode data = component.get("data");

                    switch (type) {
                        case "text":
                            if (data != null && data.has("content")) {
                                String textContent = data.get("content").asText();
                                if (!textContent.isEmpty()) {
                                    markdown.append(textContent).append("\n\n");
                                }
                            }
                            break;

                        case "table":
                            if (data != null) {
                                int rows = data.has("rows") ? data.get("rows").asInt() : 0;
                                int cols = data.has("cols") ? data.get("cols").asInt() : 0;

                                if (rows > 0 && cols > 0) {
                                    markdown.append("|");
                                    for (int j = 0; j < cols; j++) {
                                        markdown.append("   |");
                                    }
                                    markdown.append("\n|");
                                    for (int j = 0; j < cols; j++) {
                                        markdown.append("---|");
                                    }
                                    markdown.append("\n");

                                    // 如果有输入数据，则使用输入数据
                                    if (inputData != null && inputData.has(String.valueOf(i))) {
                                        JsonNode cellData = inputData.get(String.valueOf(i));
                                        for (int r = 0; r < rows; r++) {
                                            markdown.append("|");
                                            for (int c = 0; c < cols; c++) {
                                                String cellKey = "cell_" + r + "_" + c;
                                                String cellValue = "";
                                                if (cellData != null && cellData.has(cellKey)) {
                                                    cellValue = cellData.get(cellKey).asText();
                                                }
                                                markdown.append(" ").append(cellValue).append(" |");
                                            }
                                            markdown.append("\n");
                                        }
                                    } else {
                                        for (int r = 0; r < rows; r++) {
                                            markdown.append("|");
                                            for (int c = 0; c < cols; c++) {
                                                markdown.append("   |");
                                            }
                                            markdown.append("\n");
                                        }
                                    }
                                    markdown.append("\n");
                                }
                            }
                            break;

                        case "input":
                            if (data != null) {
                                String label = data.has("label") ? data.get("label").asText() : "";
                                String placeholder = data.has("placeholder") ? data.get("placeholder").asText() : "";

                                if (!label.isEmpty()) {
                                    markdown.append("### ").append(label).append("\n\n");
                                }
                                if (inputData != null && inputData.has(String.valueOf(i))) {
                                    JsonNode inputNode = inputData.get(String.valueOf(i));
                                    String inputText = inputNode != null && inputNode.has("value") ? 
                                        inputNode.get("value").asText() : "";
                                    if (!inputText.isEmpty()) {
                                        markdown.append(inputText).append("\n\n");
                                    }
                                } else {
                                    markdown.append("*").append(placeholder.isEmpty() ? "待填写" : placeholder).append("*\n\n");
                                }
                            }
                            break;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }

        return markdown.toString();
    }
}
