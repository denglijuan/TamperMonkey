// ==UserScript==
// @name:zh-CN   复制表格数据
// @name         Table-Copy
// @namespace    https://github.com/denglijuan/TamperMonkey
// @version      1.3.0
// @description:zh-CN 选择表格每列数据合并并复制到粘贴板上
// @description  Select the data in each column of the table to merge and copy to the pasteboard
// @author       Denglijuan
// @match        https://wiki.qianxin-inc.cn/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  let isFrist = true;
  let cols = []; // 选择复制列
  let tabelElement = null;
  let isCopyLeave = true;
  let isTheadLeave = true;

  function copy(data) {
    GM_setClipboard(data);
  }

  // 处理数据
  function handleData(data) {
    const newData = data
      .map((item) => {
        const newItem = item.filter(
          (element, index) => element.trim() !== '' && cols.includes(index + 1)
        );

        return [...new Set(newItem)].join('-');
      })
      .join('\r\n');

    copy(newData);
  }

  // 获取 tbody
  function handlerTbody() {
    const tbody = tabelElement.querySelector('tbody');
    const trs = tbody.childNodes;
    const trsLen = trs.length;
    const colsLen = cols.length;
    const max = Math.max(...cols);
    const data = new Array(trsLen)
      .fill(0)
      .map(() => new Array(max).fill(undefined));

    // 遍历 tr
    for (let i = 0; i < trsLen; i++) {
      const tds = trs[i].childNodes;
      let colsIndex = 0; // cols 下标

      // 遍历 td
      for (let j = 0; colsIndex < max; j++) {
        let colspan = +(tds[j].getAttribute('colspan') || 1);
        let rowspan = +(tds[j].getAttribute('rowspan') || 1);
        const text = tds[j].innerText;
        const newText = text.replace(/\n/g, '');

        while (data[i][colsIndex] !== undefined) {
          colsIndex++;
        }

        for (let p = i; p < i + rowspan; p++) {
          data[p].fill(newText, colsIndex, colsIndex + colspan);
        }

        colsIndex += colspan;
      }
    }

    handleData(data);
  }

  // 校验输入框数据
  function validatorCloumns(value) {
    const reg = /^(\d*[,|，]?)*$/;
    cols = [];

    if (value === '') {
      return;
    }

    if (!reg.test(value)) {
      window.alert('请输入合法的参数');
      return;
    }

    value.split(/,|，/).forEach((item) => {
      cols.push(Number(item));
    });

    cols = [...new Set(cols)]; // 去重
    return true;
  }

  function getEvent(event) {
    return event ? event : window.event;
  }

  function getTarget(event) {
    return event.target || event.srcElement;
  }

  function addHandler(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    } else {
      element['on' + type] = handler;
    }
  }

  function handlerCopyIcon(event) {
    const e = event ? event : window.event;
    const target = event.target || event.srcElement;
    let svg = target;

    if (svg.nodeName === 'path') {
      svg = svg.parentElement;
    }

    const input = svg.previousElementSibling;
    const result = validatorCloumns(input.value);
    result && handlerTbody();
  }

  // 给图标创建事件
  function createIconEventListener() {
    const copyIcon = document.querySelector('.copy-icon');
    addHandler(copyIcon, 'click', handlerCopyIcon);
  }

  // 展示复制列元素
  function showCopyElement(top, left) {
    const copy = document.querySelector('.table-wrap__copy');
    copy.style.display = 'block';

    // 减去元素高度
    copy.style.top = Math.max(top - 32, 8) + 'px';
    copy.style.left = left - 128 + 'px';
  }

  // 隐藏复制列元素
  function hideCopyElement() {
    const copy = document.querySelector('.table-wrap__copy');
    copy.style.display = 'none';
  }

  // 判断是否要隐藏复制列元素
  function checkHide() {
    setTimeout(function () {
      if (isTheadLeave && isCopyLeave) {
        hideCopyElement();
      }
    }, 1);
  }

  // 处理表头移除事件
  function handlerTheadMouseleave() {
    isTheadLeave = true;
    checkHide();
  }

  // 处理表头移入事件
  function handlerTheadMouseenter(event) {
    const e = getEvent(event);
    const target = getTarget(e);
    const position = target.getBoundingClientRect();
    const top = position.top;
    const left = position.right;
    isTheadLeave = false;
    tabelElement = target.parentElement;
    showCopyElement(top, left);
  }

  // 添加表格悬浮事件
  function createTheadEventListener() {
    const theads = document.querySelectorAll('thead');
    for (let i = 0; i < theads.length; i++) {
      addHandler(theads[i], 'mouseenter', handlerTheadMouseenter);
      addHandler(theads[i], 'mouseleave', handlerTheadMouseleave);
    }
  }

  //复制移出事件
  function handleCopyLeave() {
    isCopyLeave = true;
    checkHide();
  }

  // 复制移入事件
  function handleCopyEnter() {
    isCopyLeave = false;
  }

  // 添加复制列悬浮事件
  function createCopyEventListener() {
    const copy = document.querySelector('.table-wrap__copy');
    addHandler(copy, 'mouseenter', handleCopyEnter);
    addHandler(copy, 'mouseleave', handleCopyLeave);
  }

  // checkbox 处理事件
  function handlerCheckBox(event) {
    const e = getEvent(event);
    const target = getTarget(e);
    const value = target.checked;
    if (value) {
      if (isFrist) {
        // 初始化表头鼠标移入移出事件
        createTheadEventListener();
        isFrist = false;
      }
    } else {
      hideCopyElement();
    }
  }

  // 创建复选框 change 事件
  function createCheckBoxChangeEventListener() {
    const checkBox = document.querySelector('.checkbox');
    addHandler(checkBox, 'change', handlerCheckBox);
  }

  // 创建复制表格元素
  function createCopyTableElement() {
    const div = document.createElement('div');
    const template = `<input type="text" value="1,2,3" class="table-wrap__input" />
    <svg t="1670157694323" class="copy-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2684" width="16" height="16"><path d="M672 832 224 832c-52.928 0-96-43.072-96-96L128 160c0-52.928 43.072-96 96-96l448 0c52.928 0 96 43.072 96 96l0 576C768 788.928 724.928 832 672 832zM224 128C206.368 128 192 142.368 192 160l0 576c0 17.664 14.368 32 32 32l448 0c17.664 0 32-14.336 32-32L704 160c0-17.632-14.336-32-32-32L224 128z" p-id="2685" fill="#cdcdcd"></path><path d="M800 960 320 960c-17.664 0-32-14.304-32-32s14.336-32 32-32l480 0c17.664 0 32-14.336 32-32L832 256c0-17.664 14.304-32 32-32s32 14.336 32 32l0 608C896 916.928 852.928 960 800 960z" p-id="2686" fill="#cdcdcd"></path><path d="M544 320 288 320c-17.664 0-32-14.336-32-32s14.336-32 32-32l256 0c17.696 0 32 14.336 32 32S561.696 320 544 320z" p-id="2687" fill="#cdcdcd"></path><path d="M608 480 288.032 480c-17.664 0-32-14.336-32-32s14.336-32 32-32L608 416c17.696 0 32 14.336 32 32S625.696 480 608 480z" p-id="2688" fill="#cdcdcd"></path><path d="M608 640 288 640c-17.664 0-32-14.304-32-32s14.336-32 32-32l320 0c17.696 0 32 14.304 32 32S625.696 640 608 640z" p-id="2689" fill="#cdcdcd"></path></svg>`;
    div.classList.add('table-wrap__copy');
    div.innerHTML = template;
    return div;
  }

  // 创建启动复制元素
  function createCheckBox() {
    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('class', 'checkbox');
    return checkBox;
  }

  // 初始元素
  function initElement() {
    const divCopy = createCopyTableElement();
    const checkBox = createCheckBox();
    document.body.appendChild(divCopy);
    document.body.appendChild(checkBox);
  }

  // 加载样式
  function loadStyle() {
    const css = `
          .table-wrap__copy{
            position: fixed;
            z-index: 999;
            display: none;
            padding: 5px;
            border-radius: 4px;
            background-color: white;
          }
          .table-wrap__input{
            width: 80px;
            height: 20px;
            padding: 0 8px;
            border-radius: 3px;
            border: 1px solid #ccc;
            color: #333;
          }
          .copy-icon{
            vertical-align: middle;
            cursor: pointer;
          }
          .checkbox{
            position: fixed;
            bottom: 16px;
            right: 16px;
          }
        `;
    GM_addStyle(css);
  }

  loadStyle();
  initElement();
  createCopyEventListener();
  createCheckBoxChangeEventListener();
  createIconEventListener();
})();
