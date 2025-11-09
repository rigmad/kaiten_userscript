// ==UserScript==
// @name         Kaiten X5 — шаблоны причин блокировки (между кнопками)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Добавляет выпадающий список шаблонов между кнопками "Редактировать markdown" и "Отменить" на kaiten.x5.ru для поля "Введите причину блокировки"
// @author       rigmad
// @homepageURL  https://github.com/rigmad/kaiten_userscript/
// @updateURL    https://github.com/rigmad/kaiten_userscript/raw/refs/heads/main/kaiten-x5-block-reason-templates.user.js
// @downloadURL  https://github.com/rigmad/kaiten_userscript/raw/refs/heads/main/kaiten-x5-block-reason-templates.user.js
// @supportURL   https://github.com/rigmad/kaiten_userscript/issues
// @match        https://kaiten.x5.ru/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Шаблоны причин блокировки
    const templates = [
        "[Отсутствие доступов] – краткий комментарий",
        "[Выполнение на 3 стороне] – ИЗМ-00000001",
        "[Ожидание решения заказчика] – Выбор между двумя вариантами реализации",
        "[Ожидание обратной связи] – Ожидание комментариев по конфигурации переменных сервиса",
        "[Тестирование заказчиком] - проверка функционала Б",
        "[Ожидание зависимой задачи] – Ожидание завершения миграции данных",
        "[Отложенное] - Заказчик",
        "[Технические проблемы] – портал xxx.ru недоступен.",
    ];

    // Вставка шаблона в contenteditable
    function insertTemplate(editableDiv, text) {
        if (!editableDiv) return;
        editableDiv.focus();

        const placeholder = editableDiv.querySelector('.placeholder');
        if (placeholder) placeholder.remove();

        editableDiv.innerHTML = `<p>${text}</p>`;

        // Ставим курсор в конец
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(editableDiv);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Создание выпадающего списка
    function createDropdown(editableDiv) {
        const select = document.createElement('select');
        select.id = 'template-dropdown';
        select.style.padding = '4px 8px';
        select.style.border = '1px solid #ccc';
        select.style.borderRadius = '6px';
        select.style.fontSize = '13px';
        select.style.cursor = 'pointer';
        select.style.background = '#fff';
        select.style.marginLeft = '8px';
        select.style.marginRight = '8px';
        select.style.maxWidth = '300px';
        select.title = 'Выберите шаблон причины блокировки';

        const defaultOption = document.createElement('option');
        defaultOption.textContent = '🧩 Вставить шаблон...';
        defaultOption.value = '';
        select.appendChild(defaultOption);

        templates.forEach(tpl => {
            const opt = document.createElement('option');
            opt.value = tpl;
            opt.textContent = tpl.length > 80 ? tpl.slice(0, 77) + '…' : tpl;
            select.appendChild(opt);
        });

        select.addEventListener('change', e => {
            if (!e.target.value) return;
            insertTemplate(editableDiv, e.target.value);
            e.target.selectedIndex = 0;
        });

        return select;
    }

    // Добавление dropdown между кнопками
    function insertDropdown(editableDiv) {
        if (document.querySelector('#template-dropdown')) return;

        // Ищем панель действий
        const actionsContainer = editableDiv
            .closest('[data-testid="block-card-text-reason"]')
            ?.querySelector('[data-testid="editor-main-actions"]');

        if (!actionsContainer) return;

        // Кнопка "Редактировать markdown" — это с data-testid пустым и иконкой MoreVertIcon
        const moreBtn = actionsContainer
            .closest('[data-testid="block-card-text-reason"]')
            ?.querySelector('svg[data-testid="MoreVertIcon"]')
            ?.closest('button');

        // Кнопка "Отменить"
        const cancelBtn = actionsContainer.querySelector('[data-testid="cancel-button-checklist"]');

        if (!moreBtn || !cancelBtn) return;

        const dropdown = createDropdown(editableDiv);

        // Вставляем dropdown между кнопками
        cancelBtn.parentNode.insertBefore(dropdown, cancelBtn);
    }

    // Наблюдаем за появлением поля
    const observer = new MutationObserver(() => {
        const editable = document.querySelector('div.ProseMirror[contenteditable="true"]');
        if (editable && editable.querySelector('.placeholder')?.textContent.includes('Введите причину блокировки')) {
            insertDropdown(editable);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
