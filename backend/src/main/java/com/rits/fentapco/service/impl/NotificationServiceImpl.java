package com.rits.fentapco.service.impl;

import java.util.List;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rits.fentapco.model.Notification;
import com.rits.fentapco.repository.NotificationRepository;
import com.rits.fentapco.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private ProducerTemplate producerTemplate;

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public void triggerNotification(Notification notification, Object value) {
        String condition = notification.getCondition(); // e.g., "value > 50"
        if (evaluateCondition(condition, value)) {
            performAction(notification, value);
        }
    }

    /**
     * Evaluates a condition using a scripting engine.
     *
     * @param condition The condition to evaluate (e.g., "value > 50").
     * @param value     The current value to evaluate against the condition.
     * @return True if the condition is met; false otherwise.
     */
    private boolean evaluateCondition(String condition, Object value) {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("JavaScript");

        try {
            engine.put("value", value); // Pass the value to the script
            return (boolean) engine.eval(condition);
        } catch (ScriptException e) {
            System.err.println("Failed to evaluate condition: " + condition);
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Performs the action defined in the notification.
     *
     * @param notification The notification containing the action details.
     * @param value        The value that triggered the action.
     */
    private void performAction(Notification notification, Object value) {
        String actionType = notification.getActionType(); // e.g., "log", "email", "camelRoute"

        switch (actionType.toLowerCase()) {
            case "log":
                System.out.println("Triggered notification: " + notification.getName() + " with value: " + value);
                break;

            case "camelroute":
                triggerCamelRoute(notification, value);
                break;

            case "email":
                sendEmail(notification, value);
                break;

            default:
                System.err.println("Unsupported action type: " + actionType);
        }
    }

    /**
     * Triggers a Camel route for the notification.
     *
     * @param notification The notification with Camel route details.
     * @param value        The value that triggered the route.
     */
    private void triggerCamelRoute(Notification notification, Object value) {
        String routeUri = notification.getRouteUri(); // e.g., "direct:myRoute"
        try {
            producerTemplate.sendBody(routeUri, value);
            System.out.println("Triggered Camel route: " + routeUri + " with value: " + value);
        } catch (Exception e) {
            System.err.println("Failed to trigger Camel route: " + routeUri);
            e.printStackTrace();
        }
    }

    /**
     * Sends an email as part of the notification action.
     *
     * @param notification The notification with email details.
     * @param value        The value that triggered the email.
     */
    private void sendEmail(Notification notification, Object value) {
        // Placeholder for email sending logic
        System.out.println("Sending email for notification: " + notification.getName() + " with value: " + value);
    }
}
