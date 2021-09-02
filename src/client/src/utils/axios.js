"use strict";

import Vue from 'vue';
import axios from "axios";

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const _config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || window.location.origin
  baseURL: "http://localhost:8000",
  headers: { 'Content-Type': 'application/json', 'Authorization': '' },
  timeout: 60 * 1000, // Timeout
  withCredentials: false // Check cross-site Access-Control
};

let _axios = {};
let _app = {};

_axios.use = (app, apiUrl) => {
  _app = app;
  _config.baseURL = apiUrl || _config.baseURL;
  _axios = axios.create(_config);

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
