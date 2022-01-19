/**
 * Создаёт Таблицу в HTML разметке
 */
class Table {
    // Идентификатор элемента для выбора количество отображаемых строк на странице
    #ITEMS_PER_PAGE_ELEMENT = "itemsPerPage";
    // Идентификатор кнопки Назад
    #PREV_BUTTON_ID = "prevButton";
    // Идентификатор кнопки Следующая
    #NEXT_BUTTON_ID = "nextButton";
    // Идентификатор префикса кнопки "Перейти на страницу номер ", например, "page-0"
    #PAGE_NUMBER_PREFIX_ID = "page-";
    // Идентификатор контейнера кнопок
    #BUTTONS_CONTAINER_ID = "container";

    // Конфигурация Таблицы
    #config;
    // Массив, который содержит допустимые опции
    static options = ["10", "20", "50", "100"];

    /**
     * Создаёт таблицу
     *
     * Параметры конфигурации:
     * tableElement - ссылка на элемент Table в DOM,
     * pagesElement - ссылка на элемент, в котором разместится переключатель страниц,
     * rowsNumber - количество строк в таблице для отображения пользователю,
     * pagesNumber - количество страниц, предлагаемых пользователю для переключения между страницами,
     * currentPage - номер текущей, отображаемой страницы,
     * header - список Заголовков колонок Таблицы,
     * data - данные для отображения.
     * @param config конфигурация таблицы
     */
    constructor(config) {
        /**
         * Проверяем входные данные на корректность
         */
        if (!config.tableElement) {
            throw Error("Table element should be provided");
        }
        if (!config.pagesElement) {
            throw Error("Pages element should be provided");
        }
        if (!config.rowsNumber || config.rowsNumber < 3) {
            throw Error("A number of rows should be more then tree elements");
        }
        if (!config.rowsNumber || config.pagesNumber < 1) {
            throw Error("A number of pages should be more then one element");
        }
        if (!config.currentPage || config.currentPage <= 0) {
            throw Error("A number of pages should be more then one element");
        }

        // Запоминаем конфигурацию
        this.#config = config;

        /**
         * Создаём таблицу
         */
        this.#createTable(config);
    }

    /**
     * Создаёт таблицу
     * @param config ссылка на конфигурацию Таблицы
     */
    #createTable(config) {
        /**
         * Удаляем предыдущее содержимое таблицы
         */
        this.#clearChildrenElements(config.pagesElement);
        this.#clearChildrenElements(config.tableElement);

        /**
         * Создаём первоначальную структуру Таблицы в HTML
         */
        this.#createHeader(config);
        this.#createBody(config);
        this.#createPager(config);
    }

    /**
     * Создаёт Заголовок Таблицы
     * @param config ссылка на конфигурацию Таблицы
     */
    #createHeader(config) {
        let headerCaption;

        /**
         * Если нам передали массив с названиями Заголовков колонок, то используем его.
         * Иначе попытаемся взять названия Заголовков как Имена свойств из данных.
         * Если нам не передели ни Заголовков, не Данных, то просто выходим.
         */
        if (config.header && config.header.length !== 0) {
            headerCaption = config.header;
        } else if (config.data && config.data.length > 0) {
            headerCaption = Object.keys(config.data[0]);
        } else {
            return;
        }

        /**
         * Создаём элемент Строка для представления Заголовков
         */
        let tr = document.createElement("tr");

        /**
         * Проходим по всем Заголовкам и добавляем Колонки к Строке
         */
        headerCaption.forEach((caption) => {
            let th = document.createElement("th");
            th.innerText = caption;
            tr.appendChild(th);
        });

        /**
         * Создаём элемент Заголовок и добавляем к нему Строку с Заголовками Колонок
         */
        const thead = document.createElement("thead");
        thead.appendChild(tr);

        /**
         * Добавили в Таблицу Заголовок
         */
        config.tableElement.appendChild(thead);
    }

    /**
     * Создаёт тело Таблицы
     * @param config ссылка на конфигурацию Таблицы
     */
    #createBody(config) {
        if (config.data <= 0) {
            return;
        }

        /**
         * Сначала мы фильтруем массив data, чтобы взять только те элементы из data, которые находятся в диапазоне:
         * ОТ (ТекущаяСтраница - 1) * КоличествоСтрокНаСтранице ДО ТекущаяСтраница * КоличествоСтрокНаСтранице.
         * Для этого используем index, который говорит нам индекс элемента массива, currentPage - номер текущей страницы и
         * rowsNumber - количество строк на странице.
         * Затем, проходим по каждому элементу массива data. А в нём у нас хранятся объекты. Поэтому мы берём все значения
         * свойств объекта с помощью метода Object.values(). Он нам возвращает массив значений и мы проходим по этому массиву и
         * добавляем в разметку Значения.
         */
        config.data
            .filter(
                (_, index) =>
                    index >= (config.currentPage - 1) * config.rowsNumber && index < config.currentPage * config.rowsNumber
            )
            .forEach((element) => {
                // Создаём элемент tr - Строка
                let tr = document.createElement("tr");

                // Проходим по всем значениям объекта
                Object.values(element).forEach(e => {
                    // Создаём элемент td - Ячейка
                    let td = document.createElement("td");
                    // Устанавливаем текст Ячейки в значение из объекта
                    td.innerText = String(e);
                    // Добавляем Ячейку к Строке
                    tr.appendChild(td);
                });

                // Добавляем Строку к Таблице
                config.tableElement.appendChild(tr);
            });
    }

    /**
     * Создаёт переключатель страниц Таблицы
     * @param config ссылка на конфигурацию Таблицы
     */
    #createPager(config) {
        /**
         * Добавим элемент Выпадающий список для выбора количества строк для отображения на странице
         */
        this.#createItemsPerPageSelector(config);

        /**
         * Создадим элементы управления для переключения страниц: кнопки Назад, Следующая и кнопки для перехода
         * к конкретной странице
         */
        this.#createControlButtons(config);
    }

    /**
     * Создаёт элемент Выпадающий список для выбора количества строк для отображения на странице
     * @param config ссылка на конфигурацию Таблицы
     */
    #createItemsPerPageSelector(config) {
        // Создаём элемент Select для отображения опций
        const selectorElement = document.createElement("select");
        selectorElement.id = this.#ITEMS_PER_PAGE_ELEMENT;
        selectorElement.onchange = this.#itemsPerPageChangedHandler;

        // Проходим по массиву опций и добавляем их к элементу select
        Table.options.forEach(opt => {
            // Создаём элемент опция
            let optionElement = document.createElement("option");

            // Назначаем значение
            optionElement.value = opt;
            // Назначаем текст для отображения пользователю
            optionElement.innerText = opt;

            // Добавляем элемент option к элементу select
            selectorElement.appendChild(optionElement);
        });

        // Делаем активной опцию из конфигурации
        selectorElement.value = config.rowsNumber;

        // Добавляем элемент select к контейнеру div, который содержит элементы управления переключением страниц
        config.pagesElement.appendChild(selectorElement);
    }

    /**
     * Создаёт кнопки управления для переключения страниц
     * @param config ссылка на конфигурацию Таблицы
     */
    #createControlButtons(config) {
        // Создаём Контейнер, который будет содержать кнопки управления переключением страниц
        const containerElement = document.createElement("div");
        containerElement.id = this.#BUTTONS_CONTAINER_ID;

        // Добавим кнопку "Назад"
        const prevButton = document.createElement("button");
        prevButton.id = this.#PREV_BUTTON_ID;
        prevButton.innerText = "<<";
        prevButton.onclick = this.#prevButtonHandler;
        // Добавляем кнопку в Контейнер
        containerElement.appendChild(prevButton);

        // Добавляем кнопки перехода на конкретную страницу
        [...Array(this.#getNumberOfPages(config))].forEach((page, index) => {
            // Создаём кнопку
            let buttonElement = document.createElement("button");
            let buttonNumber = String(index + 1); // index + 1, чтобы номер страницы начинался с единицы.
            // Назначаем кнопке id равный "Префикс + индекс кнопки"
            buttonElement.id = this.#PAGE_NUMBER_PREFIX_ID + index;
            buttonElement.onclick = this.#buttonHandler;
            buttonElement.innerText = buttonNumber;
            buttonElement.value = String(index + 1);
            // Если кнопка соответствует выбранной странице, то выделяем её
            if (index === config.currentPage - 1) {
                this.#setButtonActive(buttonElement);
            }

            // Добавляем кнопку в Контейнер
            containerElement.appendChild(buttonElement);
        });

        // Добавим кнопку "Следующая"
        const nextButton = document.createElement("button");
        nextButton.id = this.#NEXT_BUTTON_ID;
        nextButton.onclick = this.#nextButtonHandler;
        nextButton.innerText = ">>";
        // Добавляем кнопку в Контейнер
        containerElement.appendChild(nextButton);

        // Добавляем Контейнер к элементу переключения страниц
        config.pagesElement.appendChild(containerElement);
    }

    /**
     * Возвращает вычисленное значение количества страниц в зависимости от объёма данных
     * @param config ссылка на конфигурацию Таблицы
     */
    #getNumberOfPages(config) {
        // Если мало данных и они умещаются на одной странице, то сразу вернём 1
        if (config.data.length <= config.rowsNumber) {
            return 1;
        }

        return Math.ceil(config.data.length / config.rowsNumber);
    }

    /**
     * Обработчик события на изменение количества элементов на станице
     * @param e
     */
    #itemsPerPageChangedHandler = (e) => {
        this.#config.rowsNumber = e.target.value;
        this.#config.currentPage = 1;

        this.#createTable(this.#config);
    }

    /**
     * Обработчик нажатия кнопки Назад
     * @param e
     */
    #prevButtonHandler = (e) => {
        // Выбираем Кнопку, которая в данный момент указывает на активную страницу
        const activeButton = document.querySelector("button[id ^= 'page-'][class='active']");
        // Берём номер страницы
        const currentPage = activeButton.value;

        // Если это первая страница, то назад уже перейти не можем
        if (currentPage == 1) {
            return;
        }

        // Устанавливаем активную страницу в конфигурации
        this.#config.currentPage = currentPage - 1;

        // Пересоздаём Таблицу
        this.#createTable(this.#config);
    }

    /**
     * Обработчик нажатия кнопки Следующая
     * @param e
     */
    #nextButtonHandler = (e) => {
        // Выбираем все кнопки с номерами страниц
        const buttons = document.querySelectorAll("button[id ^= 'page-']");
        // Выбираем Кнопку, которая в данный момент указывает на активную страницу
        const activeButton = document.querySelector("button[id ^= 'page-'][class='active']");
        // Берём номер страницы
        const currentPage = Number(activeButton.value);

        // Если это последняя страница, то вперёд уже перейти не можем
        if (currentPage == buttons.length) {
            return;
        }

        // Устанавливаем активную страницу в конфигурации
        this.#config.currentPage = currentPage + 1;

        // Пересоздаём Таблицу
        this.#createTable(this.#config);
    }

    /**
     * Обработчик нажатия кнопки с номером страницы
     * @param e
     */
    #buttonHandler = (e) => {
        // Устанавливаем активную страницу в конфигурации
        this.#config.currentPage = Number(e.target.value);
        // Пересоздаём Таблицу
        this.#createTable(this.#config);
    }

    /**
     * Выделяет стилем кнопку с выбранной страницей
     * @param buttonElement элемент
     */
    #setButtonActive(buttonElement) {
        buttonElement.classList.add("active");
    }

    /**
     * Удаляет все дочерние элементы для узла
     * @param parent элемент, у которого необходимо удалить все дочерние элементы
     */
    #clearChildrenElements(parent) {
        parent.textContent = "";
    }
}