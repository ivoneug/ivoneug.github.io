---
title: "Реализация механизма плагинов в программе"
description: "Рано или поздно практически любой разработчик популярной программы сталкивается с необходимостью реализации возможности написания плагинов для нее."
date: 2015-01-04T23:31:00+03:00
tags: ["csharp", "dotnet", "reflection"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/realizaciya-mehanizma-plaginov-v-prilozhenii/"
---
Рано или поздно практически любой разработчик популярной программы сталкивается с необходимостью реализации возможности написания плагинов для нее. Лучше, если данная возможность заложена изначально. Наиболее простым путем в реализации такого функционала является создание специального интерфейса (*например IPlugin*). Данный интерфейс может содержать все необходимые методы и свойства для класса, работающего в инфраструктуре плагинов. Позже программа при загрузке сборки с плагином будет искать все классы, реализующие этот интерфейс, инстанциировать их как плагины и отображать их список в интерфейсе пользователя.

В основе работы всей инфраструктуры плагинов лежит такая возможность Microsoft .NET Framework как Рефлексия (пространство имен *System.Reflection*, более подробно [можно почитать на MSDN](https://msdn.microsoft.com/ru-ru/library/System.Reflection(v=vs.110).aspx))

У меня есть векторный редактор, который имеет три типа «кистей»:

- Кисти рисования
- Кисти для редактирования уже нарисованных примитивов (обрезка линий, удлинение линий и т. п.)
- Кисти для реализации расчетного функционала (простой пример — посчитать длины определенных элементов на чертеже)

Будем использовать его как пример реализации инфраструктуры для работы плагинов.

В статье рассмотрим инфраструктуру плагинов, написанную для этого редактора, она будет состоять из:

- Менеджера плагинов (реализует весь механизм загрузки и инстанциации плагинов)
- Набора специальных атрибутов (позволят добавить в метаданные дополнительную информацию о том или ином плагине)
- Несколько интерфейсов, позволяющих писать плагины к различному функционалу редактора

Первым шагом необходимо реализовать интерфейс для каждого типа кисти (*исходные интерфейсы в редакторе довольно сложны, имеют много методов и свойств, в примере они намеренно упрощены*)

Обычно простейший интерфейс для плагина может выглядеть следующим образом:

```csharp
public interface IPlugin
{
	//Возвращает наименование плагина
	string Name { get; }

	//Инициализирует плагин
	void Init();

	//Метод, который собственно делает всю работу плагина
	void DoWork();
}
```

Из кода становится ясно, что после инстанциации плагинов достаточно получить имя каждого (*поле Name*), вывести этот список в интерфейс. После чего когда пользователь выберет определенный плагин — вызвать его метод *Init()*, который инициализирует его и затем вызвать метод *DoWork()*, который сделает уже работу плагина.

Используя такой интерфейс программе абсолютно по барабану что именно делает плагин, главное что она знает порядок вызова методов. Такой подход позволяет существенно расширить функционал исходной программы. Но вернемся к редактору.

Интерфейс, описывающий кисть рисования. Содержит основные методы, позволяющие клонировать кисть, отрисовать примитив кисти, инициализировать новый экземпляр кисти. Так же присутствует свойство-геттер, возвращающее строковый идентификатор кисти.

```csharp
public interface IDrawObject
{
	//Возвращает строковый ID кисти
	string Id { get; }
	
	//Клонирует кисть
	IDrawObject Clone();

	//Отрисовывает примитив кисти
	void Draw(ICanvas canvas, RectangleF unitrect);

	//Инициализирует новый экземпляр кисти
	void InitializeFromModel(UnitPoint point, DrawingLayer layer, ISnapPoint snap)
}
```

Интерфейс, описывающий кисть редактирования. Содержит методы клонирования объекта и обработки нажатия мыши по экрану (позволяет реализовать логику работы кисти редактирования через последовательное выделение объектов, например выделили базовый объект, обрезали второй объект по базовому).

```csharp
public interface IEditTool
{
        //Возвращает строковый ID кисти
        string Id { get; }

        //Клонирует кисть
	IEditTool Clone();

        //Реализация логики кисти, обработка нажатия на экран
	public DrawObjectMouseDown OnMouseDown(ICanvas canvas, UnitPoint point, ISnapPoint snappoint)
}
```

Интерфейс, описывающий расчетную кисть. Содержит методы, позволяющие клонировать кисть, а так же выполнить расчетный алгоритм, реализуемый кистью.

```csharp
public interface ICalcTool
{
        //Возвращает строковый ID кисти
        string Id { get; }

        //Клонирует кисть
        ICalcTool Clone();

        //Запускает расчетный алгоритм кисти
        void PerformCalc(IModel model);
}
```

Следующим этапом для каждого типа кисти необходимо реализовать атрибут, позволяющий добавить дополнительную информацию к кисти (ее имя, описание, имя файла иконки, хоткей для запуска и т. п.). Пример для кисти рисования:

```csharp
/// <summary>
/// Атрибут, описывающий графический объект
/// </summary>
[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public class DrawToolAttribute : Attribute
{
        /// <summary>
        /// Имя кисти рисования
        /// </summary>
        public string Name { get; private set; }
        /// <summary>
        /// Описание кисти рисования
        /// </summary>
        public string Description { get; private set; }
        /// <summary>
        /// Изображение для кнопки кисти рисования
        /// </summary>
        public string GlyphFileName { get; private set; }
        /// <summary>
        /// Горячая клавиша
        /// </summary>
        public Keys Shortcut { get; private set; }

        public DrawToolAttribute()
        {
            Name = string.Empty;
            Description = string.Empty;
            GlyphFileName = string.Empty;
            Shortcut = Keys.None;
        }

        /// <summary>
        /// В конструкторе передаем все необходимые параметры для описания кисти
        /// </summary>
        public DrawToolAttribute(string name, string description, string glyphFileName, Keys shortcut)
        {
            if (name == null) throw new ArgumentNullException("name");
            if (description == null) throw new ArgumentNullException("description");
            if (glyphFileName == null) throw new ArgumentNullException("glyphFileName");

            Name = name;
            Description = description;
            GlyphFileName = glyphFileName;
            Shortcut = shortcut;
        }
}

//Аналогичным способом реализованы атрибуты для кисти редактирования и кисти расчета:
public class EditToolAttribute : Attribute
{
...
}

public class CalcToolAttribute : Attribute
{
...
}
```

Перед определением заголовка класса атрибута использован специализированный атрибут *AttributeUsage*, который позволяет описать возможные применения создаваемого атрибута, в нашем случае атрибуты должны применяться только к классу. Так же устанавливается свойство *Inherited* в значение *false*, которое запрещает наследование атрибута производными классами (если имеется базовый класс, к которому применен наш атрибут, то при наследовании от этого класса наш атрибут наследоваться не будет).

Так же стоит знать, что любой новый атрибут должен наследоваться от класса *Attribute*, это является обязательным условием.

Ниже пример использования нашего атрибута при создании плагина с кистью рисования «Креста»

```csharp
[DrawTool("Крест", "Инструмент рисования креста", "cross_tool.png", (System.Windows.Forms.Keys.Control | System.Windows.Forms.Keys.R))]
class Cross : IDrawObject
{
...
}
```

Финальным шагом нам необходимо реализовать менеджер плагинов, который будет загружать сборки с диска, искать в них плагины, инстанциировать их и складывать в в коллекции для последующего использования в редакторе. Класс является статическим, что бы упростить вызов и доступ к плагинам из любого места редактора.

Основные шаги, которые должен выполнять менеджер:

- Последовательно загружать сборки (с расширением dll) с диска
- Для каждой сборки получать все типы, находящиеся в этой сборке
- Для каждого типа получить список его кастомных атрибутов
- Проверить, реализует ли тип один из интерфейсов плагинов (*IDrawObject, IEditTool, ICalcTool*)
- Проверить, имеет ли тип один из атрибутов, описывающих кисть
- Если описанные выше условия выполняются — то необходимо инстанциировать кисть и добавить ее в соответствующий список.

В работе всего этого хозяйства будут использоваться классы из пространства имен *System.Reflection*, а именно следующие:

- [Assembly](https://msdn.microsoft.com/ru-ru/library/System.Reflection.Assembly(v=vs.110).aspx), представляет саму сборку
- [Activator](https://msdn.microsoft.com/ru-ru/library/System.Activator(v=vs.110).aspx), предоставляет возможность инстанциировать экземпляр класса
- [MemberInfo](https://msdn.microsoft.com/ru-ru/library/System.Reflection.MemberInfo(v=vs.110).aspx), предоставляет сведения об атрибутах компонента и дает доступ к его свойствам
- Так же используем метод [IsAssignableFrom](https://msdn.microsoft.com/query/dev11.query?appId=Dev11IDEF1&l=RU-RU&k=k(System.Type.IsAssignableFrom);k(TargetFrameworkMoniker-.NETFramework,Version%3Dv3.5);k(DevLang-csharp)&rd=true) класса *Type*, который позволяет определить унаследован ли наш тип от другого типа

```csharp
static class PluginManager
{
        /// <summary>
        /// Загружать ли плагины при старте
        /// </summary>
        public static bool IsLoadPlugins = false;

        /// <summary>
        /// Возвращает список объектов рисования
        /// </summary>
        public static IEnumerable<IDrawObject> DrawObjectInstances { get; private set; }
        /// <summary>
        /// Возвращает список кистей редактирования
        /// </summary>
        public static IEnumerable<IEditTool> EditToolInstances { get; private set; }
        /// <summary>
        /// Возвращает список расчетных инструментов
        /// </summary>
        public static IEnumerable<ICalcTool> CalcToolInstances { get; private set; }

        /// <summary>
        /// Флаг об успешной загрузке сборок плагинов
        /// </summary>
        public static bool IsPluginsLoaded
        {
            get
            {
                if (_pluginCache == null || _pluginCache.Count == 0) return false;
                return true;
            }
        }

        /// <summary>
        /// Загружает все модули в словарь и возвращает его
        /// </summary>
        public static bool LoadAllModules(string path)
        {
            InitCollections();

            if (!IsLoadPlugins)
            {
                return false;
            }

            if (string.IsNullOrEmpty(path)) return false;

            foreach (string fileName in Directory.GetFiles(path/*, "*.dll"*/))
            {
                Assembly asm = null;
                string asmPath = Path.Combine(path, fileName);
                bool isAsm = false;
                bool isPlugin = false;

                try
                {
                        asm = Assembly.LoadFile(asmPath);

                        foreach (Type type in asm.GetTypes())
                        {
                            foreach (Attribute attribute in type.GetCustomAttributes(typeof (Attribute), true))
                            {
                                //кисти рисования
                                if (
                                    //если тип поддерживает соответствующий атрибут
                                    attribute is DrawToolAttribute
                                    &&
                                    //и отвечает соответствующему интерфейсу
                                    typeof (IDrawObject).IsAssignableFrom(type)
                                    )
                                {
                                    //инстанциируем экземпляр кисти из плагина
                                    DrawObjectInstances.Add(Activator.CreateInstance(type) as IDrawObject);
                                    break;
                                }

                                //кисти редактирования
                                if (
                                    //если тип поддерживает соответствующий атрибут
                                    attribute is EditToolAttribute
                                    &&
                                    //и отвечает соответствующему интерфейсу
                                     typeof (IEditTool).IsAssignableFrom(type)
                                    )
                                {
                                    //инстанциируем экземпляр кисти из плагина
                                    EditToolInstances.Add(Activator.CreateInstance(type) as IDrawObject);
                                    break;
                                }

                                //расчетные кисти
                                if (
                                    //если тип поддерживает соответствующий атрибут
                                    attribute is CalcToolAttribute
                                    &&
                                    //и отвечает соответствующему интерфейсу
                                     typeof (ICalcTool).IsAssignableFrom(type)
                                    )
                                {
                                    //инстанциируем экземпляр кисти из плагина
                                    CalcToolInstances.Add(Activator.CreateInstance(type) as IDrawObject);
                                    break;
                                }
                            }
                        }
                }
                catch(ApplicationException ex)
                {
                    MessageBox.Show("Ошибка при загрузке плагина из сборки " + fileName, "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

            return true;
        }

        /// <summary>
        /// Инициализирует пустые коллекции элементов плагинов (необходимо для случая, когда редактор загружается с выключенной возможностью использования плагинов, просто инициализирует пустые коллекции кистей)
        /// </summary>
        private static void InitCollections()
        {
            DrawObjectInstances = new List<IDrawObject>();
            EditToolInstances = new List<IEditTool>();
            CalcToolInstances = new List<ICalcTool>();
        }
}
```

Вот собственно и все, что следовало написать по этой теме. Остается только вызвать метод *LoadAllModules()* для загрузки плагинов и забрать свой плагин из соответствующей коллекции.

В качестве завершения, из статьи мы получили следующую информацию:

- Узнали, как построить простую (и не совсем простую) инфраструктуру плагинов для своей программы
- Рассмотрели реализацию простейшего интерфейса для плагина
- Узнали как реализовать собственный атрибут
- Разобрались с тем, как загружать сборки с диска, искать в них типы и получить список атрибутов этих типов
- Узнали как инстанциировать типы при помощи класса *Activator*

В качестве домашней работы можно модифицировать код загрузки плагинов так, что бы он мог отделить управляемую сборку от неуправляемой, обработать такую ситуацию корректно и не упасть при этом :)
