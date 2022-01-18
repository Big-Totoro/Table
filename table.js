// Идентификатор элемента для выбора количество отображаемых строк на странице
const ITEMS_PER_PAGE_ELEMENT = "itemsPerPage";
// Идентификатор кнопки Назад
const PREV_BUTTON_ID = "prevButton";
// Идентификатор кнопки Следующая
const NEXT_BUTTON_ID = "nextButton";
// Идентификатор префикса кнопки "Перейти на страницу номер ", например, "page-0"
const PAGE_NUMBER_PREFIX_ID = "page-";
// Идентификатор контейнера кнопок
const BUTTONS_CONTAINER_ID = "container";

/**
 * Создаёт Таблицу в HTML разметке
 * @param tableElement ссылка на элемент Table в DOM
 * @param pagesElement ссылка на элемент, в котором разместится переключатель страниц
 * @param rowsNumber количество строк в таблицы для отображения пользователю
 * @param pagesNumber количество страниц, предлагаемы пользователю для переключения между страницами
 * @param header список Заголовков колонок Таблицы
 * @param data данные для отображения
 * @constructor
 */
class Table {
    #tableElement;
    #pagesElement;
    #rowsNumber;
    #pagesNumber;
    #header;
    #data;

    constructor(tableElement, pagesElement, rowsNumber, pagesNumber, header, data) {
        /**
         * Проверяем входные данные на корректность
         */
        if (!tableElement) {
            throw Error("Table element should be provided");
        }
        if (!pagesElement) {
            throw Error("Pages element should be provided");
        }
        if (rowsNumber < 3) {
            throw Error("A number of rows should be more then tree elements");
        }
        if (pagesNumber < 1) {
            throw Error("A number of pages should be more then one element");
        }

        this.#tableElement = tableElement;
        this.#pagesElement = pagesElement;
        this.#rowsNumber = rowsNumber;
        this.#pagesNumber = pagesNumber;
        this.#header = header;
        this.#data = data;

        /**
         * Создаём первоначальную структуру Таблицы в HTML
         */
        this.#createTable(tableElement, rowsNumber, pagesNumber, header, data);

        /**
         * Создаём переключатель страниц таблицы
         */
        this.#createPager(pagesElement, rowsNumber, pagesNumber, 1, data);
    }

    /**
     * Создаёт таблицу в HTML разметке
     * @param tableElement ссылка на элемент Table в DOM
     * @param rowsNumber количество строк в таблицы для отображения пользователю
     * @param pagesNumber количество страниц, предлагаемы пользователю для переключения между страницами
     * @param header список Заголовков колонок Таблицы
     * @param data данные для отображения
     */
    #createTable(tableElement, rowsNumber, pagesNumber, header, data) {
        this.#createHeader(tableElement, header, data);
        this.#createBody(tableElement, rowsNumber, data);
    }

    /**
     * Создаёт Заголовок Таблицы
     * @param tableElement ссылка на элемент Table в DOM
     * @param header список Заголовков колонок Таблицы
     * @param data данные для отображения
     */
    #createHeader(tableElement, header = [], data = []) {
        let headerCaption;

        /**
         * Если нам передали массив с названиями Заголовков колонок, то используем его.
         * Иначе попытаемся взять названия Заголовков как Имена свойств из данных.
         * Если нам не передели ни Заголовков, не Данных, то просто выходим.
         */
        if (header.length !== 0) {
            headerCaption = header;
        } else if (data.length > 0) {
            headerCaption = Object.keys(data[0]);
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
         * Добавили к Таблицу Заголовок
         */
        tableElement.appendChild(thead);
    }

    /**
     * Создаёт тело Таблицы
     * @param tableElement ссылка на элемент Table в DOM
     * @param rowsNumber количество строк в таблицы для отображения пользователю
     * @param data данные для отображения
     */
    #createBody(tableElement, rowsNumber, data = []) {
        if (data <= 0) {
            return;
        }

        /**
         * Сначала мы фильтруем массив data, чтобы взять не более rowsNumber элементов из data. Для этого используем index,
         * который говорит нам индекс элемента массива.
         * Затем проходим по каждому элементу массива data. А в нём у нас хранятся объекты. Поэтому мы берём все значения
         * свойств объекта с помощью Object.values(). Он нам возвращает массив значений и мы проходим по этому массиву и
         * добавляем в разметку Значения.
         */
        data
            .filter((_, index) => index < rowsNumber)
            .forEach((element) => {
                // Создаём элемент tr - Строка
                let tr = document.createElement("tr");

                Object.values(element).forEach(e => {
                    // Создаём элемент td - Ячейка
                    let td = document.createElement("td");
                    // Устанавливаем текст Ячейки в значение из объекта
                    td.innerText = String(e);
                    // Добавляем Ячейку к Строке
                    tr.appendChild(td);
                });

                // Добавляем Строку к Таблице
                tableElement.appendChild(tr);
            });
    }

    /**
     * Создаёт переключатель страниц таблицы
     * @param pagesElement ссылка на элемент, котором будет создан переключатель страниц
     * @param rowsNumber количество строк в таблицы для отображения пользователю
     * @param pagesNumber количество страниц, предлагаемы пользователю для переключения между страницами
     * @param currentPage номер текущей отображаемой страницы
     * @param data данные для отображения
     */
    #createPager(pagesElement, rowsNumber, pagesNumber, currentPage, data = []) {
        /**
         * Добавим элемент Выпадающий список для выбора количества элементов отображения на странице
         */
        this.#createItemsPerPageSelector(pagesElement, rowsNumber);

        /**
         * Создадим элементы управления для переключения страниц: кнопки Назад, Следующая и кнопки для перехода
         * к конкретной странице
         */
        this.#createControlButtons(pagesElement, rowsNumber, pagesNumber, currentPage, data);
    }

    /**
     * Создаёт элемент Выпадающий список для выбора количества элементов отображения на странице
     * @param pagesElement родительский контейнер в котором будет размещён элемент Выпадающий список
     * @param selectedOption выбранная опция количества строк на странице
     */
    #createItemsPerPageSelector(pagesElement, selectedOption = "10") {
        // Создаём элемент Select для отображения опций
        const selectorElement = document.createElement("select");
        selectorElement.id = ITEMS_PER_PAGE_ELEMENT;
        selectorElement.onchange = this.#itemsPerPageChangedHandler;

        // Массив, который содержит допустимые опции
        const options = ["10", "20", "50", "100"];
        // Проходим по массиву опций и добавляем их к элементу select
        options.forEach(opt => {
            // Создаём элемент опция
            let optionElement = document.createElement("option");

            // Назначаем значение
            optionElement.value = opt;
            // Назначаем текст для отображения пользователю
            optionElement.innerText = opt;

            // Добавляем элемент option к элементу select
            selectorElement.appendChild(optionElement);
        });

        selectorElement.value = selectedOption;

        // Добавляем элемент select к контейнеру div, который содержит элементы управления переключением страниц
        pagesElement.appendChild(selectorElement);
    }

    /**
     * Создаёт кнопки управления для переключения страниц
     * @param pagesElement родительский контейнер в котором будет размещён элемент Выпадающий список
     * @param rowsNumber количество строк в таблицы для отображения пользователю
     * @param pagesNumber количество страниц, предлагаемы пользователю для переключения между страницами
     * @param currentPage номер текущей отображаемой страницы
     * @param data данные для отображения
     */
    #createControlButtons(pagesElement, rowsNumber, pagesNumber, currentPage, data = []) {
        const containerElement = document.createElement("div");
        containerElement.id = BUTTONS_CONTAINER_ID;

        // Добавим кнопку "Назад"
        const prevButton = document.createElement("button");
        prevButton.id = PREV_BUTTON_ID;
        prevButton.innerText = "<<";
        prevButton.onclick = this.#prevButtonHandler;
        // Добавляем кнопку в контейнер
        containerElement.appendChild(prevButton);

        // Добавляем кнопки перехода на конкретную страницу
        [...Array(this.#getNumberOfPages(rowsNumber, pagesNumber, data))].forEach((page, index) => {
            // Создаём кнопку
            let buttonElement = document.createElement("button");
            let buttonNumber = String(index + 1);
            // Назначаем кнопке id равный "Префикс + индекс кнопки"
            buttonElement.id = PAGE_NUMBER_PREFIX_ID + index;
            buttonElement.onclick = this.#buttonHandler;
            buttonElement.innerText = buttonNumber;
            buttonElement.value = index;
            // Если кнопка соответствует выбранной странице, то выделить её
            if (index === currentPage - 1) {
                this.#setButtonActive(buttonElement);
            }

            // Добавляем кнопку в контейнер
            containerElement.appendChild(buttonElement);
        });

        // Добавим кнопку "Следующая"
        const nextButton = document.createElement("button");
        nextButton.id = NEXT_BUTTON_ID;
        nextButton.onclick = this.#nextButtonHandler;
        nextButton.innerText = ">>";
        // Добавляем кнопку в контейнер
        containerElement.appendChild(nextButton);

        pagesElement.appendChild(containerElement);
    }

    /**
     * Возвращает вычисленное значение количества страниц в зависимости от объёма данных
     * @param rowsNumber количество строк в таблицы для отображения пользователю
     * @param pagesNumber количество страниц, предлагаемы пользователю для переключения между страницами
     * @param data данные для отображения
     * @returns {number} количество страниц
     */
    #getNumberOfPages(rowsNumber, pagesNumber, data = []) {
        if (data.length <= 1 || data.length <= rowsNumber) {
            return 1;
        }

        return Math.ceil(data.length / rowsNumber);
    }

    /**
     * Обработчик события на изменение количества элементов на станице
     * @param e
     */
    #itemsPerPageChangedHandler = (e) => {
        this.#clearChildrenElements(this.#getPager());
        this.#clearChildrenElements(this.#getTable());

        /**
         * Создаём первоначальную структуру Таблицы в HTML
         */
        const itemsPerPage = e.target.value;
        this.#createTable(this.#getTable(), itemsPerPage, this.#pagesNumber, this.#header, this.#data);
        this.#createPager(this.#getPager(), itemsPerPage, this.#pagesNumber, 1, this.#data);
    }

    /**
     * Обработчик нажатия кнопки Назад
     * @param e
     */
    #prevButtonHandler = (e) => {
        // Выбираем Кнопку, которая в данный момент указывает на активную страницу
        const activeButton = document.querySelector("button[id ^= 'page-'][class='active']");
        // Берём номер страницы
        const activeButtonNumber = activeButton.value;

        // Если это первая страница, то назад уже перейти не можем
        if (activeButtonNumber == 0) {
            return;
        }

        // Очищаем активные стили со всех кнопок
        this.#clearButtons();

        // Выбираем кнопку слева от ранее активной
        const prevButton = document.querySelector(`button[id = 'page-${activeButtonNumber - 1}']`);

        // Делаем активной кнопку слева
        this.#setButtonActive(prevButton);
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
        const activeButtonNumber = Number(activeButton.value);
        // Если это последняя страница, то вперёд уже перейти не можем
        if (activeButtonNumber == buttons.length - 1) {
            return;
        }

        // Очищаем активные стили со всех кнопок
        this.#clearButtons();

        // Выбираем кнопку справа от ранее активной
        const nextButton = document.querySelector(`button[id = 'page-${activeButtonNumber + 1}']`);

        // Делаем активной кнопку слева
        this.#setButtonActive(nextButton);
    }

    /**
     * Обработчик нажатия кнопки с номером страницы
     * @param e
     */
    #buttonHandler = (e) => {
        this.#clearButtons();
        this.#setButtonActive(e.target);
    }

    /**
     * Убирает со всех копок выделенный/активный стиль
     */
    #clearButtons() {
        const buttons = document.querySelectorAll("button[id ^= 'page-']");
        buttons.forEach(button => button.classList.remove("active"));
    }

    /**
     * Выделяет стилем кнопку с выбранной страницей
     * @param buttonElement элемент
     */
    #setButtonActive(buttonElement) {
        buttonElement.classList.add("active");
    }

    #clearChildrenElements(parent) {
        parent.textContent = "";
    }

    #getTable() {
        return this.#tableElement;
    }

    #getPager() {
        return this.#pagesElement;
    }
}

/**
 * Заполним Таблицу, когда завершится загрузка страницы
 */
const tables = [];

document.addEventListener("DOMContentLoaded", () => {
    const rowsNumber = 10; // Количество строк в таблице
    const pagesNumber = 5; // Количество страниц для выбора
    const tableElement = document.getElementById("mytable");
    const pagesElement = document.getElementById("pages");
    tables.push(new Table(tableElement, pagesElement, rowsNumber, pagesNumber, getHeader(), getData()));
});

/**
 * Функция возвращает названия колонок
 */
function getHeader() {
    return [
        "Индекс",
        "Возраст",
        "Имя",
        "Пол",
        "Компания",
        "E-mail",
        "Телефон",
        "Адрес"
    ];
}

/**
 * Функция поставляет данные для таблицы
 */
function getData() {
    return [
        {
            "index": 0,
            "age": 26,
            "name": "Lacey Vang",
            "gender": "female",
            "company": "GEOFARM",
            "email": "laceyvang@geofarm.com",
            "phone": "+1 (980) 460-2250",
            "address": "197 Highland Avenue, Craig, North Carolina, 5133"
        },
        {
            "index": 1,
            "age": 25,
            "name": "Janette Richardson",
            "gender": "female",
            "company": "DIGIGENE",
            "email": "janetterichardson@digigene.com",
            "phone": "+1 (854) 473-3935",
            "address": "279 Whitwell Place, Drytown, Kentucky, 3045"
        },
        {
            "index": 2,
            "age": 32,
            "name": "Workman Rodriquez",
            "gender": "male",
            "company": "HIVEDOM",
            "email": "workmanrodriquez@hivedom.com",
            "phone": "+1 (800) 468-2214",
            "address": "261 Aurelia Court, Winston, New Hampshire, 7764"
        },
        {
            "index": 3,
            "age": 35,
            "name": "Adkins Cain",
            "gender": "male",
            "company": "HONOTRON",
            "email": "adkinscain@honotron.com",
            "phone": "+1 (818) 563-2383",
            "address": "421 Garden Place, Darlington, Palau, 1527"
        },
        {
            "index": 4,
            "age": 28,
            "name": "Peterson Hardy",
            "gender": "male",
            "company": "ECRATIC",
            "email": "petersonhardy@ecratic.com",
            "phone": "+1 (864) 419-3605",
            "address": "713 Turnbull Avenue, Romeville, Federated States Of Micronesia, 6534"
        },
        {
            "index": 5,
            "age": 25,
            "name": "Cochran Stanley",
            "gender": "male",
            "company": "ENTOGROK",
            "email": "cochranstanley@entogrok.com",
            "phone": "+1 (836) 413-2299",
            "address": "254 Durland Place, Frank, Virgin Islands, 8994"
        },
        {
            "index": 6,
            "age": 20,
            "name": "Imelda Glenn",
            "gender": "female",
            "company": "BIOTICA",
            "email": "imeldaglenn@biotica.com",
            "phone": "+1 (835) 515-3640",
            "address": "491 Ditmars Street, Bellamy, Colorado, 2616"
        },
        {
            "index": 7,
            "age": 28,
            "name": "Desiree Martinez",
            "gender": "female",
            "company": "CONCILITY",
            "email": "desireemartinez@concility.com",
            "phone": "+1 (899) 400-2885",
            "address": "175 Clymer Street, Sims, Georgia, 2063"
        },
        {
            "index": 8,
            "age": 20,
            "name": "Madeleine Mckee",
            "gender": "female",
            "company": "KINETICA",
            "email": "madeleinemckee@kinetica.com",
            "phone": "+1 (942) 553-2155",
            "address": "198 Macdougal Street, Gouglersville, Northern Mariana Islands, 6718"
        },
        {
            "index": 9,
            "age": 27,
            "name": "Acevedo Townsend",
            "gender": "male",
            "company": "ARCHITAX",
            "email": "acevedotownsend@architax.com",
            "phone": "+1 (888) 589-3683",
            "address": "991 Waldorf Court, Tolu, New Jersey, 9605"
        },
        {
            "index": 10,
            "age": 21,
            "name": "Armstrong Riddle",
            "gender": "male",
            "company": "KOFFEE",
            "email": "armstrongriddle@koffee.com",
            "phone": "+1 (861) 471-3065",
            "address": "849 Jerome Street, Wolcott, Vermont, 4750"
        },
        {
            "index": 11,
            "age": 32,
            "name": "Marcy Raymond",
            "gender": "female",
            "company": "EDECINE",
            "email": "marcyraymond@edecine.com",
            "phone": "+1 (967) 536-2397",
            "address": "539 Ovington Court, Clarktown, Virginia, 1306"
        },
        {
            "index": 12,
            "age": 26,
            "name": "Candice Kirk",
            "gender": "female",
            "company": "HARMONEY",
            "email": "candicekirk@harmoney.com",
            "phone": "+1 (911) 582-2129",
            "address": "616 Glenmore Avenue, Hickory, Pennsylvania, 7220"
        },
        {
            "index": 13,
            "age": 26,
            "name": "Sexton Chambers",
            "gender": "male",
            "company": "RUGSTARS",
            "email": "sextonchambers@rugstars.com",
            "phone": "+1 (993) 582-2321",
            "address": "295 Concord Street, Wakulla, Idaho, 7278"
        },
        {
            "index": 14,
            "age": 20,
            "name": "Amy Baldwin",
            "gender": "female",
            "company": "ANIMALIA",
            "email": "amybaldwin@animalia.com",
            "phone": "+1 (801) 561-2334",
            "address": "311 Stillwell Avenue, Dubois, Nebraska, 2671"
        },
        {
            "index": 15,
            "age": 31,
            "name": "Sheila Mcleod",
            "gender": "female",
            "company": "APEXIA",
            "email": "sheilamcleod@apexia.com",
            "phone": "+1 (936) 493-3906",
            "address": "710 Oliver Street, Tetherow, Montana, 2424"
        },
        {
            "index": 16,
            "age": 34,
            "name": "Harris Goodman",
            "gender": "male",
            "company": "AMRIL",
            "email": "harrisgoodman@amril.com",
            "phone": "+1 (998) 429-2806",
            "address": "469 Veronica Place, Carlton, Marshall Islands, 5020"
        },
        {
            "index": 17,
            "age": 27,
            "name": "Hogan Pope",
            "gender": "male",
            "company": "COLUMELLA",
            "email": "hoganpope@columella.com",
            "phone": "+1 (918) 532-3731",
            "address": "471 Jamaica Avenue, Martinez, Delaware, 8071"
        },
        {
            "index": 18,
            "age": 23,
            "name": "Downs Johns",
            "gender": "male",
            "company": "EXOZENT",
            "email": "downsjohns@exozent.com",
            "phone": "+1 (808) 509-3538",
            "address": "379 Perry Terrace, Canby, Tennessee, 9838"
        },
        {
            "index": 19,
            "age": 38,
            "name": "Sandoval Larsen",
            "gender": "male",
            "company": "SPACEWAX",
            "email": "sandovallarsen@spacewax.com",
            "phone": "+1 (972) 437-2973",
            "address": "244 Hart Place, Roulette, Texas, 6249"
        },
        {
            "index": 20,
            "age": 34,
            "name": "Mabel Santiago",
            "gender": "female",
            "company": "QUINEX",
            "email": "mabelsantiago@quinex.com",
            "phone": "+1 (904) 553-3936",
            "address": "206 Melrose Street, Welda, South Carolina, 1348"
        },
        {
            "index": 21,
            "age": 22,
            "name": "Emma Cantu",
            "gender": "female",
            "company": "CORIANDER",
            "email": "emmacantu@coriander.com",
            "phone": "+1 (861) 449-3528",
            "address": "866 Berry Street, Utting, Alaska, 3982"
        },
        {
            "index": 22,
            "age": 22,
            "name": "Diane Head",
            "gender": "female",
            "company": "FORTEAN",
            "email": "dianehead@fortean.com",
            "phone": "+1 (962) 470-3980",
            "address": "432 Ridgewood Avenue, Rowe, Kansas, 4262"
        },
        {
            "index": 23,
            "age": 39,
            "name": "Walsh Gonzales",
            "gender": "male",
            "company": "ZILLACON",
            "email": "walshgonzales@zillacon.com",
            "phone": "+1 (994) 443-3810",
            "address": "394 Stuart Street, Rew, New York, 3396"
        },
        {
            "index": 24,
            "age": 35,
            "name": "Barr Bright",
            "gender": "male",
            "company": "PORTALIS",
            "email": "barrbright@portalis.com",
            "phone": "+1 (990) 504-3262",
            "address": "222 Lincoln Place, Mammoth, Oklahoma, 301"
        },
        {
            "index": 25,
            "age": 20,
            "name": "Staci Avila",
            "gender": "female",
            "company": "SONGBIRD",
            "email": "staciavila@songbird.com",
            "phone": "+1 (889) 557-3463",
            "address": "728 Chauncey Street, Davenport, California, 6962"
        },
        {
            "index": 26,
            "age": 36,
            "name": "Cherry Pugh",
            "gender": "female",
            "company": "GRUPOLI",
            "email": "cherrypugh@grupoli.com",
            "phone": "+1 (922) 579-2249",
            "address": "622 Lott Avenue, Templeton, Mississippi, 3817"
        },
        {
            "index": 27,
            "age": 25,
            "name": "Hunt Herman",
            "gender": "male",
            "company": "CEMENTION",
            "email": "huntherman@cemention.com",
            "phone": "+1 (850) 515-3225",
            "address": "999 Cleveland Street, Germanton, Wyoming, 5336"
        },
        {
            "index": 28,
            "age": 31,
            "name": "Gomez Jackson",
            "gender": "male",
            "company": "EMTRAK",
            "email": "gomezjackson@emtrak.com",
            "phone": "+1 (861) 590-3605",
            "address": "242 Schenck Avenue, Warsaw, Oregon, 2939"
        },
        {
            "index": 29,
            "age": 29,
            "name": "Lora Benton",
            "gender": "female",
            "company": "RAMJOB",
            "email": "lorabenton@ramjob.com",
            "phone": "+1 (972) 494-3270",
            "address": "905 McDonald Avenue, Canterwood, Puerto Rico, 3974"
        },
        {
            "index": 30,
            "age": 34,
            "name": "Jennie Mathews",
            "gender": "female",
            "company": "RONELON",
            "email": "jenniemathews@ronelon.com",
            "phone": "+1 (895) 411-2162",
            "address": "146 Bethel Loop, Cumminsville, Illinois, 773"
        },
        {
            "index": 31,
            "age": 33,
            "name": "Candy Stephenson",
            "gender": "female",
            "company": "OPTICOM",
            "email": "candystephenson@opticom.com",
            "phone": "+1 (987) 546-3121",
            "address": "534 Pitkin Avenue, Chicopee, Indiana, 1274"
        },
        {
            "index": 32,
            "age": 22,
            "name": "Lesley Zamora",
            "gender": "female",
            "company": "VIRXO",
            "email": "lesleyzamora@virxo.com",
            "phone": "+1 (945) 520-2098",
            "address": "211 Regent Place, Bartley, Wisconsin, 7765"
        },
        {
            "index": 33,
            "age": 21,
            "name": "Eleanor Bird",
            "gender": "female",
            "company": "AMTAS",
            "email": "eleanorbird@amtas.com",
            "phone": "+1 (926) 544-3207",
            "address": "371 Hart Street, Snowville, North Dakota, 1063"
        },
        {
            "index": 34,
            "age": 37,
            "name": "Vasquez Wade",
            "gender": "male",
            "company": "ULTRASURE",
            "email": "vasquezwade@ultrasure.com",
            "phone": "+1 (804) 432-3131",
            "address": "212 Stone Avenue, Robinette, Maine, 8071"
        },
        {
            "index": 35,
            "age": 29,
            "name": "Mable Mccullough",
            "gender": "female",
            "company": "ACRODANCE",
            "email": "mablemccullough@acrodance.com",
            "phone": "+1 (988) 418-3722",
            "address": "409 Harwood Place, Cresaptown, Nevada, 1576"
        },
        {
            "index": 36,
            "age": 30,
            "name": "Susanne Buckner",
            "gender": "female",
            "company": "TETRATREX",
            "email": "susannebuckner@tetratrex.com",
            "phone": "+1 (984) 435-3073",
            "address": "603 Lee Avenue, Columbus, Michigan, 9681"
        },
        {
            "index": 37,
            "age": 26,
            "name": "Sandy Mullen",
            "gender": "female",
            "company": "ZENTHALL",
            "email": "sandymullen@zenthall.com",
            "phone": "+1 (831) 571-2710",
            "address": "428 Windsor Place, Draper, Washington, 1665"
        },
        {
            "index": 38,
            "age": 25,
            "name": "Alma Hickman",
            "gender": "female",
            "company": "TROPOLI",
            "email": "almahickman@tropoli.com",
            "phone": "+1 (917) 447-2233",
            "address": "737 Kaufman Place, Enetai, Minnesota, 6632"
        },
        {
            "index": 39,
            "age": 37,
            "name": "Madelyn Terry",
            "gender": "female",
            "company": "ZORK",
            "email": "madelynterry@zork.com",
            "phone": "+1 (936) 476-2887",
            "address": "890 Homecrest Court, Sunnyside, Missouri, 8053"
        },
        {
            "index": 40,
            "age": 28,
            "name": "Knight Wilkins",
            "gender": "male",
            "company": "COGENTRY",
            "email": "knightwilkins@cogentry.com",
            "phone": "+1 (812) 445-3808",
            "address": "764 Seagate Avenue, Courtland, Hawaii, 3935"
        },
        {
            "index": 41,
            "age": 37,
            "name": "Minerva Robles",
            "gender": "female",
            "company": "LIMAGE",
            "email": "minervarobles@limage.com",
            "phone": "+1 (977) 575-3366",
            "address": "236 Oceanview Avenue, Bluffview, New Mexico, 1063"
        },
        {
            "index": 42,
            "age": 40,
            "name": "Karla Montgomery",
            "gender": "female",
            "company": "EXTRAWEAR",
            "email": "karlamontgomery@extrawear.com",
            "phone": "+1 (997) 548-2421",
            "address": "484 Hyman Court, Dahlen, Massachusetts, 9116"
        },
        {
            "index": 43,
            "age": 40,
            "name": "Randall Mcintyre",
            "gender": "male",
            "company": "GOLISTIC",
            "email": "randallmcintyre@golistic.com",
            "phone": "+1 (883) 493-3443",
            "address": "572 Vandam Street, Ola, Maryland, 9625"
        },
        {
            "index": 44,
            "age": 31,
            "name": "Yesenia Henson",
            "gender": "female",
            "company": "COMVOY",
            "email": "yeseniahenson@comvoy.com",
            "phone": "+1 (989) 401-2998",
            "address": "690 Sackett Street, Guilford, Alabama, 8719"
        }
    ];
}
