window.onload = function() {
    class Player {
        constructor(name) {
            this.name = name;
            this.health = 100;
            this.pos = [100, 365];
            this.defeatedMonsters = 0;
        }
    }

    class Monster {
        constructor() {
            this.name = generateMonsterName();
            this.health = 100;
            this.head = generateMonsterParts(0, 300, 225, 5);
            this.body = generateMonsterParts(225, 300, 300, 5);
            this.legs = generateMonsterParts(525, 300, 150, 5);
            this.weapon = generateMonsterParts(675, 150, 150, 6);
            this.pos = [canvas.width - 384, 523];
        }
    }

    function generateMonsterName() {
        let adjectives = [
            'Ужасный', 'Злобный', 'Сопливый', 'Страшный', 'Жуткий',
            'Вредный', 'Зловещий', 'Безумный', 'Свирепый', 'Злой'
        ];

        let nouns = [
            'Огр', 'Гном', 'Гоблин', 'Вурдалак', 'Змей',
            'Оборотень', 'Упырь', 'Боггарт', 'Демон', 'Дементор' 
        ];

        let names = [
            'Том', 'Макс', 'Вадик', 'Петя', 'Джек',
            'Вася', 'Дима', 'Джон', 'Танос', 'Локи'
        ];

        return `${_.sample(adjectives)} ${_.sample(nouns)} ${_.sample(names)}`;
    }

    function generateMonsterParts(posY, frameWidth, frameHeight, totalFrames) {
        let posX = 0;
        let parts = [];
        
        for (let i = 0; i < totalFrames; i++) {
            parts.push([posX, posY, frameWidth, frameHeight]);
            posX += frameWidth;
        }
        
        return _.sample(parts);
    }
    
    let player;
    let monster;
    let playerHealth;
    let monsterHealth;
    let startTime;
    const sprite = new Image();
    sprite.src = './assets/img/sprite.png';
    const music = document.querySelector('#bg-audio');
    music.volume = 0.05;

    const soundCorrect = new Audio('./assets/sound/correct.wav');
    soundCorrect.volume = 0.2;
    const soundIncorrect = new Audio('./assets/sound/incorrect.wav');
    soundIncorrect.volume = 0.2;
    const soundLaser = new Audio('./assets/sound/laser.wav');
    soundLaser.volume = 0.1;
    const soundElectricity = new Audio('./assets/sound/electricity.wav');
    soundElectricity.volume = 0.1;
    
    const helper = {};

    let canvas;
    let ctx;

    handleHomeScreenButtons();
    
    function handleHomeScreenButtons() {

        if (localStorage.getItem('lastPlayer')) {
            let lastPlayer = JSON.parse(localStorage.getItem('lastPlayer')).nickName;
            
            const innerContainer = document.querySelector('.inner-container');
            const buttonPlay = document.createElement('div');
            buttonPlay.className = 'button-play';
            const buttonPlayText = document.createElement('span');
            buttonPlayText.textContent = 'Играть';
            buttonPlay.appendChild(buttonPlayText);
            innerContainer.appendChild(buttonPlay);
            
            let span = document.createElement('span');
            span.innerHTML = `как <b>${lastPlayer}</b>`;
            innerContainer.appendChild(span);
            span = document.createElement('span');
            span.textContent = 'или';
            innerContainer.appendChild(span);

            const buttonNewPlayer = document.createElement('div');
            buttonNewPlayer.className = 'button-new-player';
            const buttonNewPlayerText = document.createElement('span');
            buttonNewPlayerText.textContent = 'Новый игрок';
            buttonNewPlayer.appendChild(buttonNewPlayerText);
            innerContainer.appendChild(buttonNewPlayer);
            
            buttonPlay.addEventListener('click', function handleButtonPlay() {
                hide(document.querySelector('.landing-page-container'));
                startGame(lastPlayer);
                buttonPlay.removeEventListener('click', handleButtonPlay);
                clearScreen(innerContainer);
            });

            buttonNewPlayer.addEventListener('click', function handleButtonNewPlayer() {
                createForm();
                buttonNewPlayer.removeEventListener('click', handleButtonNewPlayer);
                clearScreen(innerContainer);
            });

        } else {
            const innerContainer = document.querySelector('.inner-container');
            const buttonPlay = document.createElement('div');
            buttonPlay.className = 'button-play';
            const buttonPlayText = document.createElement('span');
            buttonPlayText.textContent = 'Играть';
            buttonPlay.appendChild(buttonPlayText);
            innerContainer.appendChild(buttonPlay);
            
            buttonPlay.addEventListener('click', function handleButtonPlay() {
                createForm();
                buttonPlay.removeEventListener('click', handleButtonPlay);
                clearScreen(innerContainer);
            });
        }

    }

    function show(node) {
        node.classList.remove('hidden');
    }

    function hide(node) {
        node.classList.add('hidden');
    }    
    
    function createForm() {
        const container = document.querySelector('.container-about');
        const formScreen = document.createElement('div');
        formScreen.className = 'form-screen';
        const form = document.createElement('form');
        const label = document.createElement('label');
        label.innerHTML = 'Придумайте имя вашему персонажу<br>';
        const input = document.createElement('input');
        input.type = 'text';
        input.required = true;
        label.appendChild(input);
        form.appendChild(label);
        const buttonStartGame = document.createElement('button');
        buttonStartGame.type = 'submit';
        buttonStartGame.textContent = 'Начать игру';
        form.appendChild(buttonStartGame);
        formScreen.appendChild(form);
        container.appendChild(formScreen);
        input.focus();

        form.addEventListener('submit', () => {
            event.preventDefault();
            startGame(form.elements[0].value);
            formScreen.remove();
            hide(document.querySelector('.landing-page-container'));

            localStorage.setItem('lastPlayer', JSON.stringify({
                nickName : form.elements[0].value
            }));
        });
    }

    function startGame(name) {
        music.play();
        const gameContainer = document.querySelector('.game-container');
        show(gameContainer);
        createCanvas();
        createPlayer(name);
        createMonster();
        renderCanvas();
        createButtonChooseSpell();
    }

    function createCanvas() {
        canvas = document.createElement('canvas');
        canvas.width = 1244;
        canvas.height = 700;
        document.querySelector('.game-container').appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    function createButtonChooseSpell() {
        const gameContainer = document.querySelector('.game-container');
        const buttonChooseSpell = document.createElement('div');
        buttonChooseSpell.className = 'button-choose-spell';
        const span = document.createElement('span');
        span.textContent = 'Выбрать заклинание';
        buttonChooseSpell.appendChild(span);
        gameContainer.appendChild(buttonChooseSpell);
        buttonChooseSpell.addEventListener('click', displayModalScreen);        
    }

    function displayModalScreen() {
        document.querySelector('.button-choose-spell').remove();
        const modalScreen = document.querySelector('.modal-screen');
        show(modalScreen);
        const container = document.createElement('div');
        container.className = 'container';
        let div = document.createElement('div');
        div.className = 'spell'
        div.id = 'laser-ray';
        container.appendChild(div);
        div = document.createElement('div');
        div.className = 'spell';
        div.id = 'electric-ray';
        container.appendChild(div);
        modalScreen.appendChild(container);
        container.addEventListener('click', (e) => {
            let spell = e.target.closest('.spell');
            if (!spell) return;
            helper.chosenSpell = spell.id;
            clearScreen(modalScreen);
            hide(modalScreen);
            getRandomTask();
        });
    }

    function createPlayer(name) {
        player = new Player(name);
        playerHealth = player.health;
    }

    function createMonster() {
        monster = new Monster();
        monsterHealth = monster.health;
    }

    if (!localStorage.getItem('table')) {
        const table = [];
        localStorage.setItem('table', JSON.stringify(table));
    }

    function updateTableRecords() {
        let table = JSON.parse(localStorage.getItem('table'));

        table.push({
            name: player.name,
            value: player.defeatedMonsters
        });

        table.sort(function(a, b) {
            return b.value - a.value;
        });

        if (table.length === 11) {
            table.length = 10;
        }

        localStorage.setItem('table', JSON.stringify(table));
    }

    function displayTableRecords() {
        const tableRecords = document.querySelector('.table-records');
        const heading = document.createElement('h2');
        heading.textContent = 'Таблица рекордов';
        tableRecords.appendChild(heading);
        const table = document.createElement('table');
        let row = document.createElement('tr');
        let headercell = document.createElement('th');
        headercell.textContent = '#';
        row.appendChild(headercell);
        headercell = document.createElement('th');
        headercell.textContent = 'Имя игрока';
        row.appendChild(headercell);
        headercell = document.createElement('th');
        headercell.textContent = 'Количество побежденных монстров';
        row.appendChild(headercell);
        table.appendChild(row);
        
        let records = JSON.parse(localStorage.getItem('table'));
        
        for (let i = 0; i < 10; i++) {
            let row = document.createElement('tr');
            let cell = document.createElement('td');
            cell.textContent = i + 1;
            row.appendChild(cell);
            cell = document.createElement('td');
            cell.textContent = i < records.length ? records[i].name : '---';
            row.appendChild(cell);
            cell = document.createElement('td');
            cell.textContent = i < records.length ? records[i].value : '---';
            row.appendChild(cell);
            table.appendChild(row);
        }

        tableRecords.appendChild(table);
        const buttonOk = document.createElement('div');
        buttonOk.className = 'button-ok';
        const span = document.createElement('span');
        span.textContent = 'Ok';
        buttonOk.appendChild(span);
        tableRecords.appendChild(buttonOk);
        show(tableRecords);
        buttonOk.addEventListener('click', goToHomePage);
    }

    function goToHomePage() {
        const tableRecords = document.querySelector('.table-records');
        clearScreen(tableRecords);
        hide(tableRecords);
        hide(document.querySelector('.game-container'));
        handleHomeScreenButtons();
        show(document.querySelector('.landing-page-container'));
    }

    function getRandomTask() {
        let tasks = [
            createArithmeticTask,
            createTranslateEnRuTask,
            createTranslateRuEnTask,
            createCapitalsTask,
            createCountriesTask,
            createShuffledLettersTask,
            createListeningTask,
            createListenAndTranslateTask,
            createSortingLettersTask,
            createSortingLettersRightTask,
            createMissingNumberTask,
            createRiddleTask,
            createBinaryToDecimalTask,
            createDecimalToBinaryTask,
            createOddOneOutTask
        ];

        _.sample(tasks)();
    }

    let dictionary, countries, riddles, words;

    let xhrDictionary = new XMLHttpRequest();
    xhrDictionary.open('GET', 'assets/json/dictionary.json', true);
    xhrDictionary.send();
    xhrDictionary.onreadystatechange = function() {
        if (xhrDictionary.readyState != 4) return;
        if (xhrDictionary.status != 200) {
            alert(xhrDictionary.status + ': ' + xhrDictionary.statusText);
        } else {
            dictionary = JSON.parse(xhrDictionary.responseText);
        }
    };

    let xhrCountries = new XMLHttpRequest();
    xhrCountries.open('GET', 'assets/json/countries.json', true);
    xhrCountries.send();
    xhrCountries.onreadystatechange = function() {
        if (xhrCountries.readyState != 4) return;
        if (xhrCountries.status != 200) {
            alert(xhrCountries.status + ': ' + xhrCountries.statusText);
        } else {
            countries = JSON.parse(xhrCountries.responseText);
        }
    };

    let xhrRiddles = new XMLHttpRequest();
    xhrRiddles.open('GET', 'assets/json/riddles.json', true);
    xhrRiddles.send();
    xhrRiddles.onreadystatechange = function() {
        if (xhrRiddles.readyState != 4) return;
        if (xhrRiddles.status != 200) {
            alert(xhrRiddles.status + ': ' + xhrRiddles.statusText);
        } else {
            riddles = JSON.parse(xhrRiddles.responseText);
        }
    };

    let xhrWords = new XMLHttpRequest();
    xhrWords.open('GET', 'assets/json/words.json', true);
    xhrWords.send();
    xhrWords.onreadystatechange = function() {
        if (xhrWords.readyState != 4) return;
        if (xhrWords.status != 200) {
            alert(xhrWords.status + ': ' + xhrWords.statusText);
        } else {
            words = JSON.parse(xhrWords.responseText);
        }
    };    

    function createArithmeticTask() {
        let sign = _.sample(['+', '-', '&times;', '&divide;']);
        let a, b;
        let result;
        a = _.random(1, 100);
        b = _.random(1, 100);
        
        switch(sign) {
            case '+':           
                result = a + b;
                break;
            case '-':            
                result = a - b;
                break;
            case '&times;':
                a = _.random(2, 10);
                b = _.random(2, 100);
                result = a * b;
                break;
            default:
                a = _.random(2, 100);
                b = _.random(2, 10);
                result = _.round(a / b);
                a = result * b;       
        }

        const taskData = {
            title: `Посчитайте: <span>${a} ${sign} ${b} = &hellip; ?</span>`,
            correctAnswer: result,
            type: 'numbers'
        };

        renderTask(taskData);
    }

    function createTranslateEnRuTask() {
        let randomValues = _.sample(dictionary);
        let word = randomValues[0];
        let type = 'translation';

        if (Array.isArray(randomValues[1])) {
            type += 'MultipleAnswer';
        }

        const taskData = {
            title: `Переведите слово <span>"${word}"</span> на русский язык`,
            correctAnswer: randomValues[1],
            type
        };

        renderTask(taskData);
    }

    function createTranslateRuEnTask() {
        let randomValues = _.sample(dictionary);
        let word;

        if (!Array.isArray(randomValues[1])) {
            word = randomValues[1];
        } else {
            word = _.sample(randomValues[1]);
        }

        const taskData = {
            title: `Переведите слово <span>"${word}"</span> на английский язык`,
            correctAnswer: randomValues[0]
        };

        renderTask(taskData);
    }

    function createCapitalsTask() {
        let randomValues = _.sample(countries);

        const taskData = {
            title: `Назовите столицу страны: <span>${randomValues[0]}</span>`,
            correctAnswer: randomValues[1]
        };
        
        renderTask(taskData);
    }

    function createCountriesTask() {
        let randomValues = _.sample(countries);

        const taskData = {
            title: `Назовите страну, столицей которой является <span>${randomValues[1]}</span>`,
            correctAnswer: randomValues[0]
        };
        
        renderTask(taskData);
    }

    function createShuffledLettersTask() {
        let word = _.sample(dictionary)[0];
        let letters = word.split('');
        let shuffledLetters = _.shuffle(letters);

        const taskData = {
            title: 'Поменяйте буквы местами так, чтобы получилось слово',
            tiles: shuffledLetters,
            correctAnswer: word,
            type: 'draggable'
        };

        renderTask(taskData);
    }

    function createListeningTask() {
        let word = _.sample(dictionary)[0];

        const taskData = {
            title: 'Напишите услышанное слово:',
            word,
            correctAnswer: word,
            type: 'listening'
        };

        renderTask(taskData);     
    }

    function createListenAndTranslateTask() {
        let randomValues = _.sample(dictionary);
        let type = 'listening';

        if (Array.isArray(randomValues[1])) {
            type += 'MultipleAnswer';
        }

        const taskData = {
            title: 'Переведите услышанное слово на русский язык:',
            word: randomValues[0],
            correctAnswer: randomValues[1],
            type
        };

        renderTask(taskData);
    }

    function createSortingLettersTask() {
        let letters = _.shuffle(_.toLower(_.sample(dictionary)[0]).split(''));
        let correctAnswer = _.sortBy(letters).join('');
        
        const taskData = {
            title: 'Отсортируйте буквы в алфавитном порядке',
            tiles: letters,
            correctAnswer,
            type: 'draggable'
        };

        renderTask(taskData);
    }

    function createSortingLettersRightTask() {
        let letters = _.shuffle(_.toLower(_.sample(dictionary)[0]).split(''));
        let correctAnswer = _.sortBy(letters).reverse().join('');
        
        const taskData = {
            title: 'Отсортируйте буквы в обратном алфавитном порядке',
            tiles: letters,
            correctAnswer,
            type: 'draggable'
        };

        renderTask(taskData);
    }

    function createMissingNumberTask() {
        let sequence = [];
        let sign = _.sample(['+', '-', '*']);
        let a, n;

        if (sign === '*') {
            a = _.random(1, 10);
            n = _.random(2, 5);
        } else {
            a = _.random(1, 100);
            n = _.random(1, 10);
        }

        for (let i = 0; i < 4; i++) {
            sequence.push(a);

            switch(sign) {
                case '+': a += n; break;
                case '-': a -= n; break;
                default: a *= n;
            }

        }

        let correctAnswer = _.sample(sequence);
        sequence[_.indexOf(sequence, correctAnswer)] = '*';

        let expression = sequence.join(', ');

        const taskData = {
            title: `Найдите пропущенное число в последовательности чисел:<br><span>${expression}</span>`,
            correctAnswer,
            type: 'numbers'
        };

        renderTask(taskData);
    }

    function createRiddleTask() {
        let randomValues = _.sample(riddles);
        let type = 'riddle'; 

        if (Array.isArray(randomValues[1])) {
            type += 'MultipleAnswer';
        }
        
        const taskData = {
            title: `Отгадайте загадку:<br><span>${randomValues[0]}</span>`,
            correctAnswer: randomValues[1],
            type
        };

        renderTask(taskData);
    }

    function createBinaryToDecimalTask() {
        let numerals = [];
        numerals.push(1);
        let length = _.random(2, 5);
        
        for (let i = 1; i < length; i++) {
            numerals.push(_.random(1));
        }

        let str = numerals.join('');

        let result = 0;
        let n = length - 1;

        for (let i = 0; i < length; i++) {
            result += numerals[i] * 2 ** n;
            n--;
        }

        const taskData = {
            title: `Переведите число <span>${str}</span> из двоичной системы счисления в десятичную`,
            correctAnswer: result,
            type: 'numbers'
        };

        renderTask(taskData);
    }

    function createDecimalToBinaryTask() {
        let number = _.random(2, 50);
        let decNumber = number;
        let stack = [];
        let binString = '';
        
        while (decNumber > 0) {
            stack.push(decNumber % 2);
            decNumber = _.floor(decNumber / 2);
        }
        
        while(stack.length) {
            binString = binString + stack.pop();
        }

        let correctAnswer = _.toNumber(binString);

        const taskData = {
            title: `Переведите число <span>${number}</span> из десятичной системы счисления в двоичную`,
            correctAnswer,
            type: 'numbers'
        };

        renderTask(taskData);
    }

    function createOddOneOutTask() {
        let randomValues = _.sample(words);
        let task = randomValues.task;
        let str = task.join(', ');
        let correctAnswer = randomValues.answer;

        const taskData = {
            title: `Найдите лишнее слово:<br><span>${str}</span>`,
            correctAnswer        
        };

        renderTask(taskData);
    }

    function renderTask(data) {
        let playerAnswer = '';
        
        const taskScreen = document.querySelector('#task-screen');
        show(taskScreen);
        const taskContainer = document.createElement('div');
        taskContainer.className = 'task-container';
        const entryWords = document.createElement('span');
        entryWords.textContent = 'Чтобы активировать заклинание, выполните следующее задание:';
        taskContainer.appendChild(entryWords);
        const task = document.createElement('p');
        task.innerHTML = data.title;
        taskContainer.appendChild(task);

        if (data.type === 'listening' || data.type === 'listeningMultipleAnswer') {
            music.pause();
            const buttonListen = document.createElement('div');
            buttonListen.className = 'button';
            const span = document.createElement('span');
            span.textContent = 'Прослушать снова';
            buttonListen.appendChild(span);
            taskContainer.appendChild(buttonListen);
            utterWord(data.word);

            buttonListen.addEventListener('click', (e) => {
                utterWord(data.word);
            });
        }

        let answer;

        if (data.type !== 'draggable') {
            answer = document.createElement('input');            
        } else {
            answer = document.createElement('ul');
            answer.className = 'sortable';
            answer.id = 'sortable';

            for (let i = 0; i < data.tiles.length; i++) {
                const tiles = document.createElement('li');
                tiles.className = 'tiles';
                tiles.textContent = data.tiles[i];
                answer.appendChild(tiles);
            }

        }

        taskContainer.appendChild(answer);
        const buttonDone = document.createElement('div');
        buttonDone.className = 'button-done';
        const span = document.createElement('span');
        span.textContent = 'Готово!';
        buttonDone.appendChild(span);
        taskContainer.appendChild(buttonDone);
        taskScreen.appendChild(taskContainer);
        answer.focus();

        $(function() {
            $('#sortable').sortable();
            $('#sortable').disableSelection();        
        });

        buttonDone.addEventListener('click', function() {
            
            if (data.type === 'draggable') {
                const tiles = document.querySelectorAll('.tiles');
            
                for (let i = 0; i < tiles.length; i++) {
                    playerAnswer += tiles[i].textContent;
                }

            } else {
                playerAnswer = answer.value;
                answer.disabled = true;
            }

            handleInput(playerAnswer, data);
        });
    }
    
    function handleInput(input, data) {
        startTime = null;
        if (isCorrect(input, data)) {
            soundCorrect.play();
            showMessage('Верно! :)');
            monster.health -= 25;
            helper.answer = 'correct';

            if (monster.health === 0) {
                setTimeout(() => {
                    player.defeatedMonsters++;
                    monster = new Monster();
                }, 11000);
            }

        } else {
            helper.answer = 'incorrect';
            let answer;

            if (Array.isArray(data.correctAnswer)) {
                answer = `Правильные ответы: ${data.correctAnswer.join(', ')}`;
            } else {
                answer = `Правильный ответ: ${data.correctAnswer}`;
            }

            soundIncorrect.play();
            showMessage(`Неверно! :( ${answer}`);
            player.health -= 20;
        }
        
        setTimeout(function() {
            music.play();
            const taskScreen = document.querySelector('#task-screen');
            clearScreen(taskScreen);
            hide(taskScreen);

            if (player.health && helper.answer === 'correct') {
                setTimeout(() => {
                    createButtonChooseSpell();
                }, 9000);
            } else if (player.health && helper.answer === 'incorrect') {
                setTimeout(() => {
                    createButtonChooseSpell();
                }, 6000);
            } else {
                setTimeout(() => {
                    createButtonRecords();
                    stopAnimation();
                    music.pause();
                    music.currentTime = 0;
                }, 6000);
            }

        }, 2000);
    }

    function createButtonRecords() {
        const gameContainer = document.querySelector('.game-container');
        const buttonRecords = document.createElement('div');
        buttonRecords.className = 'button-records';
        const span = document.createElement('span');
        span.textContent = 'Таблица рекордов';
        buttonRecords.appendChild(span);
        gameContainer.appendChild(buttonRecords);

        buttonRecords.addEventListener('click', function handleButtonRecords() {
            canvas.remove();
            updateTableRecords();
            displayTableRecords();
            buttonRecords.removeEventListener('click', handleButtonRecords);
            buttonRecords.remove();
        });
    }

    function utterWord(word) {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance(word);
        utterThis.volume = 1;
        utterThis.lang = 'en-GB';
        synth.speak(utterThis);
    }

    function isCorrect(answer, data) {
        switch (data.type) {
            case 'numbers':
                return _.toNumber(answer) === data.correctAnswer;
            case 'listeningMultipleAnswer':
            case 'translationMultipleAnswer':
            case 'riddleMultipleAnswer':
                return _.indexOf(data.correctAnswer, _.toLower(_.trim(answer))) !== -1;
            default:
                return _.toLower(data.correctAnswer) === _.toLower(_.trim(answer));
        }
    }

    function showMessage(message) {
        const taskContainer = document.querySelector('.task-container');
        document.querySelector('.button-done').remove();
        const div = document.createElement('div');
        message === 'Верно! :)' ? div.className = 'correct' : div.className = 'incorrect';
        const span = document.createElement('span');
        span.textContent = message;
        div.appendChild(span);
        taskContainer.appendChild(div);
    }

    function clearScreen(node) {

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

    }

    let dy = 0.1;

    function drawUpperCanvas() {
        ctx.font = '16px Tahoma';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(player.name, 20, 30);
        ctx.textAlign = 'center';
        ctx.fillText(`Количество побежденных монстров: ${player.defeatedMonsters}`, canvas.width / 2, 51);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#808080';
        ctx.fillRect(20, 35, 202, 20);
        ctx.fillStyle = '#ff7f50';
        ctx.fillRect(21, 36, 200, 18);
        ctx.fillStyle = '#90ee90';
        ctx.fillRect(21, 36, playerHealth * 2, 18);
        ctx.fillStyle = '#808080';
        ctx.fillText(_.round(playerHealth), 27, 51);
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'right';
        ctx.fillText(monster.name, canvas.width - 20, 30);
        ctx.fillStyle = '#808080';
        ctx.fillRect(canvas.width - 20, 35, -202, 20);
        ctx.fillStyle = '#ff7f50';
        ctx.fillRect(canvas.width - 21, 36, -200, 18);
        ctx.fillStyle = '#90ee90';
        ctx.fillRect(canvas.width - 21, 36, monsterHealth * (-2), 18);
        ctx.fillStyle = '#808080';
        ctx.fillText(_.round(monsterHealth), canvas.width - 27, 51);
        
    }

    function drawMessage(message) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Tahoma';
        ctx.textAlign = 'center';
        ctx.fillText(`${message}`, canvas.width / 2, canvas.height / 2);
    }

    let requestId;

    function renderCanvas(timeStamp) {
        player.pos[1] += dy;
        monster.pos[1] += dy;
        
        if (player.pos[1] > 367 || player.pos[1] < 363) {
            dy = -dy;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer(player.pos[0], player.pos[1]);
        ctx.shadowBlur = 0;
        drawUpperCanvas();
        
        if (!startTime) {
            startTime = timeStamp;
        }

        let progress = timeStamp - startTime;

        if (playerHealth === 0) {
            drawMessage('КОНЕЦ ИГРЫ');
        }

        if (monsterHealth === 0) {
            drawMessage('ПОБЕДА!');
        }

        drawMonster(monster.pos[0], monster.pos[1]);

        if (helper.answer === 'correct') {
            if (progress > 4000 && progress < 6000) {
                applySpell();
            } else if (progress >= 6000 && progress <= 9000) {
                reduceMonsterHealth();
                soundLaser.pause();
                soundLaser.currentTime = 0;
                soundElectricity.pause();
                soundElectricity.currentTime = 0;
            } else if (progress > 9000 && progress < 11000
            && monster.health !== 0) {
                applyMonsterSpell();
                ctx.shadowColor = '#a3d4f4';
                ctx.shadowBlur = 40;
            } else if (progress >= 9000 && progress < 13000) {
                soundLaser.pause();
                soundLaser.currentTime = 0;                
            }
        }

        if (helper.answer === 'incorrect') {
            if (progress > 4000 && progress < 6000) {
                applyMonsterSpell();
                ctx.shadowColor = '#ff7f50';
                ctx.shadowBlur = 40;
            } else if (progress >= 6000 && progress <= 9000) {
                reducePlayerHealth();
                soundLaser.pause();
                soundLaser.currentTime = 0;                            
            }
        }
        
        restoreMonsterHealth();
        requestId = requestAnimationFrame(renderCanvas);
    }

    function stopAnimation() {
        cancelAnimationFrame(requestId);
    }

    function reducePlayerHealth() {
        if (player.health !== playerHealth
            && player.health - playerHealth < 20) {
            playerHealth -= 0.5;
        }
    }

    function reduceMonsterHealth() {
        if (monster.health !== monsterHealth
            && monster.health - monsterHealth < 25) {
            monsterHealth -= 0.5;
        }
    }

    function restoreMonsterHealth() {
        if (monster.health > monsterHealth) {
            monsterHealth += 4;
        }
    }

    function drawPlayer(x, y) {
        ctx.drawImage(sprite, 0, 900, 300, 300, x, y, 300, 300);
    }

    function drawMonster(x, y) {    
        let posL = monster.legs;
        let posB = monster.body;
        let posH = monster.head;
        let posW = monster.weapon;

        ctx.drawImage(sprite, posL[0], posL[1], posL[2], posL[3], x, y, posL[2], posL[3]);
        ctx.drawImage(sprite, posB[0], posB[1], posB[2], posB[3], x, y - 156, posB[2], posB[3]);
        ctx.drawImage(sprite, posH[0], posH[1], posH[2], posH[3], x, y - 212, posH[2], posH[3]);
        ctx.drawImage(sprite, posW[0], posW[1], posW[2], posW[3], x - 70, y - 186, posW[2], posW[3]);
    }

    function applySpell() {
        if (helper.chosenSpell === 'laser-ray') {
            applyLaserRay();
        } else {
            applyElectricRay();
        }
    }

    function applyLaserRay() {
        soundLaser.play();
        ctx.beginPath();
        ctx.moveTo(player.pos[0] + 282, player.pos[1] + 155);
        ctx.lineTo(monster.pos[0] + 135, monster.pos[1] - 51);
        ctx.lineWidth = _.random(20);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#f08080';
        ctx.stroke();
    }

    function applyElectricRay() {
        soundElectricity.play();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#a3d4f4';
        let distX = monster.pos[0] - player.pos[0] - 147;
        let distY = monster.pos[1] - player.pos[1] - 206;
        let currX = player.pos[0] + 282;
        let currY = player.pos[1] + 155;
        ctx.beginPath();
        ctx.moveTo(currX, currY);
        
        for (let i = 0; i < 9; i++) {
            currX = currX + 0.1 * distX;
            currY = currY + 0.1 * distY;
            currX += 20 - _.random(50);
            currY += 20 - _.random(50);
            ctx.lineTo(currX, currY);
        }
        
        ctx.lineTo(monster.pos[0] + 135, monster.pos[1] - 51);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#a3d4f4';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function applyMonsterSpell() {
        soundLaser.play();
        ctx.beginPath();
        ctx.moveTo(995, 420);
        ctx.lineTo(240, 500);
        ctx.lineWidth = _.random(20);
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#90ee90';
        ctx.stroke();        
    }
}
