---
title: "Применение констрейнтов для загруженного Xib в iOS"
description: "Очень часто возникает ситуация, когда необходимо переиспользовать часть интерфейса."
date: 2015-11-24T20:44:00+03:00
tags: ["ios", "xamarin", "csharp", "auto-layout"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/primenenie-konstreyntov-dlya-zagruzhennogo-xib-v-ios/"
---
Очень часто возникает ситуация, когда необходимо переиспользовать часть интерфейса. Для решения этого вопроса в iOS лучше всего подходит вынесение элемента интерфейса в отдельный Xib-файл и последующая его загрузка из кода. Когда мы грузим Xib как ячейку таблицы — он скаллируется автоматически в зависимости от размера ячейки, но если загружать и добавлять его например в произвольный контроллер или View — то могут возникнуть сложности с масштабированием View из Xib при ресайзе родительской View.

Начиная с iOS 7 Apple дает нам возможность решать вопрос масштабирования при помощи нового инструмента — Auto Layout Constraints. Но при загрузке View из кода ей не проставляются никакие констрейнты автоматически.

Выход — добавить констрейнты вручную.

Для этого после загрузки View из Xib напишем следующий код:

```csharp
//запрещаем трансляцию autoresizing mask в констрейнты (поскольку в xib-е она включена по умолчанию)
viewFromXib.TranslatesAutoresizingMaskIntoConstraints = false;

viewController.View.Add(viewFromXib);

//добавляем констрейнты для авторесайза вьюхи из xib-а после того, как мы эту вьюху добавили в иерархию родителя
NSDictionary viewDict = NSDictionary.FromObjectAndKey(viewFromXib, new NSString("viewFromXib"));
viewController.View.AddConstraints(NSLayoutConstraint.FromVisualFormat(new NSString("H:|[viewFromXib]|"), 0, null, viewDict));
viewController.View.AddConstraints(NSLayoutConstraint.FromVisualFormat(new NSString("V:|[viewFromXib]|"), 0, null, viewDict));
```
