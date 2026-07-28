# LC Transfer — Сайт-візитка

Сайт для генерації трафіку в Telegram/Viber/WhatsApp.  
Автоперевезення по різних напрямках Україна ↔ Європа.

## Структура

```
index.html          — Головна сторінка
style.css           — Стилі (головна)
route.css           — Стилі (сторінки маршрутів)
main.js             — JavaScript
robots.txt          — SEO
sitemap.xml         — SEO
favicon.svg         — Іконка
privacy.html        — Політика конфіденційності
routes/             — Сторінки маршрутів
  kyiv-warsaw.html
  kyiv-krakow.html
  kyiv-bucharest.html
  kyiv-chisinau.html
  kyiv-sofia.html
  kyiv-wroclaw.html
  kyiv-gdansk.html
  kyiv-berlin.html
  lviv-warsaw.html
  odesa-warsaw.html
  odesa-chisinau.html
```

## Що потрібно змінити перед публікацією

1. Замінити `+380XXXXXXXXX` на реальний номер телефону
2. Замінити `@lctransfer` на реальний Telegram-нікнейм
3. Замінити `https://lc-transfer.com` на реальний домен
4. В `_config.yml` оновити `url`
5. В `sitemap.xml` оновити дати

## Deploy на GitHub Pages

1. Завантажити всі файли в репозиторій
2. Settings → Pages → Source: Deploy from branch → main / (root)
3. Сайт буде доступний за адресою `https://username.github.io/repo-name/`
