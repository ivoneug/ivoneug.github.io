// Xcode Pilot landing copy, served at /pilot/ (English) and /pilot/ru/ (Russian); pilot.ivon.dev redirects here.
// Words wrapped in *asterisks* are highlighted with the accent colour, `backticks` become inline code.

export const PILOT = {
	name: 'Xcode Pilot',
	repo: 'https://github.com/ivoneug/xcode-pilot',
	license: 'https://github.com/ivoneug/xcode-pilot/blob/main/LICENSE',
	// The release asset keeps this name in every release (see Scripts/release.sh in the app's repository)
	download: 'https://github.com/ivoneug/xcode-pilot/releases/latest/download/XcodePilot.dmg',
	latestRelease: 'https://github.com/ivoneug/xcode-pilot/releases/latest',
	shortUrl: 'pilot.ivon.dev',
};

export const PILOT_LANGS = ['en', 'ru'] as const;
export type PilotLang = (typeof PILOT_LANGS)[number];

export const pilotPath = (lang: PilotLang) => (lang === 'en' ? '/pilot/' : `/pilot/${lang}/`);

// Panel tabs shown in the tour, in the app's order. Screenshots live in src/assets/pilot/shots/.
export const PILOT_SHOTS = ['issues', 'log', 'console'] as const;
export type PilotShot = (typeof PILOT_SHOTS)[number];

// Menu bar icon states, rendered by the app's own StatusIconRenderer into src/assets/pilot/status/.
export const PILOT_STATES = ['idle', 'building', 'failed', 'succeeded', 'running'] as const;
export type PilotState = (typeof PILOT_STATES)[number];

// The icon state each tab is shown with, as after the build that filled it.
export const PILOT_SHOT_STATES: Record<PilotShot, PilotState> = { issues: 'failed', log: 'succeeded', console: 'running' };

// What the status item shows next to the icon in each state (elapsed time, red error count).
export const PILOT_STATE_TITLES: Record<PilotState, { text: string; alert?: boolean }> = {
	idle: { text: '' },
	building: { text: '0:42' },
	failed: { text: '2', alert: true },
	succeeded: { text: '' },
	running: { text: '' },
};

export const PILOT_SHORTCUTS = {
	global: [
		{ keys: ['⌃', '⌥', '⌘', 'R'], action: 'run' },
		{ keys: ['⌃', '⌥', '⌘', 'B'], action: 'build' },
		{ keys: ['⌃', '⌥', '⌘', '.'], action: 'stop' },
		{ keys: ['⌃', '⌥', '⌘', 'X'], action: 'panel' },
	],
	panel: [
		{ keys: ['⌘', 'R'], action: 'run' },
		{ keys: ['⌘', 'B'], action: 'build' },
		{ keys: ['⌘', '.'], action: 'stop' },
		{ keys: ['⌘', 'U'], action: 'test' },
		{ keys: ['⇧', '⌘', 'K'], action: 'clean' },
	],
} as const;

type ShortcutAction = 'run' | 'build' | 'stop' | 'panel' | 'test' | 'clean';

export interface PilotCopy {
	meta: { title: string; description: string; locale: string };
	nav: { tour: string; features: string; shortcuts: string; install: string; github: string };
	langLabel: string;
	skip: string;
	hero: { comment: string; title: string; lead: string; primary: string; secondary: string; facts: string[] };
	demo: { alt: string; menus: string[]; clock: string };
	tour: { comment: string; title: string; items: Record<PilotShot, { tab: string; title: string; text: string; alt: string }> };
	states: { comment: string; title: string; items: Record<PilotState, { name: string; text: string }> };
	features: { comment: string; title: string; items: { title: string; text: string }[] };
	shortcuts: { comment: string; title: string; global: string; panel: string; actions: Record<ShortcutAction, string> };
	hood: { comment: string; title: string; text: string; permissionsTitle: string; permissions: string[] };
	limits: { comment: string; title: string; items: string[] };
	install: {
		comment: string;
		title: string;
		text: string;
		download: string;
		source: string;
		fromSource: string;
		note: string;
		codeComments: string[];
	};
	footer: { license: string; source: string; author: string };
}

export const PILOT_COPY: Record<PilotLang, PilotCopy> = {
	en: {
		meta: {
			title: 'Xcode Pilot — build and run Xcode projects from the menu bar',
			description:
				'A free, open-source macOS menu bar app that builds, runs, tests and archives Xcode projects through xcodebuild, simctl and devicectl, so Xcode.app can stay closed.',
			locale: 'en_US',
		},
		nav: { tour: 'panel', features: 'features', shortcuts: 'shortcuts', install: 'install', github: 'GitHub' },
		langLabel: 'English',
		skip: 'Skip to content',
		hero: {
			comment: '// macOS menu bar app · free & open source',
			title: 'Build and run Xcode projects *from the menu bar*.',
			lead: 'Xcode Pilot drives `xcodebuild`, `simctl` and `devicectl` for you. Pick a scheme and a device, press ⌃⌥⌘R in any app, and read errors and `print` output right in the panel. Xcode.app can stay closed.',
			primary: 'download for macOS ↓',
			secondary: 'source on GitHub',
			facts: ['macOS 14+', 'Xcode 26', 'MIT license'],
		},
		demo: {
			alt: 'Xcode Pilot panel under its menu bar icon after a failed build: two errors with the compiler’s code snippets and two warnings',
			menus: ['Finder', 'File', 'Edit', 'View'],
			clock: 'Mon 9:41',
		},
		tour: {
			comment: '// the panel',
			title: 'Everything you open Xcode for',
			items: {
				issues: {
					tab: 'Issues',
					title: 'Errors and warnings',
					text: 'With the code snippet from the compiler and a filter by type. Copy an issue as `file:line:col: error: …`, copy all of them at once, or open it at the right line in Xcode, VS Code, Cursor or Zed. After the build the list is reconciled with the `.xcresult`, so nothing gets lost or duplicated.',
					alt: 'Issues tab: a failed build with two errors, their code snippets, and two warnings',
				},
				log: {
					tab: 'Log',
					title: 'Build log',
					text: 'Condensed to tasks, diagnostics and the result, or in full with ⌘F search. Copy it in one click or open the full log as a file.',
					alt: 'Log tab: the condensed log of a successful build',
				},
				console: {
					tab: 'Console',
					title: 'Console of the running app',
					text: 'Run builds, installs and launches the app on a simulator, a connected device or the Mac, and stays attached: `print` output streams here. The filter works like Xcode’s — Return turns the text into a token, a token that starts with a minus hides lines.',
					alt: 'Console tab: print output of the sample app running on an iPhone simulator',
				},
			},
		},
		states: {
			comment: '// the menu bar',
			title: 'The icon tells you how the build went',
			items: {
				idle: {
					name: 'Ready',
					text: 'Click for the panel. Right-click for a menu with the main actions and the project, scheme and device pickers.',
				},
				building: {
					name: 'Building',
					text: 'A progress ring estimated from the previous identical build, and the build time next to the icon.',
				},
				failed: { name: 'Failed', text: 'A red badge and the number of errors.' },
				succeeded: { name: 'Succeeded', text: 'A green badge. It stays for 30 seconds, or until the next action if you prefer.' },
				running: { name: 'Running', text: 'The app is running and its console is attached. Stop is one shortcut away.' },
			},
		},
		features: {
			comment: '// features',
			title: 'The small things add up',
			items: [
				{
					title: 'Any project',
					text: '`.xcodeproj`, `.xcworkspace` or a Swift package. Recent projects are remembered, and the ones Xcode opened lately are picked up from DerivedData.',
				},
				{
					title: 'Scheme, destination, configuration',
					text: 'Just like Xcode’s toolbar. Destinations come from `xcodebuild -showdestinations`, so the list only shows what the scheme can actually run on.',
				},
				{
					title: 'Archives',
					text: 'Go where Xcode puts them and show up in the Organizer right away. Export for App Store Connect, Ad Hoc, Development, Enterprise or Developer ID, or upload to App Store Connect from the panel.',
				},
				{
					title: 'Devices and simulators',
					text: 'A tab with simulators (boot, shut down, show) and connected devices, any of which can be the run destination. Organizer and Devices and Simulators are one click away.',
				},
				{
					title: 'Notifications and sounds',
					text: 'A notification when a build finishes while the panel is closed, optional sounds, launch at login.',
				},
				{
					title: 'More than one Xcode',
					text: 'Pick the Xcode builds use when several are installed. Detach the panel into its own window when you want it to stay open.',
				},
			],
		},
		shortcuts: {
			comment: '// shortcuts',
			title: 'Hands stay on the keyboard',
			global: 'from any app',
			panel: 'in the panel',
			actions: { run: 'run', build: 'build', stop: 'stop', panel: 'show or hide the panel', test: 'test', clean: 'clean build folder' },
		},
		hood: {
			comment: '// under the hood',
			title: 'Just Apple’s command-line tools',
			text: 'No private frameworks and no Xcode plugins. Xcode Pilot runs the tools you would run in Terminal and parses their output. It shares DerivedData with Xcode, so incremental builds stay incremental in both.',
			permissionsTitle: 'Permissions',
			permissions: [
				'*Accessibility* — only for the Organizer and Devices and Simulators buttons. Xcode has no URL scheme or AppleScript command for these windows, so the app presses their items in Xcode’s Window menu.',
				'*Notifications* — asked for with the first build-finished notification.',
			],
		},
		limits: {
			comment: '// good to know',
			title: 'Limitations',
			items: [
				'While Xcode itself is building the same project, a parallel build from Xcode Pilot waits for the DerivedData lock: both share one folder.',
				'Packages with macros and plugins that were never trusted in Xcode won’t build with `xcodebuild`. For those, settings have “Skip macro and plugin validation”.',
				'Running on the Mac as “Designed for iPad” isn’t supported; such destinations are hidden.',
				'Build progress is an estimate based on the last successful build of the same scheme: `xcodebuild` doesn’t report the total number of tasks.',
			],
		},
		install: {
			comment: '// install',
			title: 'Free and open source',
			text: 'Download the notarized DMG, drag Xcode Pilot to Applications and open it: it lives in the menu bar. It is released under the MIT license.',
			download: 'download the DMG ↓',
			source: 'source on GitHub →',
			fromSource: '// or build it from source with Xcode 26',
			note: 'Set your team in `Scripts/project.env` (`DEVELOPMENT_TEAM_ID`) and run the `XcodePilot` scheme. Signing with your team keeps macOS from resetting the Accessibility permission after every rebuild.',
			codeComments: ['# project generators and the linter', '# generates XcodePilot.xcodeproj'],
		},
		footer: { license: 'MIT license', source: 'source on GitHub', author: 'made by' },
	},
	ru: {
		meta: {
			title: 'Xcode Pilot — сборка и запуск Xcode-проектов из строки меню',
			description:
				'Бесплатное приложение с открытым кодом для строки меню macOS: собирает, запускает, тестирует и архивирует Xcode-проекты через xcodebuild, simctl и devicectl, а Xcode.app может оставаться закрытым.',
			locale: 'ru_RU',
		},
		nav: { tour: 'панель', features: 'возможности', shortcuts: 'клавиши', install: 'установка', github: 'GitHub' },
		langLabel: 'Русский',
		skip: 'Перейти к содержимому',
		hero: {
			comment: '// приложение для строки меню macOS · open source',
			title: 'Собирайте и запускайте Xcode-проекты *из строки меню*.',
			lead: 'Xcode Pilot сам вызывает `xcodebuild`, `simctl` и `devicectl`. Выберите схему и устройство, нажмите ⌃⌥⌘R в любом приложении — ошибки и вывод `print` появятся прямо в панели. Xcode.app при этом может быть закрыт.',
			primary: 'скачать для macOS ↓',
			secondary: 'исходники на GitHub',
			facts: ['macOS 14+', 'Xcode 26', 'лицензия MIT'],
		},
		demo: {
			alt: 'Панель Xcode Pilot под иконкой в строке меню после неудачной сборки: две ошибки с фрагментами кода от компилятора и два предупреждения',
			menus: ['Finder', 'Файл', 'Правка', 'Вид'],
			clock: 'Пн 9:41',
		},
		tour: {
			comment: '// панель',
			title: 'Всё, ради чего открывают Xcode',
			items: {
				issues: {
					tab: 'Ошибки',
					title: 'Ошибки и предупреждения',
					text: 'С фрагментом кода от компилятора и фильтром по типу. Любую ошибку можно скопировать в формате `file:line:col: error: …`, скопировать все разом или открыть на нужной строке в Xcode, VS Code, Cursor или Zed. После сборки список сверяется с `.xcresult`, так что ничего не теряется и не дублируется.',
					alt: 'Вкладка «Ошибки»: неудачная сборка, две ошибки с фрагментами кода и два предупреждения',
				},
				log: {
					tab: 'Лог',
					title: 'Лог сборки',
					text: 'Краткий — задачи, диагностика и результат — или полный, с поиском по ⌘F. Его можно скопировать одной кнопкой или открыть полный лог файлом.',
					alt: 'Вкладка «Лог»: краткий лог успешной сборки',
				},
				console: {
					tab: 'Консоль',
					title: 'Консоль запущенного приложения',
					text: 'Run собирает, ставит и запускает приложение на симуляторе, подключённом устройстве или Mac и остаётся к нему подключённым: вывод `print` идёт сюда. Фильтр — как в Xcode: Return превращает текст в токен, токен с минусом в начале скрывает строки.',
					alt: 'Вкладка «Консоль»: вывод print тестового приложения, запущенного на симуляторе iPhone',
				},
			},
		},
		states: {
			comment: '// строка меню',
			title: 'Иконка сама скажет, как прошла сборка',
			items: {
				idle: {
					name: 'Готово',
					text: 'Клик открывает панель. Правый клик — меню с основными действиями и выбором проекта, схемы и устройства.',
				},
				building: {
					name: 'Сборка',
					text: 'Кольцо прогресса — оценка по длительности прошлой такой же сборки — и время сборки рядом с иконкой.',
				},
				failed: { name: 'Ошибка', text: 'Красный бейдж и число ошибок.' },
				succeeded: { name: 'Успех', text: 'Зелёный бейдж. Висит 30 секунд — или до следующего действия, если так удобнее.' },
				running: { name: 'Запущено', text: 'Приложение работает, консоль подключена. Остановить — одно сочетание клавиш.' },
			},
		},
		features: {
			comment: '// возможности',
			title: 'Мелочи, из которых всё и складывается',
			items: [
				{
					title: 'Любой проект',
					text: '`.xcodeproj`, `.xcworkspace` или Swift-пакет. Недавние проекты запоминаются, а те, что недавно открывал Xcode, подтягиваются из DerivedData.',
				},
				{
					title: 'Схема, устройство, конфигурация',
					text: 'Как в тулбаре Xcode. Список устройств берётся из `xcodebuild -showdestinations`, поэтому в нём только то, на чём схема реально запускается.',
				},
				{
					title: 'Архивы',
					text: 'Кладутся туда же, куда их кладёт Xcode, и сразу видны в Organizer. Экспорт для App Store Connect, Ad Hoc, Development, Enterprise или Developer ID и загрузка в App Store Connect — прямо из панели.',
				},
				{
					title: 'Устройства и симуляторы',
					text: 'Вкладка с симуляторами (загрузить, выключить, показать) и подключёнными девайсами, любой можно выбрать для запуска. Organizer и Devices and Simulators — в один клик.',
				},
				{
					title: 'Уведомления и звуки',
					text: 'Уведомление, если сборка закончилась при закрытой панели, звуки по желанию, запуск при входе.',
				},
				{
					title: 'Несколько Xcode',
					text: 'Выбор версии Xcode для сборки, если их установлено несколько. Панель можно открепить в отдельное окно, чтобы она не закрывалась.',
				},
			],
		},
		shortcuts: {
			comment: '// клавиши',
			title: 'Руки остаются на клавиатуре',
			global: 'из любого приложения',
			panel: 'в панели',
			actions: {
				run: 'запустить',
				build: 'собрать',
				stop: 'остановить',
				panel: 'показать или скрыть панель',
				test: 'тесты',
				clean: 'очистить сборку',
			},
		},
		hood: {
			comment: '// под капотом',
			title: 'Только инструменты командной строки Apple',
			text: 'Никаких приватных фреймворков и плагинов для Xcode. Xcode Pilot запускает те же утилиты, что вы запустили бы в терминале, и разбирает их вывод. DerivedData общая с Xcode, поэтому инкрементальная сборка работает и там, и тут.',
			permissionsTitle: 'Разрешения',
			permissions: [
				'*Универсальный доступ* — только для кнопок Organizer и Devices and Simulators. У Xcode нет ни URL-схемы, ни AppleScript-команды для этих окон, поэтому приложение нажимает их пункты в меню Window.',
				'*Уведомления* — спрашиваются при первом уведомлении о завершении сборки.',
			],
		},
		limits: {
			comment: '// стоит знать',
			title: 'Ограничения',
			items: [
				'Пока Xcode сам собирает тот же проект, параллельная сборка из Xcode Pilot ждёт блокировку DerivedData: у них одна папка на двоих.',
				'Пакеты с макросами и плагинами, которым ни разу не доверяли в Xcode, через `xcodebuild` не соберутся. Для них в настройках есть «Не проверять макросы и плагины».',
				'Запуск на Mac в режиме «Designed for iPad» не поддерживается, такие устройства скрыты.',
				'Прогресс сборки — оценка по прошлой успешной сборке той же схемы: `xcodebuild` не сообщает общее число задач.',
			],
		},
		install: {
			comment: '// установка',
			title: 'Бесплатно и с открытым кодом',
			text: 'Скачайте нотаризованный DMG, перетащите Xcode Pilot в «Программы» и запустите: он живёт в строке меню. Распространяется по лицензии MIT.',
			download: 'скачать DMG ↓',
			source: 'исходники на GitHub →',
			fromSource: '// или соберите из исходников в Xcode 26',
			note: 'Укажите свою команду в `Scripts/project.env` (`DEVELOPMENT_TEAM_ID`) и запустите схему `XcodePilot`. Подпись своей командой нужна, чтобы macOS не сбрасывала разрешение на универсальный доступ после каждой пересборки.',
			codeComments: ['# генераторы проекта и линтер', '# создаёт XcodePilot.xcodeproj'],
		},
		footer: { license: 'лицензия MIT', source: 'исходники на GitHub', author: 'автор —' },
	},
};
