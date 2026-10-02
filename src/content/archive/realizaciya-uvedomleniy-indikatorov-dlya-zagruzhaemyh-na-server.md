---
title: "Реализация уведомлений-индикаторов для загружаемых на сервер файлов (Android)"
description: "При необходимости загрузить файла на сервер из приложения встает вопрос об индикации процесса загрузки."
date: 2015-12-20T12:53:00+03:00
tags: ["android", "xamarin", "csharp", "notifications"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/realizaciya-uvedomleniy-indikatorov-dlya-zagruzhaemyh-na-server/"
---
При необходимости загрузить файла на сервер из приложения встает вопрос об индикации процесса загрузки. Если дизайн позволяет то можно отобразить диалог прогресс бара (при этом заблокировать интерфейс пользователя). Но на мой взгляд более интересным вариантом индикации являются уведомления в статус баре системы, которые нельзя смахнуть.

При реализации такого подхода может возникнуть несколько проблем:

1. Как создать уведомление для каждого загружаемого файла (если например существует возможность единовременно загружать несколько файлов)
2. Как программно отменить уведомление после завершения процесса загрузки на сервер

Для решения этих проблем необходимо знать как система индексирует уведомления, создаваемые приложением. Каждое приложение может создать сколь угодно много уведомлений, но чтобы иметь возможность обновить определенное уведомление, либо отменить его — необходимо присвоить каждому из уведомлений свой уникальный ID. Ниже код реализации создания уведомления при старте загрузки файла на сервер и его отмены, по окончании загрузки:

```csharp
//Кеш, хранящий список id активных на данный момент уведомлений
private List<int> _notificationCache = new List<int>();

private void UploadFile()
{
    //получим рандомный ID для уведомления, при этом он не должен пересекаться с уже существующими (для этого используем кеш)
    Random r = new Random(System.Environment.TickCount);
    int notificationId = 0;
    while (notificationId == 0 || _notificationCache.Contains(notificationId))
    {
        notificationId = r.Next(1, 1000);
    }
    _notificationCache.Add(notificationId);
    //
                
    Notification.Builder builder = new Notification.Builder(Activity);
    builder.SetSmallIcon(Resource.Drawable.file_32x32)
        //устанавливаем заголовок для уведомления
        .SetContentTitle(filename)
        //в дескрипшне будет храниться наша строка "Загружаю файл на сервер..."
        .SetContentText(Activity.GetString(Resource.String.attachement_uploading))
        .SetAutoCancel(false)
        //запрещаем отмену уведомления пользователем
        .SetOngoing(true)
        //разрешаем уведомлению появиться в статус баре, мигать светодиодом и т.п.
        .SetDefaults(NotificationDefaults.All);

    NotificationManager manager = (NotificationManager)Activity.GetSystemService(Activity.NotificationService);
    manager.Notify(notificationId, builder.Build());

    //////////////////////////////////////////
    // ... код загрузки файла на сервер ... //
    //////////////////////////////////////////

    //отменяем уведомление и удаляем его ID из кеша
    manager.Cancel(notificationId);
    _notificationCache.Remove(notificationId);
}
```
