/*jshint globalstrict: true*/
"use strict";

var Backup = function(key) {
  console.debug('the constructor of Backup class.');
  this.key = key;
};
Backup.prototype.set = function(data, callback) {
  console.debug('update function of Backup class.');
  if (data === void 0 || data === null) {
    console.error('a invalid type of arguments.');
    return;
  }
  var write = {};
  write[this.key] = JSON.stringify(data);
  chrome.storage.local.set(write, callback);
};
Backup.prototype.get = function(callback) {
  console.debug('get function of Backup class.');
  if (toType(callback) !== 'function') {
    console.error('A invalid type of arugments.');
    return;
  }
  // this.keyのまま使うとthis.keyの値が消滅する
  var key = this.key;
  chrome.storage.local.get(key, function(storages) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.messsage);
      return;
    }

    var backup = storages[key];
    if (toType(backup) === 'string' && backup !== '{}') {
      callback(JSON.parse(backup));
    } else {
      callback(null);
    }
  });
};
Backup.prototype.remove = function(callback) {
  console.debug('remove function of Backup class.');

  chrome.storage.local.remove(this.key, callback);
};

var History = function(key, max_history) {
  console.debug('the constructor of History class.');
  this.key = key;
  this.max_history = max_history || 7;
  this.history = {};
};
History.prototype.read = function(dataObj, callback) {
  console.debug('read function of History class.');
  if (dataObj === void 0 || dataObj === null) {
    chrome.storage.local.get(this.key, function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.messsage);
        return;
      }

      this.history = items[this.key];
      if (toType(callback) === 'function') {
        callback();
      }
    });
  } else if (toType(dataObj) === 'object') {
    this.history = dataObj;
  } else {
    throw new Error('read function of History class is error.' +
                    'dataObj is invalid.');
  }
};
History.prototype.write = function(tab, callback) {
  console.debug('write function of History class.');
  var now = new Date();
  var date = new Date(
    now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  var write_date = date.getTime();
  if (this.history[write_date] === void 0 ||
      this.history[write_date] === null) {
    this.history[write_date] = [];
  } else {
    // Check to if previously purge url.
    this.history[write_date] = this.history[write_date].filter(function(v) {
      return v.url !== tab.url;
    });
  }
  this.history[write_date].push({
    'title': tab.title ? tab.title : 'Unknown',
    'url': tab.url,
    'time': now.getTime(),
  });

  this.oldDelete();

  var write = {};
  write[historyKey] = this.history;
  chrome.storage.local.set(write, callback);
};
// Delete the history of pre-history
History.prototype.oldDelete = function() {
  console.debug('oldDelete function of History class.');
  // milliseconds * seconds * minutes * hours * days
  var criterion = 1000 * 60 * 60 * 24 * this.max_history;
  var now = new Date();
  var removeTime = now.getTime() - criterion;
  var removeDates = [];
  for (var dateTime in this.history) {
    if (parseInt(dateTime, 10) < removeTime) {
      removeDates.push(dateTime);
    }
  }
  for (var i in removeDates) {
    delete this.history[removeDates[i]];
  }
};
History.prototype.setKey = function(keyName) {
  console.debug('setKey function of History class.');
  if (toType(keyName) === 'string') {
    this.key = keyName;
  } else {
    throw new Error('setKey of History class is failed.' +
                    'Invalid arugments');
  }
};
History.prototype.setMaxHistory = function(max) {
  console.debug('setMaxHistory function of History class.');
  if (toType(max) === 'number') {
    this.max_history = max;
  } else {
    throw new Error('setMaxHistory of History class is failed.' +
                    'Invalid arugments');
  }
};