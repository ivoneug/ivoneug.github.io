---
title: "Использование паттерна ViewHolder"
description: "С этой статьи я бы хотел начать цикл кратких заметок о разработке под мобильные устройства. Приложения под телефоны и планшеты — мое давнее увлечение."
date: 2015-06-17T10:56:00+03:00
tags: ["android", "xamarin", "csharp", "listview"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/ispolzovanie-patterna-viewholder/"
---
С этой статьи я бы хотел начать цикл кратких заметок о разработке под мобильные устройства. Приложения под телефоны и планшеты — мое давнее увлечение. К сожалению плотно заняться которым, в силу различных обстоятельств, я смог только сейчас. В прочем хватит лирики, начнём. В качестве платформы я выбрал Android, как наиболее массовую и открытую систему. В качестве языка программирования сегодня будем использовать C#, писать будем на Xamarin с использованием Android API.

Практически любое мобильное приложение это некий экран с набором однотипных информационных элементов, для отображения которых обычно используется список или какой-либо грид. Из-за того, что платформа мобильная и работает на устройстве с небольшим объёмом памяти и слабым процессором (хаха! В моем первом компьютере было памяти раз в 15 меньше и процессор существенно слабее, чем сейчас в среднем телефоне) операционная система вынуждена ресурсы экономить. Соответственно если речь идёт о списке (ListView в Android), а если точнее об адаптере, который предоставляет данные для списка (например ArrayAdapter в Android) мы сталкиваемся с одной из особенностей, вызванных необходимостью беречь ресурсы.

Такая особенность заключается в том, что лист не создаёт ячейки под каждую из записей подключенного источника данных. Он создаёт лишь то количество ячеек, сколько может уместиться на экране в данный момент плюс по одной лишней ячейке сверху и снизу. Такое поведение характерно не только для Android, но и для iOS.

При этом когда пользователь прокручивает список система не удаляет ячейки, она старается их переиспользовать.

Когда ячейка пропадает из поля видимости пользователя она передаётся в метод GetView() адаптера, в котором происходит заполнение ячейки данными. В этом методе можно решить, переиспользовать уже готовую ячейку или создать новую.

Все бы ничего, но если лэйаут ячейки сложный то мы напрямую сталкиваемся с необходимостью проводить поиск элементов в лэйауте (TextView, ImageView и т. п.) для заполнения их актуальными данными. Вроде бы ничего страшного, вызвал *FindViewById()* с нужным id элемента, получил его и нет проблем, но выполнение метода *FindViewById()* это длительная операция, потому что она тянет за собой траверс по XML-коду лэйаута нашей ячейки. В итоге на сложных лэйаутах имеем просадку по производительности скроллинга списка.

Чтобы решить данную проблему нам необходимо использовать паттерн **ViewHolder**. Кратко его суть заключается в следующем:

1. Реализуем класс, который в конструкторе принимает нашу *View*, делает траверс и ищет все её элементы, которые нам потребуются для заполнения данных;
2. Записываем ссылки на эти элементы в соответствующие поля класса, снабжаем их геттерами, чтобы потом к ним обращаться;
3. При создании нашей *View* — создаём наш *класс-ViewHolder* и записываем ссылку на него в свойстве *Tag* у нашей *View*;
4. Теперь при попытке переиспользовать *View* нам не нужно делать повторный поиск элементов в лэйауте, достаточно получить ссылку на *ViewHolder* из свойства *Tag* и обратиться к соответствующим геттерам холдера;
5. PROFIT.

Если делать реализацию на Java сложностей возникнуть не должно, но если использовать C# и Xamarin мы столкнемся с корнями, растущими из Java :-)

Предположим есть такой класс:

```csharp
public class MyViewHolder{
public TextView MyTextView {get; private set;}

public MyViewHolder(View view){
...
}
}
```

Если теперь попытаться присвоить ссылку на него свойству *Tag* нашей *View* у нас ничего не получится. Поскольку *Tag* принимает объект типа *Java.Lang.Object*, а наш класс наследован от типа *Object*. Прямое кастование к нужному типу так же не приведёт к успеху. Кастование сначала к *Object*, а потом к *Java.Lang.Object* не даст ошибки компиляции, зато упадёт в рантайме.

Что же делать? **Все просто :-) наследовать наш класс от типа *Java.Lang.Object* и будет счастье!**

Небольшой пример того, как все это работает:

```csharp
public class TimetableItemAdapter : ArrayAdapter<TimetableItem>
{
	/// <summary>
	/// Класс ViewHolder, нужен что бы исключить множественный траверс по элементам вьюхи, для производительности
	/// </summary>
	public class TimetableItemViewHolder : Java.Lang.Object{
		public TextView TimeText { get; private set;}
		public TextView DescriptionText { get; private set;}
		public ImageView AcceptButton { get; private set;}

		public TimetableItem BoundedItem { get; set;}

		public TimetableItemViewHolder(View view, TimetableItem item){
			TimeText = view.FindViewById<TextView>(Resource.Id.timetable_time_text);
			DescriptionText = view.FindViewById<TextView>(Resource.Id.timetable_description_text);
			AcceptButton = view.FindViewById<ImageView>(Resource.Id.timetable_accept);

			BoundedItem = item;
		}
	}

	private MainActivity _context;

	public TimetableItemAdapter(Context context, int resource, IList<TimetableItem> objects) : base(context, resource, objects) {
		_context = (MainActivity)context;
	}
			
	public override View GetView(int position, View convertView, ViewGroup parent) {
		View resultView = null;
		TimetableItemViewHolder holder = null;
		TimetableItem item = GetItem(position);

		if(convertView != null){
			resultView = convertView;
			holder = (TimetableItemViewHolder)convertView.Tag;
			holder.BoundedItem = item;
		}else{
			resultView = ((LayoutInflater)_context.GetSystemService(Context.LayoutInflaterService))
				.Inflate(Resource.Layout.timetable_list_item, parent, false);
			holder = new TimetableItemViewHolder(resultView, item);
			resultView.Tag = holder;
		}

		if(item != null && holder != null){
			holder.TimeText.Text = item.Time;
			holder.DescriptionText.Text = item.Description;
		}

		return resultView;
	}
}
```

Во *ViewHolder* не обязательно хранить только ссылки на элементы лэйаута, иногда может потребоваться хранить и какие-либо сопутствующие данные. Например в коде выше во *ViewHolder* записывается дополнительно ссылка на элемент из источника данных, для последующего использования где-нибудь. Но в данном случае нужно помнить, что при переиспользовании *View* нужно не забыть записать в свойство ссылку на новый элемент источника данных.
