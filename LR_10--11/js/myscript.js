
// feedback script
var button = document.getElementById('feedbackButton')
var feedbackField = document.getElementById('feedback')
var useLocalStorage = false
var condition = "online";

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange

if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

window.addEventListener('online', function(e) {
  condition = "online";
  console.log(condition)
  takeFromStorage()
});
window.addEventListener('offline', function(e) {
  condition = "offline";
  console.log(condition)
});

function takeFromStorage() {
  if (useLocalStorage) {
    var data = JSON.parse(localStorage.getItem('feedbacks'))
    for (var i = 0; i < data.length; i++) {
      console.log(data[i]);
    var feedback = '<div class="feedback"><h2>'+ data[i].author +'</h2><span>'+ data[i].date +'</span><p>'+ data[i].text +'</p></div>'
    }
    var feedbacks= document.getElementById('feedbacksWrap')
    var feedbackWrap = document.createElement('div')
    feedbackWrap.innerHTML = feedback
      feedbacks.appendChild(feedbackWrap)
    localStorage.removeItem('feedbacks')
  }
}

button.addEventListener('click', function() {
    var feedbackFieldValue = feedbackField.value;

    if(feedbackFieldValue.length == 0){
      window.alert('Please fill the field');
    }
    else{
      if (condition=='online') {
        var feedback = '<div class="feedback"><h2> Вася Петькін</h2><span>'+ new Date().toDateString() +'</span><p>'+ feedbackField.value+'</p></div>'
        var feedbacks= document.getElementById('feedbacksWrap')
        var feedbackWrap = document.createElement('div')
        feedbackWrap.innerHTML = feedback
        feedbacks.appendChild(feedbackWrap)
        feedbackField.value = ''
      }
      else{
        function addFeedback() {
          class Feedback {
            constructor(text, author, date) {
              this.text = text;
              this.author = author;
              this.date = date;
            }
          }
          var date = new Date().toDateString();
          var feedbacks = new Feedback(feedbackField.value, 'Вася Петькін',date);
           addToStorage(feedbacks);
          alert('Article sent!');
          feedbackField.value = ''
        }
        addFeedback()
      }

      function sendToServer() {
        if(useLocalStorage){
          localStorage.clear()
        }
        else{
          const dbName = "Storage";
          var open = indexedDB.open(dbName);
          open.onsuccess = function() {
            var db = open.result;
            var tx = db.transaction("Feedbacks", "readwrite");
            var store = tx.objectStore("Feedbacks");
            var objectStoreRequest = store.clear();
        }
        }
      }

      function addToStorage(feedbacksItem) {
        feedbacks = []
        feedbacks.push(feedbacksItem)
        if (useLocalStorage) {
          localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
        } else {
          const dbName = "Storage";
          var open = indexedDB.open(dbName);
          open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore("Feedbacks", {keyPath: "date"});
          };
          open.onsuccess = function() {
            var db = open.result;
            var tx = db.transaction("Feedbacks", "readwrite");
            var store = tx.objectStore("Feedbacks");
            store.put(feedbacksItem)
        }
        }
        return false;
      }
    }
 });




/*//просто скриптик - просто
window.addEventListener('load', function () {
    function updateOnlineStatus(event) {
        if (isOnline()) {
            readOfflineComments();
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

var i = 0;

function isOnline() {
    return window.navigator.onLine;
}

function addComments() {
    if ($('#name').val() === "" || $('#text').val() === "") {
        alert('Заповніть всі поля');
        return false;
    }
    if (isOnline()) {
        var date = new Date;
        var author = document.getElementById('name').value;
        var text = document.getElementById('text').value;
        var parentElem = document.getElementById('reviews-list');
        var out = document.createElement('div');
        out.innerHTML =
            "<div class='container card'><br>" +
            "   <h2>" + author + "</h2>" +
            "   <span>" + date + "</span>" +
            "   <p> <br>" + text + "</p></div>";
        parentElem.appendChild(out);
        document.getElementById('form').reset();
    } else {
      if (useLocalStorage) {
            var date = new Date;
            var author = document.getElementById('name').value;
            var text = document.getElementById('text').value;
            i++;
            var list = [];
            list.push({"name": author, "text": text, "date": date});
            localStorage.setItem('r' + i, JSON.stringify(list));
        document.getElementById('form').reset();
      }
      else{
        var transaction = db.transaction(["reviews"], "readwrite");
            var store = transaction.objectStore("reviews");
            var review = {
                message: document.getElementById('text').value,
                author: document.getElementById('name').value,
                time: new Date
      };
      store.add(review);
    }
}}

function readOfflineComments() {
      if (useLocalStorage) {
        len = localStorage.length + 1;
        for (var k = 1; k < len; k++) {
            review = JSON.parse(localStorage.getItem('r' + k));
            var parentElem = document.getElementById('reviews-list');
            var out = document.createElement('div');
            out.id = 'review';
            out.innerHTML =
                "<div class='container card'><br>" +
                "   <span class='review-author'>" + review[0].name + "</span>" +
                "   <span class='review-date'>" + review[0].date + "</span>" +
                "   <p><br>" + review[0].text + "</p><br></div>";
            parentElem.appendChild(out);
            localStorage.removeItem(k);
        }
      }
      else {
        var transaction = db.transaction(["reviews"], "readonly");
        var store = transaction.objectStore("reviews");

        store.openCursor().onsuccess = function (e) {
            var cursor = e.target.result;
            if (cursor) {
                cursor.continue();
                var parentElem = document.getElementById('reviews-list');
                var out = document.createElement('div');
                out.id = 'review';
                out.innerHTML =
                "<div class='container card'><br>" +
                "   <span class='review-author'>" +cursor.value.author + "</span>" +
                "   <span class='review-date'>" + cursor.value.time + "</span>" +
                "   <p><br>" + cursor.value.message + "</p><br></div>";
                var request = db.transaction(["reviews"], "readwrite").objectStore("reviews").delete(cursor.primaryKey);
                parentElem.appendChild(out);

            }
        }
    }
}*/




/*var button = document.getElementById('feedbackButton')
var feedbackField = document.getElementById('feedback')
var feedbackName = document.getElementById('feedbackName')

button.addEventListener('click', function() {
    var feedbackFieldValue = feedbackField.value;
    var feedbackNameValue = feedbackName.value;

    if(feedbackFieldValue.length == 0){
      window.alert('Будьласка введіть імя');
    }
    else{
      if(feedbackNameValue.length == 0){
        window.alert('Будьласка введіть текст');
      }
      else{
        var feedback = document.createElement('div');
        feedback.classList.add('feedback');

        var author =  document.createElement('h2');
        author.innerHTML = feedbackNameValue

        var feedbackText = document.createElement('p');
        feedbackText.innerText = feedbackFieldValue

        var date = document.createElement('span');
        date.innerText = new Date().toDateString();

        feedback.appendChild(author);
        feedback.appendChild(date);
        feedback.appendChild(feedbackText);
        document.getElementById('feedbacksWrap').appendChild(feedback);

        feedbackField.value = ''
        feedbackName.value = ''
      }
    }
 });*/
