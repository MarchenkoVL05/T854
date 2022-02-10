/**
* Инициализация блока
* @param {node} recid - id блока
*/
  function t854_init(recid) {
    var rec = document.querySelector("#rec" + recid);
    var btnNews = rec.querySelector(".t854__news-btn");
    var newsContent = rec.querySelector(".t854__news-content");
    var attrKeyTelegram = newsContent.getAttribute("data-telegram-key");
    var keyTelegram = attrKeyTelegram.length !== 0 ? attrKeyTelegram : "V1J5MnVkSWJ2UW5nN1JZM";
    var attrCountNews = newsContent.getAttribute("data-telegram-news-amount");
    var symbolsAttr = newsContent.getAttribute("data-telegram-symbols-preview");
    var countNews = attrCountNews.length !== 0 ? +attrCountNews : 5;
    var dateFormat = newsContent.getAttribute("data-telegram-date");
    var currentFromNews = 0;
    var currentShlop = 0;
    var symbolsAmount = 40;
    if (symbolsAttr === "") {
      symbolsAmount = 200;
    } else {
      if (symbolsAttr < 40) {
        symbolsAmount = 40;
      } else if (symbolsAttr > 1000) {
        symbolsAmount = 1000;
      } else {
        symbolsAmount = symbolsAttr;
      }
    }
    var totalNews = t854_showNews(rec, newsContent, keyTelegram, countNews, currentFromNews, currentShlop, dateFormat, symbolsAmount);
    newsContent.removeAttribute("data-telegram-key");
    newsContent.removeAttribute("data-telegram-news-amount");
    newsContent.removeAttribute("data-telegram-symbols-preview");
    newsContent.removeAttribute("data-telegram-date");
    t854_hideBtn(btnNews, totalNews, currentFromNews, countNews);
    btnNews.addEventListener("click", function (e) {
      e.preventDefault();
      currentFromNews = currentFromNews + countNews;
      currentShlop = e.target.closest(".t854__news-wrap").getAttribute("data-news-shlop");
      t854_hideBtn(btnNews, totalNews, currentFromNews, countNews);
      if (currentFromNews < totalNews) {
        t854_showNews(rec, newsContent, keyTelegram, countNews, currentFromNews, currentShlop, dateFormat, symbolsAmount);
      }
    });
  }

/**
* Спрятать кнопку show news
* @param {node} btnNews - загрузить больше новостей
* @param {node} totalNews - все новости
* @param {node} currentFromNews - текущая новость
* @param {number} countNews - счётчик
*/
  function t854_hideBtn(btnNews, totalNews, currentFromNews, countNews) {
    if (totalNews - currentFromNews <= countNews) {
      btnNews.style.display = "none";
    }
  }

/**
* Вывод даты
* @param {date} date - дата
* @param {node} dateFormat - формат даты
*/
  function t854_formatDate(date, dateFormat) {
    var dateParts = date.split("-");
    var newDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var newMonth = newDate.getMonth();
    var newDay = newDate.getDay();
    var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    switch (+dateFormat) {
      case 1:
        return dateParts[1] + "-" + dateParts[2] + "-" + dateParts[0];
      case 2:
        return dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
      case 3:
        return dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];
      case 4:
        return dateParts[2] + "." + dateParts[1] + "." + dateParts[0];
      case 5:
        return month[newMonth] + " " + dateParts[2] + ", " + dateParts[0];
      default:
        return dayOfWeek[newDay] + ", " + month[newMonth] + " " + dateParts[2];
    }
  }

/**
* Получить все новости
* @param {node} rec - блок
* @param {string} keyTelegram - атрибут data-telegram-key
* @param {number} count - счётчик
* @param {string} shlop - атрибут data-news-shlop
* @param {number} symbolsAmount - количество символов
*/
  function t854_getNews(rec, keyTelegram, count, from, shlop, symbolsAmount) {
    var language = window.navigator ? window.navigator.language || window.navigator.systemLanguage || window.navigator.userLanguage : "ru";
    language = language.substr(0, 2).toLowerCase();
    var btnNews = rec.querySelector(".t854__news-btn");
    var newsWrap = rec.querySelector(".t854__news-wrap");
    var newsContainer = rec.querySelector(".t854__news-wrap-container");
    var loader = rec.querySelector(".t854__news-loader");
    var urlNews = "https://news.tildacdn.com/feed/" + keyTelegram + "/" + count + "/" + (parseInt(from) + parseInt(shlop)) + "/" + symbolsAmount;
    var dataJSON = "";
    loader.classList.add("t854__news-btn-loader_show");
    var request = new XMLHttpRequest();
    request.open('GET', urlNews, false);
    request.onload = function() {
      var data = request.response;
      if (this.status >= 200 && this.status < 400) {
        dataJSON = JSON.parse(data);
        newsWrap.setAttribute("data-news-shlop", dataJSON.shlop);
        if (dataJSON.status == "fail") {
          console.log("You entered an " + dataJSON.error);
          btnNews.style.display = "none";
          if (language == "ru") {
            newsWrap.innerHTML = "<div style=\"font-family:'Georgia',serif;font-size:20px;color:red;\">Вы ввели неправильный ключ</div>";
          } else {
            newsWrap.innerHTML = "<div style=\"font-family:'Georgia',serif;font-size:20px;color:red;\">You entered an " + dataJSON.error + "</div>";
          }
        }
        if (dataJSON.total == 0) {
          console.log("You haven't a publication");
        }
        loader.classList.remove("t854__news-btn-loader_show");
        newsContainer.style.opacity = 1;
        loader.style.display = "none";
      }
    };
    request.onerror = function() {
      console.log("Error!");
    };
    request.send();
    return dataJSON;
  }

/**
* Рендер новостей на страницу
* @param {node} rec - блок
* @param {node} newsContent - информация о новости
* @param {string} keyTelegram - атрибут data-telegram-key
* @param {number} count - счётчик
* @param {string} shlop - атрибут data-news-shlop
* @param {node} dateFormat - формат даты
* @param {number} symbolsAmount - количество символов
*/
  function t854_showNews(rec, newsContent, keyTelegram, count, from, shlop, dateFormat, symbolsAmount) {
    var news = t854_getNews(rec, keyTelegram, count, from, shlop, symbolsAmount);
    var newsContainer = rec.querySelector(".t854__news");
    var newsMessages = news.messages;
    var totalNews = news.total;
    var arrText = [];
    if (newsMessages !== undefined) {
      for (var i = 0; i < newsMessages.length; i++) {
        var dateNews = newsMessages[i].date.split(" ");
        var dayNews = dateNews[0];
        var textNews = newsMessages[i].text;
        var shortTextNews = newsMessages[i].short_text;
        var imageIdNews = newsMessages[i].files;
        var timeHTML = '<div class="t854__news-time t-descr t-descr_xxs">' + t854_formatDate(dayNews, dateFormat) + "</div>";
        var blockImageArr = [];
        var imagesHTML = t854_addImage(newsMessages[i], imageIdNews, blockImageArr);
        var textHTML = t854_addText(rec, textNews, shortTextNews, newsContainer);
        if (shortTextNews !== undefined) {
          if (imageIdNews.length !== 1) {
            newsContent.innerHTML +=  '<div class="t854__news-message t854__news-message_popup t854__news-message_short">' + 
                                        timeHTML + imagesHTML + textHTML + "</div>";
          } else {
            newsContent.innerHTML += '<div class="t854__news-message t854__news-message_popup t854__news-message_short">' +
                                      timeHTML +
                                      '<div class="t854__news-message-flex">' +
                                      imagesHTML +
                                      textHTML +
                                      "</div>" +
                                      "</div>";
          }
        } else {
          if (imageIdNews.length !== 1) {
            newsContent.innerHTML += '<div class="t854__news-message">' + timeHTML + 
                                      imagesHTML + textHTML + "</div>";
          } else {
            newsContent.innerHTML += '<div class="t854__news-message">' + timeHTML + '<div class="t854__news-message-flex">' + 
                                      imagesHTML + textHTML + "</div>" + "</div>";
          }
        }
      }
      t854_addPopup(rec, arrText);
      t854_closePopup(rec);
    }
    return totalNews;
  }

/**
* Вывод текста в попап
* @param {node} rec - блок
* @param {string} textNews - текст новости
* @param {string} shortTextNews - текст новости в попапе
*/
  function t854_addText(rec, textNews, shortTextNews) {
    var textHTML;
    if (textNews.length === 0) {
      textHTML = "";
    } else {
      if (shortTextNews !== undefined) {
        textHTML =
          '<div class="t854__news-text t-descr t-descr_xs">' +
          shortTextNews +
          '</div><div class="t854__news-text_short-hide t-descr t-descr_xs">' +
          textNews +
          "</div>";
      } else {
        textHTML = '<div class="t854__news-text t-descr t-descr_xs">' + textNews + "</div>";
      }
    }
    return textHTML;
  }

/**
* Вывод картинки
* @param {node} item - новая новость (newsMessages[i])
* @param {array} imageIdNews - идентификатор картинки
* @param {array} blockImageArr - все картинки
*/
  function t854_addImage(item, imageIdNews, blockImageArr) {
    var images = "";
    var imgHTML = "";
    if (item.files[0] !== undefined) {
    }
    for (var i = 0; i < imageIdNews.length; i++) {
      var imageUrl = "https://news.tildacdn.com/" + imageIdNews[i] + "/-/resize/x900/";
      var blockImage = '<div class="t854__news-image-wrap"><img src="' + imageUrl + '" class="t854__news-image"></div>';
      blockImageArr.push(blockImage);
    }
    if (blockImageArr.length !== 0) {
      for (var i = 0; i < blockImageArr.length; i++) {
        images += blockImageArr[i];
        if (blockImageArr.length > 2) {
          imgHTML = '<div class="t854__news-images t854__news-images_col3">' + images + "</div>";
        } else {
          imgHTML = '<div class="t854__news-images">' + images + "</div>";
        }
      }
    }
    return imgHTML;
  }

/**
* Создать попап
* @param {node} rec - блок
*/
  function t854_addPopup(rec) {
    var popupBlock = rec.querySelectorAll(".t854__news_publish.t854__news_short .t854__news-message");
    var wrapTextPopup = rec.querySelector(".t854__news-popup-bg");
    var textPopup = rec.querySelector(".t854__news-popup");
    var messageWrap = rec.querySelector(".t854__news_publish .t854__news-popup-message-wrap");
    Array.prototype.forEach.call(popupBlock, function (popup) {
      var textShortLength = popup.querySelector(".t854__news-text_short-hide");
      popup.addEventListener("click", function (e) {
        document.querySelector("body").classList.add("t854__body_overflow");
        wrapTextPopup.style.display = "block";
        if (textShortLength) {
          textPopup.classList.add("t854__news-popup_short");
        }
        var popupShortContent = popup.innerHTML;
        messageWrap.innerHTML = popupShortContent;
        e.preventDefault();
      });
      if (popup.querySelector("a")) {
        popup.querySelector("a").addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }
    });
  }

/**
* Закрыть попап
* @param {node} rec - блок
*/
  function t854_closePopup(rec) {
    var wrapTextPopup = rec.querySelector(".t854__news-popup-bg");
    var textPopup = rec.querySelector(".t854__news-popup");
    var contentTextPopup = rec.querySelector(".t854__news-popup-content");
    var imagePopup = rec.querySelector(".t854__news-image");
    var close = rec.querySelector(".t854__news-popup-close");
    wrapTextPopup.addEventListener("click", function (e) {
      t854_closeContent(wrapTextPopup, contentTextPopup, textPopup, imagePopup);
      e.preventDefault();
    });
    textPopup.onclick = function (e) {
      e.stopPropagation();
    };
    close.addEventListener("click", function (e) {
      t854_closeContent(wrapTextPopup, contentTextPopup, textPopup, imagePopup);
      e.preventDefault();
    });
    document.querySelector("body").addEventListener("keyup", function (e) {
      if (e.keyCode == 27) {
        t854_closeContent(wrapTextPopup, contentTextPopup, textPopup, imagePopup);
        e.preventDefault();
      }
    });
  }

/**
* Очистить попап
* @param {node} wrapTextPopup - обёртка модального окна
* @param {node} contentTextPopup - контент модального окна
* @param {node} textPopup - текст модального окна
*/
  function t854_closeContent(wrapTextPopup, contentTextPopup, textPopup) {
    document.querySelector("body").classList.remove("t854__body_overflow");
    wrapTextPopup.style.display = "none";
    textPopup.classList.remove("t854__news-popup_short");
    if (contentTextPopup) {
      contentTextPopup.innerHTML = "";
    }
  }
  