---
title: "Changing an iOS App's Language on the Fly"
description: "Two ways to switch an app's localization from inside the app: the AppleLanguages key with a restart, and a custom SwiftGen lookup function that works without one."
date: 2023-04-16T10:00:00+03:00
tags: ["ios", "localization", "swiftgen"]
---

This post covers a couple of ways to change an app's localization on the fly.

First of all, **Apple doesn't recommend changing the app's language on the fly**. It can cause all sorts of problems: system components such as pickers won't pick up the new language, and neither will the strings from `Info.plist`. An Apple engineer explains the issue in more detail in [this thread](https://developer.apple.com/forums/thread/13155?answerId=36704022#36704022).

Let's say our app has two localizations, English and Russian, and the corresponding `Localizable.strings` and `Localizable.stringsdict` files are already in place.

There are a couple of ways to change the localization from inside the app:

1. Modify the `AppleLanguages` key in `UserDefaults` and restart the app.
2. Use a custom `localizedString(forKey:value:table:)` method that looks up the right localization dynamically.

Let's look at each of them.

## Modifying AppleLanguages and restarting the app

This is the simplest way to change the localization, but it has a few drawbacks:

1. The app has to be restarted for the change to take effect.
2. `AppleLanguages` is a private Apple key in `UserDefaults`, so in theory it could change in the future.

To change the language, set the language code for the `AppleLanguages` key in `UserDefaults` (as an array!) and restart the app. Here is an example of a button action that toggles the language:

```swift
let key = "AppleLanguages"
let en = "en"
let ru = "ru"
let lang = UserDefaults.standard.array(forKey: key)
if lang?.first as? String == en {
    UserDefaults.standard.set([ru], forKey: key)
} else {
    UserDefaults.standard.set([en], forKey: key)
}
```

## A custom lookup function with SwiftGen

This approach is more involved, but it lets you change the language dynamically without restarting the app. Keep in mind, though, that for the new localization to show up, **you have to request the localized strings again**, for example by recreating the controls on the screen or initializing the view controller from scratch.

The implementation is built on two pieces:

- **SwiftGen**, which generates an enum with localized strings from the `Localizable.strings` files;
- a custom lookup function that actually finds the string for a key in the selected language.

For simplicity, we'll store the selected language in `UserDefaults` under the `UserLanguage` key. This isn't required: you can pick any key name you like, or store the language some other way.

First, let's write a custom lookup function that finds the translation for a key:

```swift
extension Bundle {
    static func customLocalizedString(forKey key: String, table: String?, value: String?) -> String {
        let currentLanguage = UserDefaults.standard.string(forKey: "UserLanguage") ?? Locale.preferredLanguages[0]
        guard
            let bundlePath = Bundle.main.path(forResource: currentLanguage, ofType: "lproj"),
            let bundle = Bundle(path: bundlePath)
        else {
            return Bundle.main.localizedString(forKey: key, value: value, table: table)
        }
        return bundle.localizedString(forKey: key, value: value, table: table)
    }
}
```

Second, we update the SwiftGen config file and tell it which function to use for our localization:

```yaml
strings:
  - inputs: ../../MyApp/Resources/Localization/en.lproj/Localizable.strings
    outputs:
      templateName: structured-swift5
      output: ../../MyApp/Resources/Generated/Localizations.swift
      params:
        enumName: Localizations
        publicAccess: 1
        noComments: 0
        lookupFunction: Bundle.customLocalizedString(forKey:table:value:)
```

The `lookupFunction` parameter gives the generator the signature of the method to use when building the localization enum. It's worth noting that with `lookupFunction` set, SwiftGen generates **computed properties** instead of static constants, which means the localized strings can be requested again.

To change the language stored under `UserLanguage`, you can use this code:

```swift
let key = "UserLanguage"
let en = "en"
let ru = "ru"
let lang = UserDefaults.standard.string(forKey: key)
if lang == en {
    UserDefaults.standard.set(ru, forKey: key)
} else {
    UserDefaults.standard.set(en, forKey: key)
}
```

The final step is to update the strings in the controls on the screen. There are many ways to do it, depending on how a particular control or screen is implemented.
