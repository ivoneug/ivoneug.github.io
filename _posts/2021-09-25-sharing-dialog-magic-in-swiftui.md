---
layout:     post
title:      Sharing Dialog Magic in SwiftUI
date:       2021-09-24 22:25:00
summary:    Did you notice that sharing dialog on iOS is half-screen but things are different in SwiftUI. Let's try to fix it!
categories: swiftui sharing
---

SwiftUI is beautiful and young at the same time. And as developers, we often have issues with it now and then. They are not severe, sometimes we can come up with a workaround. If the feature is missing we often can wrap UIKit control with SwiftUI and get the necessary functionality.

A lot of apps have sharing feature, we often need to share a piece of text or an image with our friends, on iOS we're using ```UIActivityViewController``` to achieve this. But we don't have this controller natively in SwiftUI.

It's not a big problem though, because we always can wrap any UIKit view with ```UIViewRepresentable``` to integrate it into our SwiftUI view hierarchy.

Something like this:
{% highlight swift lineanchors %}
struct ShareView: UIViewControllerRepresentable {
    var sharingItems: [Any]

    func makeUIViewController(context: Context) -> some UIViewController {
        return UIActivityViewController(activityItems: sharingItems, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {}
}
{% endhighlight %}

And use it the following way:

{% highlight swift lineanchors %}
struct ContentView: View {
    @State var sharingItems: [Any]?

    var body: some View {
        Button(action: {
            sharingItems = ["Text to Share"]
        }, label: {
            Text("Share Text")
        })
        .sheet(isPresented: .constant(sharingItems != nil)) {
            if let sharingItems = sharingItems {
                ShareView(sharingItems: sharingItems)
            }
        }
    }
}
{% endhighlight %}

But after doing that and showing our brand new sharing view inside ```.sheet``` view modifier suddenly we're going to have the following result:

![Issue with UIActivityViewController in SwiftUI + sheet](/images/sharing-dialog-magic-in-swiftui-1.jpg){:height="700px"}

What the heck?! Why is it fullscreen when normally all sharing dialogs are half-screen on iOS? You can try to fix it by setting ```modalPresentationStyle``` to be ```.pageSheet```, but no luck it's still fullscreen.

And ```UIActivityViewController``` is not a source of issue here, it's actually ```.sheet``` view modifier. Seems like folks who made implementation for ```.sheet``` view modifier just changed the logic and do not take into account ```modalPresentationStyle```.

But anyway fix is pretty simple, we can wrap our ```UIActivityViewController``` with another ```UIViewController``` and all magically working as intended.

![Working correctly UIActivityViewController in SwiftUI](/images/sharing-dialog-magic-in-swiftui-2.gif){:height="700px"}

So here is the final solution:
{% highlight swift lineanchors %}
struct ShareView: UIViewControllerRepresentable {
    @Binding var sharingItems: [Any]?

    func makeUIViewController(context: Context) -> some UIViewController {
        return UIViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
        guard let sharingItems = sharingItems, context.coordinator.visible == false else {
            return
        }
        context.coordinator.visible = true

        let activityViewController = UIActivityViewController(activityItems: sharingItems, applicationActivities: nil)
        activityViewController.completionWithItemsHandler = { _, _, _, _ in
            self.sharingItems = nil
            context.coordinator.visible = false
        }
        DispatchQueue.main.async { uiViewController.present(activityViewController, animated: true) }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject {
        let parent: ShareDocumentView
        var visible = false

        init(_ parent: ShareDocumentView) {
            self.parent = parent
        }
    }
}
{% endhighlight %}

You might ask why are we using ```DispatchQueue.main.async { uiViewController.present(activityViewController, animated: true) }``` here? Here is the answer:

We're creating our ```UIActivityViewController``` inside ```updateUIViewController``` method, it's not yet added into the view hierarchy and we can't present it until it's added. So we're using ```DispatchQueue.main.async {}``` to present our view controller after a fraction of time.

And we're not going to use ```.sheet``` modifier anymore (we already wrapped ```UIActivityViewController``` with ```UIViewController``` right?), so we can simply use ```.background``` modifier to show our ```ShareView``` when necessary:

{% highlight swift lineanchors %}
struct ContentView: View {
    @State var sharingItems: [Any]?

    var body: some View {
        Button(action: {
            sharingItems = ["Text to Share"]
        }, label: {
            Text("Tap to Share Text")
        })
        .background(ShareView(sharingItems: $sharingItems))
    }
}
{% endhighlight %}

I hope that folks from Apple fix the ```.sheet``` view modifier behavior in future releases of SwiftUI, until then we can safely use this approach.