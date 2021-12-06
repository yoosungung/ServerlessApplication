"use strict";

class UIConfig {
  _configs = new Map();
  _apiurl = "http://localhost:8000";

  async loadConfigs() {
    try {
      const response = await fetch('/app.config.json');
      const appconfig = await response.json();
      const uiconfig = appconfig['UI'];
      for (const obj of uiconfig) {
        this._configs.set(obj.value, obj);
      }
      this._apiurl = appconfig["API"];

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  getApiUrl() {
    return this._apiurl;
  }

  setAxios(axios) {
    if (axios) {
      _axios = axios;
    }
  }

  _names = new Map();
  getName(objname) {
    if (!this._names.has(objname)) {
      let name = ''
      const obj = this._configs.get(objname)
      if (obj && obj.text) {
        name = obj.text
      }
      this._names.set(objname, name)
    }
    return this._names.get(objname)
  }

  _menus = [];
  _isadmin = false;
  getMenus(isadmin = false) {
    if (this._menus.length == 0 || this._isadmin != isadmin) {
      this._menus = [];
      this._menus.push({ icon: "mdi-view-dashboard", title: "홈", to: "/" });
      for (const val of this._configs.values()) {
        if (val.type == 'master' || (isadmin && val.type == 'system')) {
          this._menus.push({ icon: val.icon, title: val.text, to: `/list/${val.value}` });
        }
      }
    }
    return this._menus;
  }

  _visibles = new Map();
  getVisible(objname) {
    if (!this._visibles.has(objname)) {
      let vread = 'group'
      const obj = this._configs.get(objname)
      if (obj && obj.visiblity) {
        vread = obj.visiblity.read
      }
      const visible = []
      if (vread == 'owner' || vread == 'group' || vread == 'all') { visible.push({ value: "owner", text: `나의${obj.text}` }) }
      if (vread == 'group' || vread == 'all') { visible.push({ value: "group", text: `그룹의${obj.text}` }) }
      if (vread == 'all') { visible.push({ value: "all", text: `모든${obj.text}` }) }
      this._visibles.set(objname, visible)
    }
    return this._visibles.get(objname)
  }

  _listheaders = new Map();
  getListHeaders(objname) {
    if (!this._listheaders.has(objname)) {
      const header = []
      const obj = this._configs.get(objname)
      if (obj && obj.fields && obj.fields.length > 0) {
        const flds = obj.fields
        for (const i in flds) {
          if (flds[i].summary !== undefined) {
            header.push(flds[i])
          }
        }
        header.push({ text: "Action", align: "start", value: "actions", sortable: false })
      }
      this._listheaders.set(objname, header)
    }
    return this._listheaders.get(objname)
  }

  _layouts = new Map();
  getLayout(objname) {
    if (!this._layouts.has(objname)) {
      const obj = this._configs.get(objname)
      if (obj && obj.fields) {
        this._layouts.set(objname, obj.fields)
      } else {
        this._layouts.set(objname, [])
      }
    }
    return this._layouts.get(objname)
  }

  _children = new Map();
  getChildren(objname) {
    if (!this._children.has(objname)) {
      const obj = this._configs.get(objname)
      if (obj && obj.children) {
        this._children.set(objname, obj.children)
      } else {
        this._children.set(objname, [])
      }
    }
    return this._children.get(objname)
  }

  _reference = new Map();
  isRefresh(objname) {
    if (!this._reference.has(objname)) {
      const obj = this._configs.get(objname)
      if (obj && obj.reference) {
        this._reference.set(objname, obj.reference)
      } else {
        this._reference.set(objname, undefined)
      }
    }
    return this._reference.get(objname);
  }

  _codeitems = new Map();
  getCodeItems(objname, value) {
    const key = `${objname}.${value}`;
    if (!this._codeitems.has(key)) {
      const obj = this._configs.get(objname);
      if (obj) {
        const defcode = obj.fields.find(itm => {
          return (itm.value === value) && (itm.type === "reference");
        });
        if (defcode) {
          const cv = new CodeItem();
          cv.loadCode(defcode);
          this._codeitems.set(key, cv);
        } else {
          this._codeitems.set(key, undefined);
        }
      } else {
        this._codeitems.set(key, undefined);
      }
    }
    return this._codeitems.get(key);
  }

  _actions = new Map();
  getAction(objname) {
    if (!this._actions.has(objname)) {
      const obj = this._configs.get(objname)
      if (obj && obj.action) {
        this._actions.set(objname, obj.action)
      } else {
        this._actions.set(objname, [])
      }
    }
    return this._actions.get(objname)
  }

  _viewers = new Map();
  getCustomViewer(objname) {
    if (!this._viewers.has(objname)) {
      const obj = this._configs.get(objname)
      if (obj && obj.viewer) {
        this._viewers.set(objname, obj.viewer)
      } else {
        this._viewers.set(objname, "jInfo")
      }
    }
    return this._viewers.get(objname)
  }
}

class CodeItem {
  _defcode = undefined;
  _isdynamic = false;
  _isparent = false;
  _isvalue = false;
  _namecode = undefined;

  loadCode(defCode) {
    if (defCode.type == "reference") {
      this._defcode = this._defClone(defCode, (v, k = "", t = this) => {
        if (k == "text") {
          const vallist = v.split(":");
          const obj = _uiconfig.getLayout(vallist[0].slice(1));
          const fld = obj.find(v => {
            return v["value"] == vallist[1];
          });
          t._namecode = fld?.refitems;
        } else {
          t._isdynamic = true;
          if (v.startsWith("$VALUE:")) { this._isvalue = true; }
          if (v.startsWith("$PARENT:")) { this._isparent = true; }
        }
        return v;
      });
    }
  }

  _defClone(obj, fnResolve) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    const result = Array.isArray(obj) ? [] : {};
    for (let key of Object.keys(obj)) {
      if (typeof (obj[key]) == "string") {
        if (obj[key].startsWith("$")) {
          result[key] = fnResolve(obj[key], key);
        } else {
          result[key] = obj[key];
        }
      } else {
        result[key] = this._defClone(obj[key], fnResolve);
      }
    }
    return result;
  }

  get isDynamicFilter() {
    return this._isdynamic;
  }
  get hasParentFilter() {
    return this._isparent;
  }
  get hasValueFilter() {
    return this._isvalue;
  }

  async qryValue(parentData, currentData) {
    const pams = {
      "value": this._defcode.code[0].value,
      "text": (this._namecode ? "NoName" : this._defcode.code[0].text)
    };
    let flt_stat = true;
    if (this._defcode.code[0].filter) {
      if (this._isdynamic) {
        pams["filter"] = await this._defClone(this._defcode.code[0].filter, v => {
          const vallist = v.split(":");
          if (vallist[0] === "$DATE") {
            return this.date.setDate(this.date.getDate() + (parseInt(vallist[1]) || -1)).format(vallist[2] || "yyyy/MM/dd");
          } else if ((vallist[0] === "$VALUE") && currentData) {
            return currentData[vallist[1]];
          } else if ((vallist[0] === "$PARENT") && parentData) {
            return parentData[vallist[1]];
          } else {
            console.error('UIConfig.qryValue:', v, parentData, currentData);
            flt_stat = false;
            return v;
          }
        });
      } else {
        pams["filter"] = this._defcode.code[0].filter;
      }
    }
    if (!flt_stat) {
      return [];
    }
    try {
      let res = await _axios({
        url: `/api/code/${this._defcode.code[0].object}`,
        method: 'get',
        params: pams
      });
      if (res.status == 200) {
        const cval = res.data.map((row, idx, alls, t = this) => {
          if (t._namecode) {
            return t._namecode.find(v => { return v["value"] == row[pams.value] });
          } else {
            return JSON.parse(`{ "value": "${row[pams.value]}", "text": "${row[pams.text]}" }`);
          }
        });
        cval.sort((a, b) => {
          if (a.text > b.text) { return 1; }
          else if (a.text < b.text) { return -1; }
          else { return 0; }
        });
        return cval;
      } else {
        return [];
      }
    } catch (e) {
      console.info("CodeITems.qryValue:", parentData, currentData);
      console.error(e);

      return [];
    }
  }
}

let _axios = null;
const _uiconfig = new UIConfig();

export default {
  install: async (Vue) => {
    Vue.uiconfig = _uiconfig;
    window.uiconfig = _uiconfig;

    Object.defineProperties(Vue.prototype, {
      uiconfig: {
        get() {
          return _uiconfig;
        }
      },
      $uiconfig: {
        get() {
          return _uiconfig;
        }
      },
    })
  }
}