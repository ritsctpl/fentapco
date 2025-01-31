package com.rits.fentapco.service;

import com.rits.fentapco.model.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> getAllNotifications();

    Notification getNotificationById(Long id);

    Notification saveNotification(Notification notification);

    void deleteNotification(Long id);

    void triggerNotification(Notification notification, Object value);
}
