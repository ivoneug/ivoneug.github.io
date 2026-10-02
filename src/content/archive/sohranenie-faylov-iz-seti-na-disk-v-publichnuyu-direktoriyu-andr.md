---
title: "Сохранение файлов из сети на диск в публичную директорию (Android)"
description: "Практически любому приложению, которое позволяет обмениваться контентом необходимо скачивать данные из сети и сохранять их на диск устройства."
date: 2015-12-02T22:06:00+03:00
tags: ["android", "xamarin", "csharp", "mediascanner"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/sohranenie-faylov-iz-seti-na-disk-v-publichnuyu-direktoriyu-andr/"
---
Практически любому приложению, которое позволяет обмениваться контентом необходимо скачивать данные из сети и сохранять их на диск устройства. Существует два распространенных способа это сделать:

1. Скачать и сохранить файл вручную;
2. Использовать класс *DownloadManager* и доверить работу ему.

При этом скачанные файлы не будут видны приложениям на устройстве до тех пор, пока разработчик самостоятельно не сделает их доступными (либо до следующей перезагрузке устройства).

В этой статье мы рассмотрим ручной способ сохранения на диск применительно к Xamarin.Android. Более интересный вариант с использованием *DownloadManager* будет рассмотрен в другой статье.

Для начала необходимо получить массив байт файла из сети (например по его URL). Для этого можно использовать например простейший *WebClient*, написать примерно такой код:

```csharp
string url = “url_к_нашему_файлу”;
byte[] dataBytes = new System.Net.WebClient().DownloadData(url);
```

Далее необходимо сохранить полученный массив байт как файл на диске. Для этого сначала необходимо получить путь до одной из публичных директорий, они могут быть следующими:

1. Environment.DirectoryMusic;
2. Environment.DirectoryPodcasts;
3. Environment.DirectoryRingtones;
4. Environment.DirectoryAlarms;
5. Environment.DirectoryNotifications;
6. Environment.DirectoryPictures;
7. Environment.DirectoryMovies;
8. Environment.DirectoryDownloads;
9. Environment.DirectoryDcim.

Назначение директорий вполне ясно из их названия, будем использовать *Environment.DirectoryDownloads*. Напишем следующий код (пояснение в комментариях):

```csharp
//получаем путь к директории с загрузками
string dirPath = Android.OS.Environment.GetExternalStoragePublicDirectory(Android.OS.Environment.DirectoryDownloads).AbsolutePath;
//если директории нет (такое может быть, да О_о, создадим ее)
if (!Directory.Exists(dirPath))
{
    Directory.CreateDirectory(dirPath);
}

//получаем путь до конечного файла в нашей директории, если он уже есть - удалим его
string filePath = Path.Combine(dirPath, file.Name);
if (File.Exists(filePath))
{
    File.Delete(filePath);
}

//записываем массив байт на диск
File.WriteAllBytes(filePath, fileBytes);
```

Почти готово, осталось только объявить системе о том, что на диске теперь есть новый файл, доступный всем вокруг. Для этого используется подсистема Android, которая называется *MediaScanner*. Существует несколько способов работы с МедиаСканнером, все они обладают разным уровнем гибкости и сложности. Мы воспользуемся самым простым — отправим широковещательный интент системе, МедиаСканнер его поймает и сделает добавит файл в свою базу.

```csharp
//объявим МедиаСканеру о том, что появился новый файл
Intent mediaScannerIntent = new Intent(Intent.ActionMediaScannerScanFile);
mediaScannerIntent.SetData(Android.Net.Uri.FromFile(new Java.IO.File(filePath)));
SendBroadcast(mediaScannerIntent);
```
