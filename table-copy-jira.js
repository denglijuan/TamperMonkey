// ==UserScript==
// @name:zh-CN   复制表格数据
// @name         Table-Copy-Jira
// @namespace    https://github.com/denglijuan/TamperMonkey
// @version      1.0.0
// @description:zh-CN 选择表格每列数据合并并复制到粘贴板上
// @description  Select the data in each column of the table to merge and copy to the pasteboard
// @author       Denglijuan
// @match        https://wiki.qianxin-inc.cn/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let cols = []; // 选择复制列

  const css = `
    .floatElement {
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .img{
      width: 100%;
      height: 100%;
    }
  `;

  function copy(data) {
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.value = data;
    textarea.setAttribute('style', 'display:node');
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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
  function handlerTbody(element) {
    const tbody = element.parentElement.getElementsByTagName('tbody')[0];
    const trs = tbody.childNodes;
    const trsLen = trs.length;
    const colsLen = cols.length;
    const max = cols[colsLen - 1];
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

  // 弹窗
  function addDilag(element) {
    const result = window.prompt('示例：“1,2,3” 选择 1,2,3 列', '1,2,3');
    const reg = /^(\d*,?)*$/;
    cols = [];

    if (result === null) {
      return;
    }

    if (result === '' || !reg.test(result)) {
      window.prompt('请输入合法的参数');
      return;
    }

    result.split(',').forEach((item) => {
      cols.push(Number(item));
    });

    cols = [...new Set(cols)]; // 去重
    cols.sort(); // 从小到大排列

    handlerTbody(element);
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

  // 给 table 标题添加双击事件
  function addTheadEventListener() {
    const theads = document.getElementsByTagName('thead');
    if (theads.length === 0) {
      return;
    }

    const handler = function () {
      addDilag(this);
    };

    for (let i = 0; i < theads.length; i++) {
      addHandler(theads[i], 'dblclick', handler);
    }
  }

  function addIconEventListener() {
    const icon = document.querySelector('.img');

    const handler = function () {
      addTheadEventListener();
    };

    addHandler(icon, 'click', handler);
  }

  // 添加图标
  function addIcon() {
    const floatElement = document.createElement('div');
    const icon = document.createElement('img');

    floatElement.className = 'floatElement';
    icon.setAttribute(
      'src',
      'https://git-open.qianxin-inc.cn/free/bbfe/changsha-newbie/denglijuan-lms/uploads/32c75306bcd7fe6565c7d5ecd3a32edf/copyright.svg'
    );
    icon.className = 'img';

    floatElement.appendChild(icon);
    document.body.appendChild(floatElement);
  }

  // 加载样式
  function loadStyle() {
    let style = document.createElement('style');
    style.type = 'text/css';

    try {
      style.appendChild(document.createTextNode(css));
    } catch (ex) {
      style.styleSheet.cssText = css;
    }

    let head = document.getElementsByTagName('head')[0];
    head.appendChild(style);
  }

  loadStyle();
  addIcon();
  addIconEventListener();
})();
