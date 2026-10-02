---
title: "Использование QLPreviewController для просмотра файлов (iOS)"
description: "Для реализации просмотра файлов различных форматов (изображения, word, excel, txt, медиа и т. п.) в iOS существует очень удобный класс QLPreviewController."
date: 2016-01-13T22:10:00+03:00
tags: ["ios", "xamarin", "csharp", "quicklook"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/ispolzovanie-qlpreviewcontroller-dlya-prosmotra-faylov-ios/"
---
Для реализации просмотра файлов различных форматов (изображения, word, excel, txt, медиа и т. п.) в iOS существует очень удобный класс QLPreviewController. Для его удобного использования необходимо сделать следующее:

1. Создать класс-наследник QLPreviewController, который инкапсулирует все детали реализации
2. Создать класс QLPreviewControllerDataSource, который будет являться источником данных для контроллера
3. Создать классы-наследники QLPreviewItem, которые будут хранить информацию о просматриваемом элементе

Без лишних слов сразу взглянем на код контроллера

```csharp
/// <summary>
/// Контроллер, который позволяет отобразить документы (изображения, ворд, экзель, пдф и т.п.) в виде превью
/// поддерживает несколько документов для отображения
/// </summary>
public class QuickLookPreviewController : QLPreviewController
{
    /// <summary>
    /// Отобразить список NSUrl'ов
    /// </summary>
    /// <returns><c>true</c>, if urls was previewed, <c>false</c> otherwise.</returns>
    /// <param name="urls">Urls.</param>
    public bool PreviewUrls(params NSUrl[] urls)
    {
        List<QLPreviewItem> items = new List<QLPreviewItem>();
        foreach (NSUrl url in urls)
        {
            QLPreviewItemNsUrl item = new QLPreviewItemNsUrl(url);
            if (QLPreviewController.CanPreviewItem(item))
            {
                items.Add(item);
            }
        }

        return PreviewItems(items.ToArray());
    }

    /// <summary>
    /// Отобразить список QLPreviewItem
    /// </summary>
    /// <returns><c>true</c>, if items was previewed, <c>false</c> otherwise.</returns>
    /// <param name="items">Items.</param>
    public bool PreviewItems(params QLPreviewItem[] items)
    {
        if (items.Length > 0)
        {
            DataSource = new PreviewControllerDataSource(items);
            return true;
        }

        return false;
    }

    /// <summary>
    /// QL Preview источник данных
    /// </summary>
    private class PreviewControllerDataSource : QLPreviewControllerDataSource
    {
        private QLPreviewItem[] _items = new QLPreviewItem[0];

        public PreviewControllerDataSource(params QLPreviewItem[] items)
        {
            _items = items;
        }

        public override nint PreviewItemCount(QLPreviewController controller)
        {
            return _items.Length;
        }

        public override IQLPreviewItem GetPreviewItem(QLPreviewController controller, nint index)
        {
            return _items[index];
        }
    }

    /// <summary>
    /// QL Preview Item, принимающий NSUrl
    /// </summary>
    public class QLPreviewItemNsUrl : QLPreviewItem
    {
        private NSUrl _documentUrl;

        public QLPreviewItemNsUrl(NSUrl documentUrl)
        {
            _documentUrl = documentUrl;
        }

        public override string ItemTitle
        {
            get
            {
                return _documentUrl.LastPathComponent;
            }
        }
        public override NSUrl ItemUrl
        {
            get
            {
                return _documentUrl;
            }
        }
    }

    /// <summary>
    /// QL Preview Item, принимающий имя и путь к файлу из файловой системы
    /// </summary>
    public class QLPreviewItemFileSystem : QLPreviewItem
    {
        string _fileName, _filePath;

        public QLPreviewItemFileSystem(string fileName, string filePath)
        {
            _fileName = fileName;
            _filePath = filePath;
        }

        public override string ItemTitle
        {
            get
            {
                return _fileName;
            }
        }
        public override NSUrl ItemUrl
        {
            get
            {
                return NSUrl.FromFilename(_filePath);
            }
        }
    }

    /// <summary>
    /// QL Preview Item, принимающий имя ипуть к файлу из бандла
    /// </summary>
    public class QLPreviewItemBundle : QLPreviewItem
    {
        string _fileName, _filePath;
        public QLPreviewItemBundle(string fileName, string filePath)
        {
            _fileName = fileName;
            _filePath = filePath;
        }

        public override string ItemTitle
        {
            get
            {
                return _fileName;
            }
        }
        public override NSUrl ItemUrl
        {
            get
            {
                var documents = NSBundle.MainBundle.BundlePath;
                var lib = Path.Combine(documents, _filePath);
                var url = NSUrl.FromFilename(lib);
                return url;
            }
        }
    }
}
```

Использовать данный код можно следующим образом:

```csharp
QuickLookPreviewController previewController = new QuickLookPreviewController();
if (previewController.PreviewUrls(new NSUrl[]{ fileUrl }))
{
    this.NavigationController.PushViewController(previewController, true);
}
```
