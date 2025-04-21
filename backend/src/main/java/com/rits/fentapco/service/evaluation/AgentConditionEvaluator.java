 package com.rits.fentapco.service.evaluation;

// import org.apache.commons.jexl3.*;
// import org.springframework.stereotype.Service;
// import java.util.Map;

// @Service
// public class AgentConditionEvaluator {

//     private final JexlEngine jexlEngine = new JexlBuilder().strict(true).create();

//     public boolean evaluateCondition(Map<String, Object> inputData, String conditionExpression) {
//         try {
//             JexlContext context = new MapContext(inputData);
//             JexlExpression expression = jexlEngine.createExpression(conditionExpression);
//             Object result = expression.evaluate(context);
//             boolean evaluationResult = result instanceof Boolean && (Boolean) result;

//             System.out.println("✅ Evaluated Condition [" + conditionExpression + "] → " + evaluationResult);
//             return evaluationResult;
//         } catch (Exception e) {
//             System.err.println("❌ Error evaluating condition [" + conditionExpression + "]: " + e.getMessage());
//             return false;
//         }
//     }
// }


import java.util.Map;

import org.apache.commons.jexl3.JexlBuilder;
import org.apache.commons.jexl3.JexlContext;
import org.apache.commons.jexl3.JexlEngine;
import org.apache.commons.jexl3.JexlExpression;
import org.apache.commons.jexl3.MapContext;
import org.springframework.stereotype.Service;
// public class AgentConditionEvaluator {

//     private final JexlEngine jexlEngine = new JexlBuilder().strict(true).create();

//     // ✅ Method 1: Evaluate condition (expects true/false)
//     public boolean evaluateCondition(Map<String, Object> inputData, String conditionExpression) {
//         try {
//             JexlContext context = new MapContext(inputData);
//             JexlExpression expression = jexlEngine.createExpression(conditionExpression);
//             Object result = expression.evaluate(context);
//             boolean evaluationResult = result instanceof Boolean && (Boolean) result;

//             System.out.println("✅ Evaluated Condition [" + conditionExpression + "] → " + evaluationResult);
//             return evaluationResult;
//         } catch (Exception e) {
//             System.err.println("❌ Error evaluating condition [" + conditionExpression + "]: " + e.getMessage());
//             return false;
//         }
//     }

//     // ✅ Method 2: Evaluate expression (can return String, Number, etc.)
//     public String evaluateExpression(Map<String, Object> inputData, String expressionString) {
//         try {
//             JexlContext context = new MapContext(inputData);
//             JexlExpression expression = jexlEngine.createExpression(expressionString);
//             Object result = expression.evaluate(context);

//             System.out.println("✅ Evaluated Expression [" + expressionString + "] → " + result);
//             return result != null ? result.toString() : null;
//         } catch (Exception e) {
//             System.err.println("❌ Error evaluating expression [" + expressionString + "]: " + e.getMessage());
//             return null;
//         }
//     }
// }
@Service
public class AgentConditionEvaluator {

    private final JexlEngine jexlEngine = new JexlBuilder().strict(true).create();

    public Object evaluate(Map<String, Object> inputData, String expressionString) {
        try {
            JexlContext context = new MapContext(inputData);
            JexlExpression expression = jexlEngine.createExpression(expressionString);
            Object result = expression.evaluate(context);

            System.out.println("✅ Evaluated Expression [" + expressionString + "] → " + result);
            return result;
        } catch (Exception e) {
            System.err.println("❌ Error evaluating expression [" + expressionString + "]: " + e.getMessage());
            return null;
        }
    }
}


