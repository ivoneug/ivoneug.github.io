---
title: "Создание и удаление записей в календаре (iOS)"
description: "Многие приложения используют очень полезную фишку ОС от Apple как создание кастомных записей и календарей."
date: 2016-01-06T18:38:00+03:00
tags: ["ios", "xamarin", "csharp", "eventkit"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/sozdanie-i-udalenie-zapisey-v-kalendare-ios/"
---
Многие приложения используют очень полезную фишку ОС от Apple как создание кастомных записей и календарей. Сегодня мы рассмотрим пример реализации класса-хэлпера, позволяющего создавать и удалять записи в кастомном календаре.

Вся работа с календарем строится через фреймворк EventKit, при этом последовательность действий для создания записи примерно следующая:

1. Создать экземпляра класса EKEventStore
2. Запросить через него разрешение на работу с календарем
3. В completionHandler реализовать код, который будет создавать запись
4. При создании записи необходимо сначала найти наш кастомный календарь EKCalendar (или создать его, если его еще нет)
5. Создать экземпляр класса EKEvent (это и будет наша запись) и установить для него заголовок, сопроводительный текст, время начала и окончания
6. Создать и добавить ремайндер (экземпляр класса EKAlarm), который описывает когда должно сработать напоминание о записи

Более подробно можно понять, посмотрев код:

```csharp
public class EventKitCalendarHelper
{
    /// <summary>
    /// Имя кастомного календаря
    /// </summary>
    public static string CalendarTitle = "CalendarTitle";

    /// <summary>
    /// Варианты срабатывания напоминания для записи в календаре
    /// </summary>
    public enum AlarmTime
    {
        None = 0,
        FifteenMinutesBefore = -15*60,
        HalfAnHourBefore = -30*60,
        AnHourBefore = -60*60,
        TwoHoursBefore = -2*60*60,
        ThreeHoursBefore = -3*60*60
    }

    /// <summary>
    /// Добавляет запись в календаре
    /// </summary>
    /// <param name="eventTitle">Event title.</param>
    /// <param name="dateStart">Date start.</param>
    /// <param name="timeLength">Time length.</param>
    /// <param name="time">Time.</param>
    public static void AddCalendarEvent(string eventTitle, DateTime dateStart, TimeSpan timeLength, string eventNotes = "", AlarmTime time = AlarmTime.None)
    {
        if (string.IsNullOrEmpty(eventTitle))
        {
            return;
        }

        EKEventStore store = new EKEventStore();
        store.RequestAccess(EKEntityType.Event, (granted, err) =>
            {
                if (!granted)
                {
                    return;
                }

                EKEvent entry = EKEvent.FromStore(store);
                entry.Title = eventTitle;
                entry.Notes = eventNotes;
                entry.StartDate = dateStart.DateTimeToNSDate();
                entry.EndDate = dateStart.Add(timeLength).DateTimeToNSDate();

                //ищем наш кастомный календарь, если мы его не находим - создаем новый
                EKCalendar calendar = FindOrCreateCalendar(store, true);
                if(calendar == null)
                {
                    return;
                }

                entry.Calendar = calendar;

                //создаем ремайндер, если он требуется
                if (time != AlarmTime.None)
                {
                    entry.AddAlarm(EKAlarm.FromTimeInterval((int)time));
                }

                err = null;
                store.SaveEvent(entry, EKSpan.ThisEvent, out err);
            });
    }

    /// <summary>
    /// Находит или создает кастомный календарь
    /// </summary>
    /// <returns>The or create calendar.</returns>
    /// <param name="store">Store.</param>
    /// <param name="createIfDoesntExist">If set to <c>true</c> create if doesnt exist.</param>
    private static EKCalendar FindOrCreateCalendar(EKEventStore store, bool createIfDoesntExist = false)
    {
        NSError err = null;

        EKCalendar calendar = store.Calendars.Where(x => x.Title == CalendarTitle).FirstOrDefault();
        if (calendar == null && createIfDoesntExist)
        {
            err = null;
            calendar = EKCalendar.Create(EKEntityType.Event, store);
            calendar.Title = CalendarTitle;

            EKSource localSource = store.Sources.Where(x => x.SourceType == EKSourceType.Local).FirstOrDefault();
            calendar.Source = localSource;

            store.SaveCalendar(calendar, true, out err);
        }

        return calendar;
    }
}
```

С удалением событий дела обстоят интереснее. При создании события у него есть строковое поле EventIdentifier, его можно где-то сохранить и использовать позже для удаления записи. Либо можно найти все записи при помощи специальным образом сформированного предиката и удалить их. Рассмотрим второй вариант.

```csharp
/// <summary>
/// Удаляет записи в календаре, которые соответствуют выбранному интервалу времени
/// </summary>
/// <param name="dateStart">Date start.</param>
/// <param name="timeLength">Time length.</param>
public static void RemoveCalendarEvent(DateTime dateStart, TimeSpan timeLength, string title = "")
{
    EKEventStore store = new EKEventStore();
    store.RequestAccess(EKEntityType.Event, (granted, err) =>
        {
            if (!granted)
            {
                return;
            }

            //ищем наш кастомный календарь
            EKCalendar calendar = FindOrCreateCalendar(store);
            if (calendar == null)
            {
                return;
            }

            //создаем предикат для поиска эвентов в нашем календаре
            NSPredicate predicate = store.PredicateForEvents(dateStart.DateTimeToNSDate(), dateStart.Add(timeLength).DateTimeToNSDate(), new EKCalendar[]{ calendar });
            EKEvent[] entries = store.EventsMatching(predicate);

            if (entries == null || entries.Length == 0)
            {
                return;
            }

            //если нужно - профильтруем элементы календаря по заголовку
            if (!string.IsNullOrEmpty(title))
            {
                entries = entries.Where(x => x.Title == title).ToArray();
            }

            if (entries == null || entries.Length == 0)
            {
                return;
            }

            //проходимся по всем найденным эвентам и удаляем их
            foreach (EKEvent entry in entries)
            {
                err = null;
                store.RemoveEvent(entry, EKSpan.ThisEvent, true, out err);
            }
        });
}
```
