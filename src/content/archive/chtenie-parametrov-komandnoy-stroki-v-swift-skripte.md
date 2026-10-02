---
title: "Чтение параметров командной строки в Swift-скрипте"
description: "При запуске программ на Swift из командной строки бывает необходимо передать параметры скрипту. Это удобно, когда нужно специфицировать поведение программы."
date: 2019-02-19T19:12:00+03:00
tags: ["swift", "macos", "cli"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/chtenie-parametrov-komandnoy-stroki-v-swift-skripte/"
---
При запуске программ на *Swift* из командной строки бывает необходимо передать параметры скрипту. Это удобно, когда нужно специфицировать поведение программы. Например заставить ее просканировать все дерево каталогов на наличие файлов, либо указать на конкретный файл для обработки.

Для этих целей в стандартной библиотеке *Swift* существует класс *Process*, который содержит массив строк, под названием *arguments*. Следующий код выведет все аргументы, переданные скрипту:

```swift
for argument in Process.arguments
{
	print(argument);
}
```

При этом первым аргументом будет передан путь к файлу скрипта и его имя.

Посмотрим, что будет содержаться в массиве arguments если вызвать скрипт следующим способом:

```bash
./script.swift -- /simple/path/to/directory file_name_to_find
```

Тогда содержимое Process.arguments будет следующим:

```text
Process.arguments[0] = “./script.swift”
Process.arguments[1] = “--”
Process.arguments[2] = “/simple/path/to/directory”
Process.arguments[3] = “file_name_to_find”
```
