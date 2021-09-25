---
layout:     post
title:      Combine Framework Overview
date:       2021-09-19 10:00:00
summary:    After reading this article you will get a grasp on Apple's brand new framework for reactive programming called Combine
categories: combine swift
---

![Half-Life 2 © Valve](/images/combine.jpeg)
<center><sup>Half-Life 2 © Valve</sup></center><br/>

Some time ago Apple has introduced a brand new framework called Combine ([WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/722/)). This framework is aimed to reduce developers' need to implement multiple delegate callbacks and completion handlers and simplify events handling in general. Also, Combine has a declarative API which dramatically improves the readability of the code.

Just imaging that you have a search field and would like to filter a list of items according to the entered text. You can use a UITextView delegate for that, of course, you'll have to use a timer in addition to throttle user's input and you'll definitely have to process the entered text somehow to make it suitable for your filtering logic.

Or you would like to make a network request to your server API, then process this request and transform received data into the model, after that you'd like to filter that data and change your UI accordingly.

Looks pretty complex, isn't it? So here comes Combine which can drastically simplify all this stuff and allow you to create a single processing chain for the process.

## Combine Components
Generally, Combine is simple and consists of 3 concepts:
* Publishers
* Subscribers
* Operators

Let's discuss each one to understand their purpose.

### Publishers
The publisher is a type that defines how values and errors are produced over time. The publisher must be structure and follow the Publisher protocol. Also, the publisher allows one or more subscribers to subscribe to the values it produces.

The publisher has two associated types, one for ```Output``` and another one for ```Failure```, and method ```receive```. Here is how Publisher protocol looks like:

{% highlight swift lineanchors %}
public protocol Publisher {

    associatedtype Output
    associatedtype Failure : Error

    func receive<S>(subscriber: S) where S : Subscriber, Self.Failure == S.Failure, Self.Output == S.Input
}
{% endhighlight %}

Receive method allows us to connect the publisher with one or more subscribers.

### Subscribers
Subscriber is a class that is responsible for requesting end receiving data from the publisher, it can also receive an error. We can look at the subscriber as a final destination point of our data flow chain. Subscriber implements the Subscriber protocol which as Input and Failure associated types and 3 receive methods for different purposes. Here is how Subscriber protocol looks like:

{% highlight swift lineanchors %}
public protocol Subscriber : CustomCombineIdentifierConvertible {
    associatedtype Input
    associatedtype Failure : Error

    func receive(subscription: Subscription)
    func receive(_ input: Self.Input) -> Subscribers.Demand
    func receive(completion: Subscribers.Completion<Self.Failure>)
}
{% endhighlight %}

```receive(subscription: Subscription)``` method will be invoked by the publisher right after a connection between the publisher and subscriber is established (it happens exactly after calling ```receive<S>(subscriber: S)``` method).

After that instance of ```Subscription``` can be used to request data from the publisher, also we can use this instance to cancel the subscription and exit the flow.

Next, when new values are ready the publisher calls the second method of subscriber ```receive(_ input: Self.Input)``` with new values.

When the publisher stops publishing it calls the last method ```receive(completion: Subscribers.Completion<Self.Failure>)``` with one of the two enum values represents either success ```.finished``` or error ```.failure(Failure)```.

We should keep in mind one important thing that Publisher and Subscriber must obey to be able to connect to each other:

The ```Output``` of the publisher must be of the same type as ```Input``` of the subscriber. Also, ```Failure``` of both should be the same type or ```Never``` if there can't be any error in the flow.

### Operators
The last important piece of the chain is Operators. Just imagine that publisher can emit numbers in form of a string, but the subscriber can accept only numbers in form of integers. So we have to convert the value somewhere in between. Here come operators in play.

Technically operators are convenience functions that allow receiving the data from the upstream publisher (or operator), transform it, and republish it down the stream to the next step in the chain.

### The Data Flow in Combine
Every chain of data flow in Combine can be represented with the following scheme:

```Publisher -> [Operator] -> [Operator] -> ... -> Subscriber(s)```

This means that the value the ```publisher``` emits can be processed via zero or more ```operators``` and after that can be consumed by one or more ```subscribers```.

### Example
Here is the simple Counter class that uses PassthroughSubject and publisher to update its clients about count changes

{% highlight swift lineanchors %}
import Combine

// simple counter class that publish it's value
final class Counter {
    // create a PassthroughSubject to publish change of the counter
    // there will be no error so we pass Never as Failure associated type
    private var subject = PassthroughSubject<Int, Never>()

    // it is important to make a separate computed property for PassthroughSubject
    // to hide subject and expose only it's publisher
    var publisher: AnyPublisher<Int, Never> {
        subject.eraseToAnyPublisher()
    }

    private(set) var count: Int = 0 {
        didSet {
            // after changing count value send it via our subject
            subject.send(count)
        }
    }

    func increment() {
        count += 1
    }

    func decrement() {
        count -= 1
    }

    func setCount(with value: Int) {
        count = value
    }
}
{% endhighlight %}

And Counter usage will be the following

{% highlight swift lineanchors %}
// create an instance of our Counter
var counter = Counter()

// subscribe to the publisher and store the subscription in cancellable var
var cancellable = counter.publisher.sink {
    print($0)
}

counter.increment()
counter.increment()
counter.setCount(with: 10)
counter.decrement()
{% endhighlight %}

Try to figure out the result of this code! Actually, it's the following:

{% highlight swift lineanchors %}
1
2
10
9
{% endhighlight %}

It would be nice to understand one important thing about the invocation of ```subject.eraseToAnyPublisher()``` inside the computed property. Each time you invoke ```eraseToAnyPublisher()``` it creates a new publisher, but the subject itself still remembers all previous publishers that are created earlier.

## Conclusion

Well, looks like Apple has created a really interesting thing called Combine. Reactive programming is very popular now and it definitely would be a good idea to adopt some of its concepts. Using Combine is one of them.
