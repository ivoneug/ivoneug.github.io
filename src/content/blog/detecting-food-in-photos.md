---
title: "Detecting Food in Photos with Core ML"
description: "A yes-or-no answer to \"is there food in this photo?\" using Apple's on-device ResNet50 model, a list of food labels and a confidence threshold."
date: 2023-12-19T10:00:00+03:00
tags: ["ios", "coreml", "vision"]
---

To tell whether a photo contains food, **we have to use a neural network**, because apps have no programmatic access to the smart tags of the Photos library.

First, I **looked for a ready-made solution** or library. There are a few, but **they are either long abandoned** or they recognize the **type of food** in a photo **rather than whether there is food at all**.

So I decided to **use one of Apple's models** that identify objects in a photo (**they all run on the device, with no network connection**). Apple offers **a few Core ML models** for image classification ([developer.apple.com/machine-learning/models](https://developer.apple.com/machine-learning/models/)). I compared the three that were available at the time, MobileNetV2, ResNet50 and SqueezeNet, and picked **ResNet50 as the most stable** of them.

## Picking the food labels

**ResNet50 knows about a thousand object labels.** I went through the list and kept only the ones related to food. **Here is what was left:**

```swift
"lemon",
"corn",
"rapeseed",
"orange",
"custard apple",
"honeycomb",
"acorn",
"red wine",
"jackfruit, jak, jack",
"mushroom",
"bell pepper",
"ice lolly, lolly, lollipop, popsicle",
"water bottle",
"pop bottle, soda bottle",
"guacamole",
"banana",
"hotdog, hot dog, red hot",
"fig",
"buckeye, horse chestnut, conker",
"mashed potato",
"coffee mug",
"bagel, beigel",
"head cabbage",
"wok",
"saltshaker, salt shaker",
"meat loaf, meatloaf",
"espresso",
"French loaf",
"ocarina, sweet potato",
"plate",
"coffeepot",
"spiny lobster, langouste, rock lobster, crawfish, crayfish, sea crawfish",
"broccoli",
"cucumber, cuke",
"milk can",
"teapot",
"rotisserie",
"cauliflower",
"spaghetti squash",
"pretzel",
"consomme",
"cheeseburger",
"dough",
"eggnog",
"strawberry",
"burrito",
"carbonara",
"chocolate sauce, chocolate syrup",
"ice cream, icecream",
"soup bowl",
"acorn squash",
"hot pot, hotpot",
"trifle",
"pizza, pizza pie",
"butternut squash",
"American lobster, Northern lobster, Maine lobster, Homarus americanus",
"zucchini, courgette",
"potpie"
```

## Turning predictions into yes or no

Then I **wrote some experimental code** that should give us a binary answer: is there food in the photo or not.

ResNet50 returns **an array of labels with their confidence (how likely it is that the object matches the label)**, so I had to do two things:

- **set a threshold to cut off false results** (after some experiments I settled on **0.1, that is, 10% confidence**);
- **write logic that takes the top 3 results with the highest confidence** and looks for a food label among them.

The test code looks like this:

```swift
private func visionRequestHandler(_ request: VNRequest, error: Error?) {
    guard let completionHandler = completionHandlers.removeValue(forKey: request) else {
        return
    }
    guard
        error == nil,
        request.results != nil,
        let observations = request.results as? [VNClassificationObservation]
    else {
        completionHandler(nil)
        return
    }

    let predictions = observations
        .map { observation in
            Prediction(classification: observation.identifier, confidence: Float(observation.confidence))
        }
        .filter { $0.confidence > 0.1 }
        .sorted { $0.confidence > $1.confidence }

    for prediction in Array(predictions.prefix(3)) {
        if Constants.foodIdentifiers.contains(prediction.classification) {
            completionHandler(true)
            return
        }
    }
    completionHandler(false)
}
```

## Results

Here is what the network said about a few test photos.

Not food:

![A yellow leaf on a lemon tree](/images/detecting-food-in-photos-1.webp)

Not food:

![A waterfall in a green canyon](/images/detecting-food-in-photos-2.webp)

Not food:

![A portrait of a dog](/images/detecting-food-in-photos-3.webp)

Food:

![A lobster roll](/images/detecting-food-in-photos-4.webp)

Food:

![Glazed pork ribs](/images/detecting-food-in-photos-5.webp)

Food:

![An apple pie](/images/detecting-food-in-photos-6.webp)
