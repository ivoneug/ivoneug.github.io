---
title: "Получение информации о состоянии батареи в MacOS (выполнением консольной команды)"
description: "После обновления MacOS до Sierra я столкнулся с проблемой — в статус баре исчезла информация об оставшемся времени работы от батареи."
date: 2017-01-02T12:44:00+03:00
tags: ["macos", "objective-c", "iokit", "appkit"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/poluchenie-informacii-o-sostoyanii-batarei-v-macos-vypolneniem-k/"
---
После обновления *MacOS* до *Sierra* я столкнулся с проблемой — в статус баре исчезла информация об оставшемся времени работы от батареи. Проблема на самом деле решается очень просто — можно установить стороннее приложение [Battery-Time-Remaining](https://github.com/codler/Battery-Time-Remaining), которое является настоящим швейцарским ножом в области работы с батареей макбука. Но мне захотелось разобраться как можно получить информацию об оставшемся времени работы от батареи в *MacOS* и написать свое приложение для статус бара.

Существует два способа получения состояния батареи в *MacOS*:

1. (правильный) при помощи набора функций [IOPowerFunctions](https://developer.apple.com/reference/iokit) фреймворка *IOKit*;
2. (быстрый) выполнением консольной команды “**pmset -g batt**” и парсинга вывода.

Воспользуемся вторым способом (приложение не нацелено на продакшн и его нужно реализовать быстро) и напишем приложение, которое будет выводить оставшееся время работы ноутбука от батареи в статус баре.

Принцип работы будет следующим:

1. используя *IOKit* подпишемся на нотификации системы об изменении состояния батареи для обновления данных в статус баре (можно конечно сделать при помощи таймера, но это лишняя трата ресурсов системы)
2. при изменении состояния батареи используя *NSTask* выполняем консольную команду и захватываем ее вывод
3. парсим вывод и пересоздаем меню в статус баре

Чтобы все успешно заработало необходимо добавить *IOKit.framework* и зареференсить хедер *IOKit/ps/IOPowerSources.h*

Так же, нужно не забыть снять галочку *Visible At Launch* с *NSWindow* в *Xib* интерфейса приложения (это запретит окну автоматически появляться на экране, нам нужен только статус бар)

Чтобы скрыть иконку приложения из дока *MacOS* нужно в *info.plist* установить флаг *LSUIElement* в значение *YES*

```objectivec
- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    // Capture Power Source updates and make sure our callback is called
    CFRunLoopSourceRef loop = IOPSNotificationCreateRunLoopSource(PowerSourceChanged, (__bridge void *)self);
    CFRunLoopAddSource(CFRunLoopGetCurrent(), loop, kCFRunLoopDefaultMode);
    CFRelease(loop);
    
    self.statusItem = [[NSStatusBar systemStatusBar] statusItemWithLength:NSVariableStatusItemLength];
    self.statusItem.title = @"Checking...";
    self.statusItem.highlightMode = YES;
    
    //request battery status for the first time
    [self requestBatteryStatus];
}

// IOPS notification callback on power source change
static void PowerSourceChanged(void * context)
{
    //requesting battery status
    AppDelegate *self = (__bridge AppDelegate *)context;
    [self requestBatteryStatus];
}

-(void)requestBatteryStatus
{
    //create task & launch 'pmset' to get battery status string
    NSPipe *pipe = [NSPipe pipe];
    NSFileHandle *file = pipe.fileHandleForReading;
    
    NSTask *task = [[NSTask alloc] init];
    task.launchPath = @"/usr/bin/pmset";
    task.arguments = @[@"-g", @"batt"];
    task.standardOutput = pipe;
    
    [task launch];
    
    NSData *data = [file readDataToEndOfFile];
    [file closeFile];
    
    //parse string to get particular items
    NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    NSString *statusData = [result componentsSeparatedByString:@"	"][1];
    NSArray *status = [statusData componentsSeparatedByString:@";"];
    
    //battery charge percent
    NSString *batteryPercent = [status[0] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    //charging status
    NSString *batteryChanging = [status[1] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    
    //ETA
    NSString *batteryEstimate = [status[2] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    //remaining hours
    NSString *batteryRemaining = batteryEstimate;
    NSRange range = [batteryEstimate rangeOfString:@"present"];
    if(range.length > 0){
        batteryEstimate = [[[batteryEstimate substringToIndex:range.location] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]] stringByTrimmingCharactersInSet:[NSCharacterSet characterSetWithCharactersInString:@"()"]];
        
        batteryRemaining = [batteryEstimate componentsSeparatedByString:@" "][0];
    }
    
    //recrete status bar menu
    NSMenu *menu = [[NSMenu alloc] init];
    [menu addItemWithTitle:batteryPercent action:nil keyEquivalent:@""];
    [menu addItemWithTitle:batteryEstimate action:nil keyEquivalent:@""];
    [menu addItemWithTitle:batteryChanging action:nil keyEquivalent:@""];
    
    [menu addItem:[NSMenuItem separatorItem]];
    
    [menu addItemWithTitle:@"Exit" action:@selector(exitAction:) keyEquivalent:@""];
    
    self.statusItem.menu = menu;
    
    self.statusItem.title = [batteryRemaining stringByAppendingString:@" ETA"];
    
    NSLog(@"Request success!");
}

-(void)exitAction:(id)sender
{
    exit(0);
}
```
