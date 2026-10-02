---
title: "Использование Fragment без UI для хранения данных"
description: "Fragment — это сущность, позволяющая инкапсулировать часть интерфейса и его логику для переиспользования."
date: 2015-06-19T21:01:00+03:00
tags: ["android", "xamarin", "csharp", "fragments"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/ispolzovanie-fragment-bez-ui-dlya-hraneniya-dannyh/"
---
Fragment — это сущность, позволяющая инкапсулировать часть интерфейса и его логику для переиспользования. Фрагменты были представлены в Android 3.0 и позволили существенно упростить работу по проектированию интерфейса для устройств с различными размерами экранов (так называемая парадигма Responsive Design, когда одно и то же приложение выглядит по разному на устройствах с различной диагональю экрана).

Фрагменты очень удобны и обладают следующими основными свойствами:

1. Очень похожи на Activity и имеют схожий цикл жизни, при этом дополненный несколькими событиями;
2. Как и Activity инкапсулируют логику работы с интерфейсом;
3. Могут жить только внутри Activity, при этом один и тот же фрагмент может быть использован в различных Activity, что существенно упрощает задачу при проектировании интерфейса для различных устройств.

Фрагменты обладают ещё одним свойством, которое может быть весьма полезно при разработке приложений — фрагмент можно создать вовсе без пользовательского интерфейса и заставить его не умирать при пересоздании родительской Activity. Это свойство может быть очень к месту для хранения источника данных (модели) в таком фрагменте.

Для многих начинающих разработчиков, пришедших с десктопных платформ, может стать настоящим откровением поведение Android например при изменении ориентации устройства — в таком случае Activity будет уничтожена и создана вновь с лэндскейпным лэйаутом. Соответственно если к Activity привязан какой-либо источник данных — он будет так же пересоздан (или перезагружен, в случае ContentProvider).

Чтобы этого не произошло можно создать специальный фрагмент без UI и передать в его конструкторе значение true в сеттер setRetainInstance (Java), либо установить значение true свойству RetainInstance (C#). Далее инициализировать и сохранить в нём нашу модель.

Все, после подобных манипуляций получим постоянный доступ к модели с сохранением её состояния даже при пересоздании родительской Activity.

Ниже небольшой пример кода на C# и Xamarin:

```csharp
/// <summary>
/// Фрагмент без интерфейса, будет хранить нашу модель
/// (данный фрагмент будет ретейниться после уничтожения основной вьюхи и наши данные не будут перегенериваться при пересоздании Activity)
/// </summary>
public class ModelHolderFragment : Android.App.Fragment{
	public static string SearchTag = "MODEL_HOLDER_FRAGMENT";

	public ViewPagerItem[] DataSourceItems { get; private set;}

	public override void OnCreate (Bundle savedInstanceState)
	{
		base.OnCreate (savedInstanceState);

		DataSourceItems = GenViewPagerItems ();

		//установим флаг, который запретит фрагменту умирать при уничтожении основной вьюхи
		RetainInstance = true;
	}

	/// <summary>
	/// Генерация фейковых данных
	/// </summary>
	/// <returns>The view pager items.</returns>
	private ViewPagerItem[] GenViewPagerItems(){
		...
		return items;
	}
}

///Хэндлер события OnCreate родительской Activity - тут создадим экземпляр нашего фрагмента
protected override void OnCreate(Bundle savedInstanceState) {
	base.OnCreate(savedInstanceState);
	SetContentView (Resource.Layout.activity_main);

	//инициализируем фрагмент без интерфейса для хранения модели только при первом создании вьюхи
	if (savedInstanceState == null) {
		FragmentManager.BeginTransaction ().Add ((Android.App.Fragment)new ModelHolderFragment (), ModelHolderFragment.SearchTag).Commit();
		FragmentManager.ExecutePendingTransactions ();
	}
	_model = (ModelHolderFragment)FragmentManager.FindFragmentByTag (ModelHolderFragment.SearchTag);
}
```
