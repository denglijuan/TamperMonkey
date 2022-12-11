// ==UserScript==
// @name:zh-CN   Vue3 API 仪表盘
// @name         Vue3 API Dashboad
// @namespace    https://github.com/denglijuan/TamperMonkey
// @version      1.0.0
// @description:zh-CN 将 Vue3 API 平铺
// @description  Tile Vue3 APIs
// @author       Denglijuan
// @match        https://cn.vuejs.org/api/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vuejs.org
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const isShow = false;

  function addEvent(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    } else {
      element['on' + type] = handler;
    }
  }

  function addFloatElementListener() {
    const icon = document.querySelector('.floatElement');

    const handler = function () {
      this.isShow = !this.isShow;
      const apiClone = document.getElementById('api-index-clone');
      const api = document.getElementById('api-index');
      apiClone.style.display = this.isShow ? 'block' : 'none';
      api.style.display = this.isShow ? 'none' : 'block';
    };

    addEvent(icon, 'click', handler);
  }

  function addAPICopy() {
    console.log('addAPICopy');
    const api = document.getElementById('api-index');
    const apiParent = api.parentNode;
    const apiGroups = api.querySelectorAll('.api-group');

    const apiClone = document.createElement('div');
    apiClone.id = 'api-index-clone';

    const apiSection = document.createElement('div');
    apiSection.className = 'api-section-clone';

    const apiHeader = document.querySelector('.header').cloneNode(true);

    [...apiGroups].map((item) => {
      const apiGroup = item.cloneNode(true);
      apiSection.appendChild(apiGroup);
    });

    apiClone.appendChild(apiHeader);
    apiClone.appendChild(apiSection);
    apiParent.appendChild(apiClone);
  }

  function addFloatElement() {
    const svg = `<svg t="1670141231304" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3637" width="100%" height="100%"><path d="M384 480H192c-52.8 0-96-43.2-96-96V192c0-52.8 43.2-96 96-96h192c52.8 0 96 43.2 96 96v192c0 52.8-43.2 96-96 96zM192 160c-17.6 0-32 14.4-32 32v192c0 17.6 14.4 32 32 32h192c17.6 0 32-14.4 32-32V192c0-17.6-14.4-32-32-32H192zM832 480H640c-52.8 0-96-43.2-96-96V192c0-52.8 43.2-96 96-96h192c52.8 0 96 43.2 96 96v192c0 52.8-43.2 96-96 96zM640 160c-17.6 0-32 14.4-32 32v192c0 17.6 14.4 32 32 32h192c17.6 0 32-14.4 32-32V192c0-17.6-14.4-32-32-32H640zM384 928H192c-52.8 0-96-43.2-96-96V640c0-52.8 43.2-96 96-96h192c52.8 0 96 43.2 96 96v192c0 52.8-43.2 96-96 96zM192 608c-17.6 0-32 14.4-32 32v192c0 17.6 14.4 32 32 32h192c17.6 0 32-14.4 32-32V640c0-17.6-14.4-32-32-32H192zM832 928H640c-52.8 0-96-43.2-96-96V640c0-52.8 43.2-96 96-96h192c52.8 0 96 43.2 96 96v192c0 52.8-43.2 96-96 96zM640 608c-17.6 0-32 14.4-32 32v192c0 17.6 14.4 32 32 32h192c17.6 0 32-14.4 32-32V640c0-17.6-14.4-32-32-32H640z" p-id="3638" fill="#ffffff"></path></svg>`;

    const floatElement = document.createElement('div');
    const VPContentPage = document.querySelector('.VPContentPage');
    floatElement.className = 'floatElement';
    floatElement.innerHTML = svg;
    VPContentPage.appendChild(floatElement);
  }

  function loadStyle() {
    const css = `
    #api-index-clone{
      max-width: calc(100% - 80px);
      min-width: 1280px;
      padding: 64px 32px;
      display: none;
    }

    .api-section-clone {
      columns:6;
      margin-top: 24px;
    }

    .api-group {
      margin: 8px !important;
      padding: 8px !important;
    }

    h3 {
      margin: 0px !important;
    }

    .floatElement {
      position: fixed;
      top: 64px;
      right:8px;
      width: 40px;
      height: 40px;
      padding: 8px;
      color: #fff;
      border-radius: 50%;
      background-color: #2e6be6;
      cursor: pointer;
    }
  `;

    GM_addStyle(css);
  }

  loadStyle();
  addFloatElement();
  addAPICopy();
  addFloatElementListener();
})();
