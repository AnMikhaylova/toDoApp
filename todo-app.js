(function () {
    // создаем и возвращаем заголовок приложения
    function createAppTitle(title) {
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    // создаем и возвращаем форму для создания дела
    function createTodoItemForm() {
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');

        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название нового дела';
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Добавить задачу';
        button.disabled = true;

        buttonWrapper.append(button);
        form.append(input);
        form.append(buttonWrapper);

        return {
            form,
            input,
            button,
        };

    }

    // создаем и возвращаем список элементов
    function createTodoList() {
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;

    }

    // создаем и возвращаем элемент списка (элемент + кнопки)
    function createTodoItem(task) {
        let item = document.createElement('li');
        // кнопки помещаем в элемент, который красиво покажет их в одной группе
        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');

        // устанавливаем стили для элемента списка, а также для размещения кнопок
        // в его правой части с поомщью flex
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        item.textContent = task.name;

        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = 'Готово';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Удалить';

        // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);

        // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать собятия
        return {
            item,
            doneButton,
            deleteButton,
        };
    }

    // вспомогательная функция. возвращает текст элемента списка
    function innerText(item) {

        var text = Array.from(item.childNodes)
            .filter(function (node) {
                return node.nodeType === Node.TEXT_NODE;
            })
            .map(function (node) {
                return node.textContent.trim();
            })
            .join(" ");
        return text;
    }

    // вспомогательная функция. возвращает максимальный индекс для нового элемента массива
    function setMaxId(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return 0; // обработка пустого массива или неправильного входного значения
        }

        var maxId = arr.reduce(function (prev, current) {
            return (current.id > prev) ? current.id : prev;
        }, arr[0].id);

        return maxId + 1;
    }

    // ------------------------ работа с localstorage --------------------
    function readTasks(key) {
        let storage = localStorage.getItem(key);
        return (storage ? JSON.parse(storage) : []);

    }

    function writeTasks(key, data) {
        let json = JSON.stringify(data);
        localStorage.setItem(key, json);

    }

    //  слушатель для кнопки элемента списка
    function deleteButtonListner(selItem, arr, key) {
        if (confirm('Вы уверены?')) {
            selItem.item.remove();

            let index = arr.findIndex(function (element) {
                var text = innerText(selItem.item);
                return element.name === text;
            });

            if (index !== -1) {
                arr.splice(index, 1);

            }

            writeTasks(key, arr);
        }
    }

    //  слушатель для кнопки элемента списка
    function doneButtonListner(selItem, arr, key) {
        selItem.item.classList.toggle('list-group-item-success');

        let index = arr.findIndex(function (element) {
            var text = innerText(selItem.item);
            return element.name === text;
        });
        if (index !== -1) {
            //toggle перекрашивает обратно в белый при повторном нажатии, поэтому используем тернарный оператор, который устанавливает false                    
            arr[index].done = arr[index].done ? false : true;
        }

        writeTasks(key, arr);
    }


    // восстановление данных из localstorage в виде DOM-элементов списка 
    function readAppendStorage(key, arr, windowList) {
        let storageData = readTasks(key);
        if (storageData.length !== 0) {
            arr = storageData.slice();
            for (ind in storageData) {
                let newItem = createTodoItem(storageData[ind]);
                if(storageData[ind].done) {
                    newItem.item.classList.toggle('list-group-item-success');
                }
                newItem.doneButton.addEventListener('click', function () {
                    doneButtonListner(newItem, arr, key);
                });
                newItem.deleteButton.addEventListener('click', function () {
                    deleteButtonListner(newItem, arr, key)
                });

                
                windowList.append(newItem.item);
            }
        }
    }

    // ---------------- ГЛАВНАЯ ФУНКЦИЯ -------------------

    function createTodoApp(container, title = 'Список дел', listName) {
        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();
        let tasks = [];

        container.append(todoAppTitle);
        container.append(todoItemForm.form);
        container.append(todoList);

        // добавляем обработик, который активирует кнопку при вводе
        todoItemForm.input.addEventListener("input", function () {
            todoItemForm.button.disabled = false;
        });

        //чтение и восстановление хранилища
        readAppendStorage(listName, tasks, todoList);


        // браузер создает событие submit на форме по нажатию на enter или на кнопку создания дела
        todoItemForm.form.addEventListener('submit', function (e) {
            // эта строчка необходима чтобы предотвратить стандартное действие браузер
            // в данном случае мы не хотим, чтобы страница перезагружалась при отпарвке формы
            e.preventDefault();

            // создаем и добавляем в список нвоое дело с названием из поля для ввода 
            if (todoItemForm.input.value.trim() === "") {
                return;
            }
            let task = { id: setMaxId(tasks), name: todoItemForm.input.value.trim(), done: false };
            let todoItem = createTodoItem(task);

            // добавляем обработчики на кнопки
            todoItem.doneButton.addEventListener('click', function () {
                doneButtonListner(todoItem, tasks, listName);
            });

            todoItem.deleteButton.addEventListener('click', function () {
                deleteButtonListner(todoItem, tasks, listName);
            });

            // создаем и добавлям в список новое дело с названием из поля для ввода
            todoList.append(todoItem.item);
            // добавляем в локальный массив
            tasks.push(task);
            // добавляем в хранилище
            writeTasks(listName, tasks);



            // обнуляем значение в поле, чтобы не пришлось стирать его вручную
            todoItemForm.input.value = '';

            // устанавливаем заново disabled 
            todoItemForm.button.disabled = true;
        });
    }

    window.createTodoApp = createTodoApp;
})();


