<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title primary-title>
            <div>{{objecttype}}</div>
            <v-spacer></v-spacer>
            <v-card-actions>
              <v-btn icon @click="openEdit()">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="openDelete()">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card-title>
          <v-card-text>
            <jinfo
              :objectype="$props.objectype"
              :objectconfig="objectfields"
              :jsondata="objectdata"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-tabs v-model="tabIdx">
            <v-tab v-for="cld in childObjectList" :key="cld">{{$uiconfig.getName(cld)}}</v-tab>
            <v-spacer></v-spacer>
            <v-btn icon @click="openNewChild()">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-tabs>
          <v-tabs-items v-model="tabIdx" :key="childTabKey">
            <v-tab-item v-for="cld in childObjectList" :key="cld">
              <v-card v-for="childData in childDataDic[cld]" :key="childData.INFO_ID">
                <v-btn icon @click="openEdit(cld, childData)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="openDelete(cld, childData)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <jinfo
                  :objectype="cld"
                  :objectconfig="childFieldDic[cld]"
                  :jsondata="childData"
                />
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
        <v-dialog v-model="viewEdit" persistent>
          <jedit
            v-if="viewEdit"
            :objectgroup="editGroup"
            :objectype="editType"
            :selectobject="editRef"
            :objectconfig="editConfig"
            :jsondata="editData"
            v-on:close-editor="onCloseEdit"
          />
        </v-dialog>
        <v-snackbar v-model="viewSnackbar" light top>
          <h3>{{ `Conform delete ? (${editType} ${getTitle(editData)})` }}</h3>
          <template v-slot:action="{ attrs }">
            <v-btn color="error" text v-bind="attrs" @click="deleteData">
              Delete
            </v-btn>
            <br />
            <v-btn color="success" text v-bind="attrs" @click="closeDelete">
              Cancel
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import jedit from "./jEdit.vue";
import jinfo from "./jInfo.vue";

export default {
  props: {
    objectname: String,
    objectid: String,
  },
  components: {
    jedit,
    jinfo
  },
  data() {
    return {
      objecttype: "",
      objectfields: [],
      objectdata: {},

      viewEdit: false,
      viewSnackbar: false,
      editGroup: "",
      editType: "",
      editConfig: [],
      editRef: "",
      editData: {},

      childObjectList: [],
      childFieldDic: {},
      childRefDic: {},
      tabIdx: null,

      childDataDic: {},
      childObjectData: {},
      childTabKey: 0
    }
  },
  watch: {
    $route: "getPageConfig",
  },
  async beforeMount() {
    await this.getPageConfig();
  },
  methods: {
    getTitle(objdat) {
      if (objdat) {
        return objdat['title'] || objdat['name'] || objdat['caption'] || 'Noname';
      } else {
        return 'Noname';
      }
    },
    async getPageConfig() {
      this.objecttype = this.$uiconfig.getName(this.$props.objectname);
      this.objectfields = this.$uiconfig.getLayout(this.$props.objectname);
      for (const fld of this.objectfields) {
        if (fld.type == "reference" && fld.code && fld.code.length == 1) {
          await this.qryRefItems(fld);
        }
      }
      this.qryParentData();

      this.childObjectList = this.$uiconfig.getChildren(this.$props.objectname);
      for (const cld of this.childObjectList) {
        this.childFieldDic[cld] = this.$uiconfig.getLayout(cld);
        this.childRefDic[cld] = this.$uiconfig.isRefresh(cld)
      }
      this.qryChildData();
    },
    async qryRefItems(itm) {
      if (!itm.codeitems) {
        itm.codeitems = this.$uiconfig.getCodeItems(this.$props.objectname, itm.value, this.$axios);
      }
      itm.refitems = itm.codeitems.qryValue(this.$props.objectid, v => {
        if(v.startWith("$DATE:")) {
          const vallist = v.split(":");
          return this.date.setDate(this.date.getDate() + (parseInt(vallist[1]) || -1)).format(vallist[2] || "yyyy/MM/dd");
        } else if(v.startWith("$VALUE:")) {
          const vallist = v.split(":");
          return this.objectdata[vallist[1]];
        } else if(v.startWith("$PARENT:")) {
          //const vallist = v.split(":");
          return this.$props.objectid;
        } else {
          console.error('UIConfig.getFilterJson.valueEvaluation:' + v);
          return v;
        }
      });
    },
    qryParentData() {
      this.$axios
        .get(`/api/info/${this.$props.objectname}/${this.$props.objectid}`)
        .then((r) => {
          this.objectdata = r.data;
        })
        .catch((e) => {
          console.error(e);
          this.objectdata = {};
        });
    },
    qryChildData() {
      this.$axios
        .get(`/api/info/${this.$props.objectid}`)
        .then((r) => {
          for (const cld of this.childObjectList) {
            const cldData = []
            for (const dat of r.data) {
              if (dat.INFO_TYPE === cld) {
                cldData.push(dat);
              }
            }
            this.childDataDic[cld] = cldData;
          }          
          this.childTabKey += 1;
        })
        .catch((e) => {
          console.error(e);
          this.childDataDic = {};
        });
    },    
    initEditValue() {
      this.editGroup="";
      this.editType="";
      this.editConfig=[];
      this.editRef = "";
      this.editData={};
    },
    openEdit(target, objdata) {
      if(target && target.length > 0) {
        this.editGroup = this.$props.objectid;
        this.editType = target;
        this.editConfig = this.childFieldDic[target];
        this.editRef = this.childRefDic[target];
        this.editData = objdata;
      } else {
        this.editGroup = this.$props.objectname;
        this.editType = this.$props.objectname;
        this.editConfig = this.objectfields;
        this.editData = this.objectdata;
      }
      this.viewEdit = true;
    },
    openNewChild() {
      this.editGroup = this.$props.objectid;
      this.editType = this.childObjectList[this.tabIdx];
      this.editConfig = this.childFieldDic[this.editType];
      this.editRef = this.childRefDic[this.editType];
      this.editData = {};
      this.viewEdit = true;
    },
    onCloseEdit(refresh) {
      this.viewEdit = false;
      if (refresh) {
        if(this.editGroup === this.editType) {
          this.qryParentData();
        } else {
          this.qryChildData();
        }
      }
      this.initEditValue();
    },
    openDelete(target, objdata) {
      if(target && target.length > 0) {
        this.editGroup = this.$props.objectid;
        this.editType = target;
        this.editData = objdata;
      } else {
        this.editGroup = this.$props.objectname;
        this.editType = this.$props.objectname;
        this.editData = this.objectdata;
      }
      this.viewSnackbar = true;
    },
    closeDelete() {
      this.viewSnackbar = false;
      this.initEditValue();
    },
    deleteData() {
      this.viewSnackbar = false;
      this.$axios
        .delete(`/api/info/${this.editData.INFO_GRP}/${this.editData.INFO_ID}`)
        .then((r) => {
          if (r) {
            this.$emit("message-bar", "Infomation", `Deleted "${this.getTitle(this.editData)}" (${this.editType}) !`);
            if(this.editGroup === this.editType) {
              this.$router.back();
            } else {
              this.qryChildData();
            }
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.initEditValue();
        });
    },
  }
}
</script>

<style>
</style>