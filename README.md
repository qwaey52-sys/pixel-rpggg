# Pixel RPG

Горизонтальная пиксельная RPG на Phaser 3 с сборкой APK через GitHub Actions.

## Как выпустить APK
1. Запушь репозиторий в GitHub.
2. Создай тег: `git tag v0.1.0 && git push --tags`.
3. Workflow `Build APK` соберёт `pixel-rpg.apk` и приложит его к релизу.
   Также можно запустить вручную во вкладке Actions.

## Музыка
Положи файлы в `public/assets/music/` с именами:
- `town.ogg`: исследование и меню
- `battle.ogg`: бой в ритме
- `ending_good.ogg` и `ending_bad.ogg`: концовки

Если файла нет, игра играет встроенную chiptune-мелодию.

## Управление
- ПК: стрелки, пробел для разговора.
- Телефон: кнопки на экране. В бою тап по дорожкам внизу.

## Структура
- `src/scenes/`: сцены (меню, мир, диалоги, бой, концовки)
- `src/gfx/sprites.js`: пиксельные спрайты. Можно заменить на PNG с теми же ключами.
- `src/audio/AudioManager.js`: музыка
- `src/save.js`: сохранение в localStorage
