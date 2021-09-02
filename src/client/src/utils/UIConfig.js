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
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  getApiUrl() {
    return this._apiurl;
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
  getMenus() {
    if (this._menus.length == 0) {
      this._menus.push({ icon: "mdi-view-dashboard", title: "홈", to: "/" });
      for (const val of this._configs.values()) {
        if (val.type == 'master') {
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
}

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