"use strict";

import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const apiURL = "https://mshj94wl3i.execute-api.ap-northeast-2.amazonaws.com";

let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || window.location.origin
  baseURL: process.env.apiUrl || apiURL,
  headers: { 'Content-Type': 'application/json', 'Authorization': '' },
  timeout: 60 * 1000, // Timeout
  withCredentials: false // Check cross-site Access-Control
};

const _axios = axios.create(config);
let _app = {};

_axios.use = (app) => {
  _app = app;
  _axios.interceptors.request.use(
    function(config) {
      return config;
    },
    function(error) {
      _app.onMessageBar("Service error", error);
      return Promise.reject(error);
    }
  );
  
  // Add a response interceptor
  _axios.interceptors.response.use(
    function(response) {
      const autho = response.headers.authorization || response.data.Authorization;
      if(autho) {
        _axios.defaults.headers['Authorization'] = autho;
      }
      return response;
    },
    function(error) {
      if (error.response && [401, 403].includes(error.response.status)) {
        _axios.defaults.headers['Authorization'] = "";

        _app.$router.push({ name: 'signin', path: '/signin' })
      } else {
        _app.onMessageBar("Service error", error);
      }
      return Promise.reject(error);
    }
  );  
}

Plugin.install = function(Vue) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    },
  });
};

Vue.use(Plugin)

export default Plugin;
