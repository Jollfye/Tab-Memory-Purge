/** options.htmlで読み込み時に実行するスクリプト */

var locale_i18n = [
    'extName', 'option', 'setTimerTitle', 'refURL',
    'default', 'save', 'clear', 'minute','exclude_url',
];

var storage = {
    'timer' : localStorage['timer'],
    'exclude_url' : localStorage['exclude_url'], 
};
    
/**
 * オプションを保存
 *
 * @param {Object} options
 * @param {String} options.name 保存する要素名
 * @param {Number} [options.index = 0] 保存する要素ごとの位置
 * @param {Any} options.value 保存する値
 *
 * @return なし
 */
function SetElementName(options)
{
    var index = options.index ? options.index : 0;
    var value = options.value;
    var name = options.name;

    var element = document.getElementsByName(options.name)[index];
    element.value      = value;
    storage[name] = value;
    localStorage[name] = value;
}

/**
 * SetElementNameのCheckbox, Radioボタン用
 * 引数はSetElementNameと同じ
 *
 * @returns なし
 */
function SetElementNameCheck(options)
{
    SetElementName(options);
    element.checked = true;
}

/**
 * 指定した要素のオプションを取得・保存する
 *
 * @param {Object} options
 * @param {String} options.name 保存する要素名
 * @param {String} options.type 保存する要素のタイプ
 *                              number: 数値
 *                              text: テキストボックス
 *                              textarea: テキストエリア
 *                              radio: ラジオボタン
 * @param {Number} [options.index = 0] 保存する要素名ごとの番号
 *                                     ラジオボタンなどで使用。
 * @param {Function} [options.compare] 引数を一つ取る、比較関数。
 *                                     戻り値がtrueならoptions.value,
 *                                     falseならoptions.compare_valueを保存
 * @param {Any} [options.compare_value] compareがfalseだった時の値。
 *
 * @throws {Error} options.typeの値が対応していない物だった
 * @returns なし
 */
function SaveElementName(options)
{
    if (!options.index) {
        options.index = 0;
    }

    var element = document.getElementsByName(options.name)[options.index];
    var value = element.value;

    if (options.compare && options.compare_value) {
        value = options.compare(value) ? value : options.compare_value;
    }

    // valueをタイプごとに修正
    switch (options.type) {
        case 'number':
            break;
        case 'textarea':
            value = value.trim();
            break;
        default:
            throw new Error('SetElementName Error.', options);
            break;
    }

    // 保存
    element.value              = value;
    storage[name]              = value;
    localStorage[options.name] = value;
}

// 
/**
 * 指定した名前の要素を読み込み
 * ラジオボタンのような同一の名前を複数持っている要素には未対応。
 *
 * @param {String} name 読み込む要素の名前
 * @param [Any] default_value 要素が保存されていなかった場合のデフォルト値
 *
 * @returns なし
 */
function LoadElementName(name, default_value)
{
    var element = document.getElementsByName(name)[0];
    var option = storage[name] ? storage[name] : default_value;

    element.value      = option;
    storage[name]      = option;
    localStorage[name] = option;
}

function InitDefault()
{
    SetElementName({ name: 'timer', value: default_timer});
    SetElementName({ name: 'exclude_url', value: default_exclude_url});
    
    chrome.extension.sendRequest({ event : 'init'});
}

function Save()
{
    SaveElementName({ name: 'timer', type: 'number',
            compare: function(value) {
                return value >= 1;
            }, compare_value: 1});
    SaveElementName({ name: 'exclude_url', type: 'textarea'});

    chrome.extension.sendRequest({ event : 'init'});
}

function Load()
{
    LoadElementName('timer', default_timer);
    LoadElementName('exclude_url', default_exclude_url);
}

function Run()
{
    // テキストの設定
    for (var i = 0; i < locale_i18n.length; i++) {
        var el      = document.getElementsByClassName(locale_i18n[i] + 'Text');
        var message = chrome.i18n.getMessage(locale_i18n[i]);
        for (var j = 0; j < el.length; j++) {
            var string      = el[j].innerHTML;
            var index       = string.lastIndexOf('</');
            el[j].innerHTML = string.substring(0, index) + message
                                    + string.substring(index);
        }
    }

    // データ読み込み
    Load();
}

document.addEventListener('DOMContentLoaded', function() {
    Run();

    document.querySelector('#init').addEventListener('click', InitDefault);
    document.querySelector('#save').addEventListener('click', Save);
    document.querySelector('#load').addEventListener('click', Load);
});
