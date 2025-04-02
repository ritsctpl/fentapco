package com.rits.fentapco.service.evaluation;

import org.apache.commons.jexl3.*;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class AgentConditionEvaluator {

    private final JexlEngine jexlEngine = new JexlBuilder().strict(true).create();

    public boolean evaluateCondition(Map<String, Object> inputData, String conditionExpression) {
        try {
            JexlContext context = new MapContext(inputData);
            JexlExpression expression = jexlEngine.createExpression(conditionExpression);
            Object result = expression.evaluate(context);
            boolean evaluationResult = result instanceof Boolean && (Boolean) result;

            System.out.println("✅ Evaluated Condition [" + conditionExpression + "] → " + evaluationResult);
            return evaluationResult;
        } catch (Exception e) {
            System.err.println("❌ Error evaluating condition [" + conditionExpression + "]: " + e.getMessage());
            return false;
        }
    }
}
