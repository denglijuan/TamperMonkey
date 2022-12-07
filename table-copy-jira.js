// ==UserScript==
// @name:zh-CN   复制表格数据
// @name         Table-Copy
// @namespace    https://github.com/denglijuan/TamperMonkey
// @version      1.2.0
// @description:zh-CN 选择表格每列数据合并并复制到粘贴板上
// @description  Select the data in each column of the table to merge and copy to the pasteboard
// @author       Denglijuan
// @match        https://wiki.qianxin-inc.cn/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';
  let cols = []; // 选择复制列

  function init() {
    if (document.querySelector('.table-wrap') !== null) {
      clearInterval(id);

      function copy(data) {
        GM_setClipboard(data);
      }

      // 处理数据
      function handleData(data) {
        const newData = data
          .map((item) => {
            const newItem = item.filter(
              (element, index) =>
                element.trim() !== '' && cols.includes(index + 1)
            );

            return [...new Set(newItem)].join('-');
          })
          .join('\r\n');

        copy(newData);
      }

      // 获取 tbody
      function handlerTbody(element) {
        const tbody = element.querySelector('tbody');
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

      // 弹窗
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
        const table = svg.parentElement.nextElementSibling;
        const result = validatorCloumns(input.value);
        result && handlerTbody(table);
      }

      // 给图标创建事件
      function createIconEventListener() {
        const copyIcon = document.querySelectorAll('.copy-icon');
        for (let i = 0; i < copyIcon.length; i++) {
          addHandler(copyIcon[i], 'click', handlerCopyIcon);
        }
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

      function initElement() {
        const tables = document.querySelectorAll('.table-wrap');
        for (let i = 0; i < tables.length; i++) {
          const divCopy = createCopyTableElement();
          tables[i].parentElement.insertBefore(divCopy, tables[i]);
        }
      }

      // 加载样式
      function loadStyle() {
        const css = `
              .table-wrap__copy{
                float: right;
                margin-top: -24px;
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
            `;
        GM_addStyle(css);
      }

      loadStyle();
      initElement();
      createIconEventListener();
    }
  }

  const id = setInterval(function () {
    init();
  }, 500);

  setTimeout(function () {
    clearInterval(id);
  }, 6000);
})();
