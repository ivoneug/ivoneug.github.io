---
title: "Пример использования Обобщений (Generics) в C#"
description: "Давеча потребовалось реализовать инфраструктуру объектов-оберток для редактора роллет."
date: 2015-01-03T13:43:00+03:00
tags: ["csharp", "dotnet", "generics"]
lang: ru
kind: article
originalUrl: "https://bibobo.ru/all/primer-ispolzovaniya-oboscheniy-generics-v-c/"
---
Давеча потребовалось реализовать инфраструктуру объектов-оберток для редактора роллет.

Исходная задача была следующей:

- Есть построитель роллет, который имеет ряд коллекций с объектами разных типов, описывающими один из элементов роллеты (привод, направляющая, ламель и т. п.)
- Необходимо реализовать логику расчета роллеты по уже заполненному списку параметров
- Внутренние типы построителя наследуются от базового класса *RollCalc.Model.CommonProperties*

Для упрощения реализации было решено создать свой набор объектов, описывающих каждый из элементов роллеты, чтобы не иметь жесткую связь с внутренними объектами редактора (ибо работать с ними было весьма не удобно). В своих объектах можно реализовать любой набор методов и свойств, которые существенно облегчат расчет и избавят нас от хардкода.\
Естественно создавать свои объекты и заполнять их базовые свойства нужно по внутренним коллекциям редактора и желательно парой строчек кода. Пожалуй в данной ситуации наилучший выход — использовать обобщения языка C#. Они позволят нам написать бизнес логику один раз и использовать ее для разных классов (логика-то сходная).

Построим инфраструктуру следующим образом:

- Реализуем абстрактный базовый класс *RollCalcElementBase\<T>*, который будет содержать всю логику по заполнению общих полей для всех типов-наследников. Почему именно базовый класс, а не интерфейс? Чтобы не париться с реализацией базовой логики в каждом классе-наследнике.
- В базовом классе обязательно реализуем метод *public virtual void InitFromPresentationObject(T presentationObject)*, который будет инициализировать экземпляр базового класса по его *представлению* из объекта редактора роллет
- Реализуем произвольное количество классов-наследников от *RollCalcElementBase\<T>*, в которых можно будет расширить функционал базового класса или переопределить его
- В основном классе программы создадим коллекции наших объектов-наследников
- Там же, в основном классе добавим метод, создающий наши объекты по коллекциям объектов редактора
- Плюс нужен будет метод, получающий экземпляр одного из наших объектов по его типу и наименованию *(так уж сложилось, что расчет спецификации роллеты сильно зависит от производителя, а значит и от артикула того или иного элемента)*

## Весь код был упрощен, что бы не раздувать статью.

Обязательно перед чтением кода необходимо понять как можно накладывать ограничения на использование типов в обобщенном классе или методе. Очень хорошо про это описано на MSDN в статье [Ограничения параметров типа](https://msdn.microsoft.com/ru-ru/library/d5x73970.aspx)

Код базового класса и классов-наследников:

```csharp
/// <summary>
    /// Базовый класс элемент роллет
    /// Обратите внимание на предложение where
    /// where T : RollCalc.Model.CommonProperties - накладываем ограничение на использование типа в обобщенном классе, только тип элемента построителя роллет
    /// </summary>
    /// <typeparam name="T">Элемент построителя роллет</typeparam>
    public abstract class RollCalcElementBase<T> where T : RollCalc.Model.CommonProperties
    {
        public string Name { get; set; }

        private bool _enabled;

        public bool Enabled
        {
            get { return _enabled; }
            set
            {
                _enabled = value;
                if (PresentationObject != null) PresentationObject.Visible = value;
            }
        }
        public T PresentationObject { get; set; }

        /// <summary>
        /// Инициализировать из объекта роллеты
        /// </summary>
        /// <param name="presentationObject">объект роллеты</param>
        public virtual void InitFromPresentationObject(T presentationObject)
        {
            Name = presentationObject.Description;
            Enabled = presentationObject.Visible;
            PresentationObject = presentationObject;

            presentationObject.Tag = this;
        }
    }

    /// <summary>
    /// Профиль ламели
    /// </summary>
    public class Profile : RollCalcElementBase<LamellaProfile>
    {
    }

    /// <summary>
    /// Тип короба
    /// </summary>
    public class Collar : RollCalcElementBase<ProtectiveCollarType>
    {
    }

    /// <summary>
    /// Привод роллеты
    /// </summary>
    public class Drive : RollCalcElementBase<DriveSystem>
    {
        public int MaxWeight { get; set; }

        public bool CalcEnabled(decimal rollWidth)
        {
            Enabled = rollWidth <= MaxWeight;
            return Enabled;
        }

        public override void InitFromPresentationObject(DriveSystem presentationObject)
        {
            object tag = presentationObject.Tag;

            base.InitFromPresentationObject(presentationObject);

            if (tag is int)
            {
                MaxWeight = Convert.ToInt32(tag);
            }
        }
    }
```

Код из основного класса (коллекции наших объектов, а так же методы загрузки и получения экземпляра нашего объекта:

```csharp
private List<Drive> _drives = new List<Drive>();
        public List<Drive> Drives {get { return _drives; }}

        private List<Profile> _profiles = new List<Profile>();
        public List<Profile> Profiles{get { return _profiles; }}

        private List<Collar> _collars = new List<Collar>();
        public List<Collar> Collars{get { return _collars; }}

        /// <summary>
        /// Загрузка и связывание элемента из списка элементов построителя роллет
        /// Обратите внимание на предложения where в заголовке метода
        /// where T : RollCalc.Model.CommonProperties - ограничивает нас по исходному типу объекта роллеты
        /// where T2 : RollCalcElementBase<T>, new() - вводит следующее ограничение: наследник базового класса RollCalcElementBase<T>, имеющий конструктор без параметров (т.е. именно НАСЛЕДНИК, подставить сюда базовый класс уже не получится, поскольку он абстрактный и сконструировать его мы не сможем
        /// </summary>
        /// <typeparam name="T">элемент построителя</typeparam>
        /// <typeparam name="T2">наш связанный элемент</typeparam>
        /// <param name="list"></param>        
        public void LoadFromElementList<T, T2>(IList<T> list)
            where T : RollCalc.Model.CommonProperties
            where T2 : RollCalcElementBase<T>, new()
        {
            List<T2> elements = new List<T2>();

            //создаем наши объекты по объектам построителя, складываем их в список
            foreach (T sourceElement in list)
            {
                T2 element = new T2();
                element.InitFromPresentationObject(sourceElement);
                elements.Add(element);
            }

            //та самая магия, выбираем по типу нашего объекта соответствующую переменную коллекции и присваиваем нашу коллекцию ей
            if (typeof (T2) == typeof (Drive)) _drives = elements.Cast<Drive>().ToList();
            if (typeof(T2) == typeof(Profile)) _profiles = elements.Cast<Profile>().ToList();
            if (typeof (T2) == typeof (Collar)) _collars = elements.Cast<Collar>().ToList();
        }

        /// <summary>
        /// Возвращает элемент по имени
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="name"></param>
        /// <returns></returns>
        public T GetElementByName<T>(string name)
            where T : class
        {
            //объявляем переменную коллекции нашего базового типа
            List<RollCalcElementBase<RollCalc.Model.CommonProperties>> list = null;

            //делаем обратное действие - по переданному типу Т ищем правильную коллекцию наших объектов-наследников и кастуем их к базовому типу
            if (typeof (T) == typeof (Drive))
            {
                list = _drives.Cast<RollCalcElementBase<RollCalc.Model.CommonProperties>>().ToList();
            }
            if (typeof (T) == typeof (Profile))
            {
                list = _profiles.Cast<RollCalcElementBase<RollCalc.Model.CommonProperties>>().ToList();
            }
            if (typeof (T) == typeof (Collar))
            {
                list = _collars.Cast<RollCalcElementBase<RollCalc.Model.CommonProperties>>().ToList();
            }

            //ищем экземпляр в коллекции по наименованию и возвращаем его (при этом кастуем его к типу-наследнику)
            if (list != null)
            {
                foreach (RollCalcElementBase<CommonProperties> elementBase in list)
                {
                    if (elementBase.Name.ToLower() == name.ToLower())
                    {
                        return elementBase as T;
                    }
                }
            }

            return null;
        }
```

Вот пожалуй и все пироги, на последок пример кода формирования коллекции наших объектов по базовой коллекции построителя:

```csharp
RollCalcSettings.Settings.LoadFromElementList<DriveSystem, Drive>(settings.DriveSystems);
RollCalcSettings.Settings.LoadFromElementList<LamellaProfile, Profile>(settings.LamellaProfiles);
RollCalcSettings.Settings.LoadFromElementList<ProtectiveCollarType, Collar>(settings.ProtectiveCollarTypes);
```

Используя такой подход мы добились следующего:

- Избавили себя от мороки в работе с исходными объектами построителя
- Сохранили связь с исходными объектами (свойство *public T PresentationObject { get; set; }* в базовом классе)
- Добавили гибкости всей системе за счет возможности расширять функционал наследников наших объектов, например тот или иной элемент роллеты может или не может иметь цвет
- Реализовали один метод инициализации и один метод получения экземпляра для любого типа объекта в системе
- Узнали тонкости в накладывании ограничений на использование обобщенного типа в классе или методе
