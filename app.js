var allQuizzes = [];
var playedCount = 0;
var deleteTargetId = null;

var currentQuiz = null;
var currentQIndex = 0;
var correctCount = 0;
var answered = false;
var userAnswers = [];

var createQuestions = [];

function loadData() {
  var saved = localStorage.getItem('quizapp-quizzes');
  if (saved) {
    allQuizzes = JSON.parse(saved);
  } else {
    allQuizzes = [
      {
        id: 'q1',
        title: 'Наука и природа',
        questions: [
          {
            text: 'Какая планета самая большая в солнечной системе?',
            options: ['Земля', 'Сатурн', 'Юпитер', 'Нептун'],
            correct: 2
          },
          {
            text: 'Сколько костей в теле взрослого человека?',
            options: ['106', '206', '306', '256'],
            correct: 1
          },
          {
            text: 'Что такое фотосинтез?',
            options: [
              'Дыхание животных',
              'Преобразование света в энергию растениями',
              'Процесс пищеварения',
              'Тип размножения'
            ],
            correct: 1
          }
        ]
      },
      {
        id: 'q2',
        title: 'Мировая география',
        questions: [
          {
            text: 'Какая страна самая большая по площади?',
            options: ['США', 'Китай', 'Россия', 'Канада'],
            correct: 2
          },
          {
            text: 'В какой стране находится Эйфелева башня?',
            options: ['Италия', 'Испания', 'Германия', 'Франция'],
            correct: 3
          },
          {
            text: 'Какой океан самый большой?',
            options: ['Атлантический', 'Тихий', 'Индийский', 'Северный Ледовитый'],
            correct: 1
          },
          {
            text: 'Столица Австралии?',
            options: ['Сидней', 'Мельбурн', 'Брисбен', 'Канберра'],
            correct: 3
          }
        ]
      }
    ];
    saveData();
  }

  var ps = localStorage.getItem('quizapp-played');
  if (ps) {
    playedCount = parseInt(ps);
  }
}

function saveData() {
  localStorage.setItem('quizapp-quizzes', JSON.stringify(allQuizzes));
}

function savePlayedCount() {
  localStorage.setItem('quizapp-played', String(playedCount));
}

function showPage(id) {
  var pages = document.querySelectorAll('.page');
  pages.forEach(function(p) {
    p.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'page-home') renderHome();
  if (id === 'page-create') renderCreatePage();
}

function renderHome() {
  var totalQ = 0;
  allQuizzes.forEach(function(q) {
    totalQ += q.questions.length;
  });

  document.getElementById('stat-total').textContent = allQuizzes.length;
  document.getElementById('stat-played').textContent = playedCount;
  document.getElementById('stat-questions').textContent = totalQ;

  var list = document.getElementById('quiz-list');
  list.innerHTML = '';

  if (allQuizzes.length === 0) {
    list.innerHTML =
      '<div class="empty">' +
      '<div class="empty-icon">🎯</div>' +
      '<div class="empty-text">Викторин пока нет</div>' +
      '<div class="empty-sub">Создай первую!</div>' +
      '</div>';
    return;
  }

  allQuizzes.forEach(function(quiz) {
    var card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML =
      '<div onclick="startQuiz(\'' + quiz.id + '\')" style="flex:1; cursor:pointer;">' +
      '<div class="quiz-card-title">' + quiz.title + '</div>' +
      '<div class="quiz-card-meta">' + quiz.questions.length + ' вопросов</div>' +
      '</div>' +
      '<div style="display:flex; align-items:center;">' +
      '<div class="quiz-card-arrow" onclick="startQuiz(\'' + quiz.id + '\')" style="cursor:pointer;">→</div>' +
      '<button class="quiz-card-del" onclick="askDelete(\'' + quiz.id + '\')" title="Удалить">✕</button>' +
      '</div>';
    list.appendChild(card);
  });
}

function askDelete(id) {
  deleteTargetId = id;
  document.getElementById('delete-modal').classList.add('open');
}

function closeModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal').classList.remove('open');
}

function confirmDelete() {
  allQuizzes = allQuizzes.filter(function(q) {
    return q.id !== deleteTargetId;
  });
  saveData();
  closeModal();
  renderHome();
  showToast('Викторина удалена');
}

function renderCreatePage() {
  document.getElementById('quiz-title-input').value = '';
  createQuestions = [];
  renderQuestionsList();
  addQuestion();
}

function addQuestion() {
  createQuestions.push({
    text: '',
    options: ['', '', '', ''],
    correct: 0
  });
  renderQuestionsList();
  setTimeout(function() {
    window.scrollTo(0, document.body.scrollHeight);
  }, 50);
}

function removeQuestion(idx) {
  if (createQuestions.length <= 1) {
    showToast('Нужен хотя бы 1 вопрос');
    return;
  }
  createQuestions.splice(idx, 1);
  renderQuestionsList();
}

function renderQuestionsList() {
  var container = document.getElementById('questions-list');
  container.innerHTML = '';

  createQuestions.forEach(function(q, qi) {
    var block = document.createElement('div');
    block.className = 'q-block';
    block.id = 'qblock-' + qi;

    var html =
      '<div class="q-num" style="display:flex; justify-content:space-between; align-items:center;">' +
      '<span>Вопрос ' + (qi + 1) + '</span>' +
      (createQuestions.length > 1
        ? '<button onclick="removeQuestion(' + qi + ')" style="background:none;border:none;color:#ff4444;cursor:pointer;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;font-family:Arial Black,Arial,sans-serif;">Удалить</button>'
        : '') +
      '</div>';

    html +=
      '<input type="text" placeholder="Текст вопроса..." value="' +
      esc(q.text) +
      '" oninput="createQuestions[' +
      qi +
      '].text = this.value" style="margin-bottom: 18px;" />';

    html += '<div class="q-num" style="margin-top:4px;">Варианты ответа — отметь правильный ✓</div>';

    q.options.forEach(function(opt, oi) {
      html +=
        '<div class="option-row">' +
        '<button class="correct-btn ' +
        (q.correct === oi ? 'selected' : '') +
        '" onclick="setCorrect(' + qi + ',' + oi + ')">' +
        (q.correct === oi ? '✓' : oi + 1) +
        '</button>' +
        '<input type="text" placeholder="Вариант ' +
        (oi + 1) +
        '..." value="' +
        esc(opt) +
        '" oninput="createQuestions[' +
        qi +
        '].options[' +
        oi +
        '] = this.value" />' +
        '</div>';
    });

    block.innerHTML = html;
    container.appendChild(block);
  });
}

function setCorrect(qi, oi) {
  createQuestions[qi].correct = oi;
  renderQuestionsList();
}

function esc(str) {
  return str.replace(/"/g, '"').replace(/</g, '<');
}

function saveQuiz() {
  var title = document.getElementById('quiz-title-input').value.trim();
  if (!title) {
    showToast('Введи название викторины');
    return;
  }

  var ok = true;
  createQuestions.forEach(function(q, qi) {
    if (!q.text.trim()) {
      showToast('Заполни текст вопроса ' + (qi + 1));
      ok = false;
    }
    q.options.forEach(function(o, oi) {
      if (!o.trim()) {
        showToast('Заполни вариант ' + (oi + 1) + ' в вопросе ' + (qi + 1));
        ok = false;
      }
    });
  });
  if (!ok) return;

  var newQuiz = {
    id: 'q' + Date.now(),
    title: title,
    questions: JSON.parse(JSON.stringify(createQuestions))
  };

  allQuizzes.unshift(newQuiz);
  saveData();
  showToast('Викторина сохранена!');
  showPage('page-home');
}

function startQuiz(id) {
  currentQuiz = null;
  allQuizzes.forEach(function(q) {
    if (q.id === id) currentQuiz = q;
  });
  if (!currentQuiz) return;

  currentQIndex = 0;
  correctCount = 0;
  answered = false;
  userAnswers = [];

  document.getElementById('play-quiz-name').textContent = currentQuiz.title;
  showPage('page-play');
  renderQuestion();
}

function renderQuestion() {
  var q = currentQuiz.questions[currentQIndex];
  var total = currentQuiz.questions.length;
  answered = false;

  var pct = (currentQIndex / total) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('question-counter').textContent = 'Вопрос ' + (currentQIndex + 1) + ' из ' + total;
  document.getElementById('question-text').textContent = q.text;

  var list = document.getElementById('answers-list');
  list.innerHTML = '';

  q.options.forEach(function(opt, oi) {
    var btn = document.createElement('button');
    btn.className = 'answer-option';
    btn.textContent = opt;
    btn.onclick = function() {
      pickAnswer(oi);
    };
    list.appendChild(btn);
  });

  document.getElementById('next-btn').style.display = 'none';
}

function pickAnswer(oi) {
  if (answered) return;
  answered = true;

  var q = currentQuiz.questions[currentQIndex];
  var btns = document.querySelectorAll('.answer-option');

  userAnswers.push({ chosen: oi, correct: q.correct });

  if (oi === q.correct) {
    correctCount++;
    btns[oi].classList.add('correct');
  } else {
    btns[oi].classList.add('wrong');
    btns[q.correct].classList.add('correct');
  }

  btns.forEach(function(b) {
    b.classList.add('disabled');
  });

  var nextBtn = document.getElementById('next-btn');
  if (currentQIndex + 1 < currentQuiz.questions.length) {
    nextBtn.textContent = 'Следующий вопрос →';
  } else {
    nextBtn.textContent = 'Посмотреть результат →';
  }
  nextBtn.style.display = 'block';
}

function nextQuestion() {
  currentQIndex++;
  if (currentQIndex >= currentQuiz.questions.length) {
    showResult();
  } else {
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

function quitQuiz() {
  showPage('page-home');
}

function showResult() {
  playedCount++;
  savePlayedCount();

  var total = currentQuiz.questions.length;
  var pct = Math.round((correctCount / total) * 100);

  document.getElementById('result-quiz-name').textContent = currentQuiz.title;
  document.getElementById('result-score').textContent = correctCount + '/' + total;

  var msg = '';
  var sub = '';
  if (pct === 100) {
    msg = 'Идеально! 🔥';
    sub = 'Ты знаешь всё!';
  } else if (pct >= 75) {
    msg = 'Отлично! ✨';
    sub = 'Почти идеально';
  } else if (pct >= 50) {
    msg = 'Неплохо! 👍';
    sub = 'Можно лучше';
  } else if (pct >= 25) {
    msg = 'Стараешься! 💪';
    sub = 'Повтори материал';
  } else {
    msg = 'В следующий раз! 😅';
    sub = 'Попробуй ещё раз';
  }

  document.getElementById('result-msg').textContent = msg;
  document.getElementById('result-sub').textContent = sub + ' — ' + pct + '%';

  var details = document.getElementById('result-details');
  details.innerHTML = '';

  currentQuiz.questions.forEach(function(q, i) {
    var ua = userAnswers[i];
    var isRight = ua.chosen === ua.correct;

    var block = document.createElement('div');
    block.style.cssText =
      'border: 3px solid ' +
      (isRight ? '#D8FF00' : '#ff4444') +
      ';' +
      'border-radius: 20px;' +
      'padding: 22px 26px;' +
      'margin-bottom: 14px;' +
      'text-align: left;';

    block.innerHTML =
      '<div style="font-size:11px;text-transform:uppercase;letter-spacing:3px;color:' +
      (isRight ? '#D8FF00' : '#ff4444') +
      ';margin-bottom:10px;">' +
      (isRight ? '✓ Верно' : '✕ Неверно') +
      ' — Вопрос ' +
      (i + 1) +
      '</div>' +
      '<div style="font-size:16px;font-weight:900;text-transform:uppercase;margin-bottom:12px;">' +
      q.text +
      '</div>' +
      (!isRight
        ? '<div style="font-size:13px;color:#ff4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Твой ответ: ' +
          q.options[ua.chosen] +
          '</div>'
        : '') +
      '<div style="font-size:13px;color:#D8FF00;text-transform:uppercase;letter-spacing:1px;">Правильно: ' +
      q.options[ua.correct] +
      '</div>';

    details.appendChild(block);
  });

  document.getElementById('progress-bar').style.width = '100%';
  showPage('page-result');
}

function replayQuiz() {
  if (currentQuiz) startQuiz(currentQuiz.id);
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() {
    t.classList.remove('show');
  }, 2500);
}

loadData();
renderHome();

document.getElementById('delete-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

