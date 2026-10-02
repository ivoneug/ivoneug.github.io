---
title: "Использование DownloadManager для скачивания файлов из сети (Android)"
description: "Сегодня же хотелось бы рассказать о более интересном и предпочтительном способе скачивания файлов — использовании системного сервиса DownloadManager."
date: 2015-12-07T22:12:00+03:00
tags: ["android", "xamarin", "csharp", "downloadmanager"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/ispolzovanie-downloadmanager-dlya-skachivaniya-faylov-iz-seti-an/"
---
В прошлой статье я рассказывал о том, как скачивать файлы из сети и сохранять их на диск, а так же использовать *MediaScanner* для того, чтобы сделать файлы доступными другим приложениям (например галерее, если это фотография или видео).

Сегодня же хотелось бы рассказать о более интересном и предпочтительном способе скачивания файлов — использовании системного сервиса *DownloadManager*.

DownloadManager это такой сервис платформы Android, который предоставляет весь спектр функциональности, связанной с загрузкой файлов. Он сам начнет скачивание, корректно отреагирует на обрыв связи или смену типа сети, запустит скачивание по новой (если был обрыв связи), создаст и отобразит уведомление о загрузке файла, уведомит *MediaScanner* о том, что файл загружен и многое другое.

Для корректного использования *DownloadManager* нам понадобится:

1. Создать свой класс — наследник *BroadcastReceiver*, в котором мы будем реагировать на интенты, отсылаемые *DownloadManager*’ом;
2. Подготовить URI с ресурсом, который нужно загрузить;
3. Создать реквест с нашим URI и другими настройками *DownloadManager*;
4. Запустить скачивание.

Итак перво наперво — напишем класс-наследник *BroadcastReceiver* и реализуем логику, которая покажет Toast, когда наш файл скачается:

```csharp
/// <summary>
/// Ресивер, который принимает информацию о состоянии загружаемых файлов приложением (задача только одна - отобразить сообщение об успешной загрузке)
/// </summary>
public class DownloadManagerReceiver : BroadcastReceiver
{
    public override void OnReceive(Context context, Intent intent)
    {
        if (intent.Action == DownloadManager.ActionDownloadComplete)
        {
            //это не совсем правильно с точки зрения производительности, лучше передать ссылку на менеджер извне
            DownloadManager downloadManager = (DownloadManager)context.GetSystemService(Activity.DownloadService);

            long downloadId = intent.GetLongExtra(DownloadManager.ExtraDownloadId, -1);
            if (downloadId == -1)
            {
                return;
            }

            DownloadManager.Query query = new DownloadManager.Query();
            query.SetFilterById(new long[]{ downloadId });

            ICursor cursor = downloadManager.InvokeQuery(query);
            if (cursor != null && cursor.MoveToFirst())
            {
                if (DownloadStatus.Successful == (DownloadStatus)cursor.GetInt(cursor.GetColumnIndex(DownloadManager.ColumnStatus)))
                {
                    string filename = cursor.GetString(cursor.GetColumnIndex(DownloadManager.ColumnTitle));
                    
                    Toast.makeText(context, string.Format(context.GetString(Resource.String.chat_attachement_succesfully_downloaded), filename), Toast.LENGTH_SHORT);
                }
            }

        }
    }
}
```

Далее необходимо создать и зарегистрировать наш ресивер:

```csharp
protected override async void OnCreate(Bundle bundle)
{
    //код инициализации активности
    //...
    /////////

    //создаем ресивер для корректной обработки успешного скачивания файла
    _downloadManagerReceiver = new DownloadManagerReceiver();
    RegisterReceiver(_downloadManagerReceiver, new IntentFilter(DownloadManager.ActionDownloadComplete));
}
```

Последним этапом — необходимо получить ссылку на экземпляр сервиса *DownloadService*, настроить менеджер и запустить скачивание:

```csharp
private void DownloadFile(string filename){
    DownloadManager downloadManager = (DownloadManager)GetSystemService(Activity.DownloadService);
    //реквест содержит URI файла и дополнительные настройки DownloadManager'а
    DownloadManager.Request request = new DownloadManager.Request(Android.Net.Uri.Parse("http://наш_url_для_скачивания"));

    //нотификейшн будет виден всегда, пока юзер не отменит его вручную или не кликнет
    request.SetNotificationVisibility(DownloadVisibility.VisibleNotifyCompleted);
    //задаем публичную директорию с загрузками и вторым параметром имя файла + расширение
    request.SetDestinationInExternalPublicDir(Android.OS.Environment.DirectoryDownloads, filename);
    //разрешаем сканить новый файл МедиаСканнеру
    request.AllowScanningByMediaScanner();

    //запускаем скачивание
    downloadManager.Enqueue(request);   
}
```

Вот и все, после старта скачивания менеджер создать нотификейшн со статусом скачивания, а после позволит открыть файл в приложении по-умолчанию.
