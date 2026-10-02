---
title: "Запуск консольных утилит из скрипта на Swift"
description: "В процессе написания утилит на Swift бывает необходимо запустить другую консольную утилиту с параметрами."
date: 2019-02-19T19:34:00+03:00
tags: ["swift", "macos", "foundation", "cli"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/zapusk-konsolnyh-utilit-iz-skripta-na-swift/"
---
В процессе написания утилит на *Swift* бывает необходимо запустить другую консольную утилиту с параметрами. Поскольку в *Swift* доступны для использования все стандартные библиотеки *macOS* и *iOS* мы можем с легкостью это сделать, используя *API* фреймворка *Foundation*.

Предположим на нужно запустить утилиту *plutil*, которая работает с файлами *plist* на проверку определенного файла на валидность. Это можно сделать при помощи следующего кода:

```swift
//создадим экземпляр класса NSTask
let task = NSTask()

//в поле launchPath зададим путь к утилите, которую хотим запустить
task.launchPath = "/usr/bin/plutil"

//в arguments поместим массив с аргументами для plutil
task.arguments = ["-lint", path]

//создадим экземпляр NSPipe, чтобы получить результат работы plutil и позже обработать его
let pipe = NSPipe()

//наш pipe присвоим переменной standardOutput таска, чтобы он знал с каким потоком ввода/вывода работать
task.standardOutput = pipe

//синхронно стартуем таск на выполнение
task.launch()

//чтобы получить результат работы plutil достанем хэндлер файла для чтения результата и прочтем его в константу data
let data = pipe.fileHandleForReading.readDataToEndOfFile()

//последнее, что остается сделать - создать строку из данных
//используем конструкцию с проверкой на nil, чтобы не нарваться на пустое значение и не уронить наш скрипт
if let plutilResult = NSString(data: data, encoding: NSUTF8StringEncoding)
{
	print(plutilResult)
}
```
