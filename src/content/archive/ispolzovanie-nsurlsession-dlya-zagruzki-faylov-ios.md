---
title: "Использование NSUrlSession для загрузки файлов (iOS)"
description: "При разработке мобильного приложения очень часто возникает необходимость организовать загрузку файла по сети."
date: 2016-01-03T10:53:00+03:00
tags: ["ios", "xamarin", "csharp", "nsurlsession"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/ispolzovanie-nsurlsession-dlya-zagruzki-faylov-ios/"
---
При разработке мобильного приложения очень часто возникает необходимость организовать загрузку файла по сети. При этом если разработка ведется на Xamarin высоко желание использовать стандартный WebClient для этих целей. Все бы ничего, но при использовании WebClient возникает несколько сложностей, например:

1. Не высокая производительность
2. Прерывание загрузки при блокировке устройства или уходе приложения в бекграунд

Для решения вопроса с загрузкой файлов наиболее правильным способом будет кардинально переписать загрузку на использование NSUrlSession.

NSUrlSession — это системный механизм iOS, позволяющий организовать длительные процессы загрузки и заливки данных по сети, при этом система сама правильно обработает обрывы связи, докачает файл, если это возможно и уведомит приложение о результате.

Чтобы использовать NSUrlSession нам потребуется сделать следующее:

1. Создать класс-хэлпер, который будет инкапсулировать всю логику работы с NSUrlSession
2. Создать класс-делегат наследник NSUrlSessionDownloadDelegate, который будет уведомлять внешний код о прогрессе загрузки файла, а так же об окончании загрузки
3. Создать экземпляр класса NSUrlSession и присвоить ему делегат
4. Для каждого URL файла создать NSUrlRequest и NSUrlSessionDownloadTask, и запустить скачивание
5. Так же необходимо позаботиться о том, чтобы не потерять информацию о том, какому Url соответствует какой NSUrlSessionDownloadTask, чтобы потом корректно сообщать внешнему коду о ходе скачивания

Далее код готового решения с комментариями о деталях реализации:

```csharp
/// <summary>
/// Класс, который реализует всю работу с механизмом NSUrlSession для реализации загрузки файлов в фоновом режиме
/// </summary>
public class DownloadSession
{
    /// <summary>
    /// Создаем экземпляр конфигурации для сессии (с таким ID сессия может быть только одна в приложении)
    /// </summary>
    private static NSUrlSessionConfiguration _downloadConfiguration = NSUrlSessionConfiguration.BackgroundSessionConfiguration("com.appid.background.download");

    /// <summary>
    /// Класс-делегат, инкапсулирует всю логику по уведомлению внешнего кода о состоянии загрузки, а так же занимается менеджментом хранения ссылок на скачиваемые файлы
    /// </summary>
    public sealed class ChatBackgroundSessionDelegate : NSUrlSessionDownloadDelegate
    {
        /// <summary>
        /// Словарь, который хранит соответствие - таск загрузки <--> url файла
        /// </summary>
        public Dictionary<NSUrlSessionDownloadTask, string> QueueHolder { get; private set; }

        public delegate void DownloadingCompleteDelegate(string url, NSUrl tempFileLocation);
        public delegate void DownloadProgressDelegate(string url, int progressPercent);

        /// <summary>
        /// Экшн, который будет вызываться при окончании загрузки файла (в параметрах будут url файла и NSUrl на временный скачанный файл)
        /// </summary>
        public DownloadingCompleteDelegate CompleteAction { get{ return _completeAction; } set{ _completeAction = value; } }
        private DownloadingCompleteDelegate _completeAction;

        /// <summary>
        /// Экшн, который будет вызываться при изменении прогресса скачивания файла (в параметрах будет url файла и процент скачивания)
        /// </summary>
        public DownloadProgressDelegate ProgressDelegate { get{ return _progressDelegate; } set{ _progressDelegate = value; } }
        private DownloadProgressDelegate _progressDelegate;

        /// <summary>
        /// Конструктор, который создает словарь-очередь и присваивает все необходимые экшны
        /// </summary>
        public ChatBackgroundSessionDelegate(DownloadingCompleteDelegate downloadCompleteAction, DownloadProgressDelegate progressDelegate = null)
        {
            _completeAction = downloadCompleteAction;
            _progressDelegate = progressDelegate;

            QueueHolder = new Dictionary<NSUrlSessionDownloadTask, string>();
        }

        /// <summary>
        /// Метод, вызывается системой при изменении прогресса скачивания файлов
        /// </summary>
        public override void DidWriteData (NSUrlSession session, NSUrlSessionDownloadTask downloadTask, long bytesWritten, long totalBytesWritten, long totalBytesExpectedToWrite)
        {
            if (_progressDelegate == null || !QueueHolder.ContainsKey(downloadTask))
            {
                return;
            }

            //если в очереди найден такой файл и экшн был передан извне - то вызываем экшн в основном потоке и вычисляем процент скачивания файла
            InvokeOnMainThread(() =>
                {
                    _progressDelegate.Invoke(QueueHolder[downloadTask], Convert.ToInt32(totalBytesWritten * 100 / totalBytesExpectedToWrite));
                });
        }

        /// <summary>
        /// Метод, который вызывается при завершении загрузки файла
        /// </summary>
        public override void DidFinishDownloading(NSUrlSession session, NSUrlSessionDownloadTask downloadTask, NSUrl location)
        {
            if (_completeAction == null || !QueueHolder.ContainsKey(downloadTask))
            {
                return;
            }

            InvokeOnMainThread(() =>
                {
                    _completeAction.Invoke(QueueHolder[downloadTask], location);
                });
        }
    }

    private ChatBackgroundSessionDelegate _delegate;
    private NSUrlSession _downloadSession;

    /// <summary>
    /// Конструктор класса-холдера
    /// </summary>
    public DownloadSession(ChatBackgroundSessionDelegate.DownloadingCompleteDelegate downloadCompleteAction,
        ChatBackgroundSessionDelegate.DownloadProgressDelegate progressDelegate = null)
    {
        //создаем делегат
        _delegate = new ChatBackgroundSessionDelegate(downloadCompleteAction, progressDelegate);

        //создаем сессию (при этом если сессия с такой конфигурацией уже есть в системе - то новая сессия создана не будет, а в переменную попадет старая сессия)
        _downloadSession = NSUrlSession.FromConfiguration(
            _downloadConfiguration,
            _delegate,
            new NSOperationQueue());
    }

    /// <summary>
    /// Стартует процесс загрузки
    /// </summary>
    /// <param name="url">URL.</param>
    /// <param name="file">File.</param>
    /// <param name="message">Message.</param>
    public void StartDownload(string url)
    {
        if (string.IsNullOrEmpty(url))
        {
            return;
        }

        NSUrl nsurl = NSUrl.FromString(new NSString(url).CreateStringByAddingPercentEscapes(NSStringEncoding.UTF8));
        NSUrlRequest request = NSUrlRequest.FromUrl(nsurl);
        NSUrlSessionDownloadTask task = _downloadSession.CreateDownloadTask(request);

        //нужно именно попробовать создать сессию и только после этого взяь ее делегат, кастануть его к нужному типу и забиндить реквесты
        //делаем так, потому что сессия глобально в системе создается только одна и при попытке повторного ее создания - новый делегат просто не присваивается :)
        //экшны копируются из нового делегата в старый, потому что мы никак физически не можем заменить делегат (он только для чтения)
        if (_delegate != (ChatBackgroundSessionDelegate)_downloadSession.Delegate)
        {
            ChatBackgroundSessionDelegate newDelegate = (ChatBackgroundSessionDelegate)_downloadSession.Delegate;
            newDelegate.CompleteAction = _delegate.CompleteAction;
            newDelegate.ProgressDelegate = _delegate.ProgressDelegate;
        }
        _delegate = (ChatBackgroundSessionDelegate)_downloadSession.Delegate;

        //добавляем наш Url и таск в очередь
        _delegate.QueueHolder.Add(task, url);

        //стартуем загрузку
        task.Resume();
    }
}
```

Использовать все это хозяйство можно следующим образом:

```csharp
//создаем сессию загрузки данных
DownloadSession session = new DownloadSession((url, tempFileLocation) =>
    {
        //если завершена загрузка файла - сохраняем его на диск
        if (item.url == url)
        {
            /////////////////
        }
    }, (url, percent) =>
    {
        if (item.url == url)
        {
            //отображаем прогресс загрузки
        }
    });

//стартуем загрузку
session.StartDownload(item.url);
```
