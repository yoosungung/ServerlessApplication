<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="5">
        <v-select
          class="font-weight-black"
          :items="visible"
          v-model="selectvisible"
        ></v-select>
      </v-col>
      <v-col cols="12" sm="7">
        <v-toolbar flat color="rgb(255 255 255 / 0%)">
          <v-text-field
            v-model="search"
            label="Search"
            single-line
            hide-details
            append-icon="mdi-magnify"
          ></v-text-field>
          <v-btn icon><v-icon @click="openEdit(null)">mdi-plus</v-icon></v-btn>
          <v-dialog v-model="viewdialog" persistent>
            <jedit
              v-if="viewdialog"
              :objectgroup="$props.objectname"
              :objectype="$props.objectname"
              :objectconfig="editconfig"
              :jsondata="editdata"
              :parentid="$props.objectname"
              v-on:close-editor="onCloseEdit"
            />
          </v-dialog>
          <v-btn icon><v-icon>mdi-filter</v-icon></v-btn>
        </v-toolbar>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :loading="dataloading"
          :search="search"
          :headers="headers"
          :items="items"
          :items-per-page="5"
          class="elevation-2"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="showDetail(item)">mdi-file-document</v-icon>
            &nbsp;
            <v-icon small @click="openEdit(item)">mdi-pencil</v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import jedit from "./jEdit.vue";

export default {
  props: { objectname: String },
  components: { jedit },
  data() {
    return {
      visible: [],
      selectvisible: "owner",
      search: "",
      dataloading: false,
      headers: [],
      editconfig: [],
      items: [],
      viewdialog: false,
      editdata: null,
    };
  },
  watch: {
    $route: "getPageConfig",
    selectvisible: "getQryData",
  },
  async beforeMount() {
    await this.getPageConfig();
  },
  methods: {
    async getPageConfig() {
      this.visible = this.$uiconfig.getVisible(this.$props.objectname);
      this.selectvisible = "owner";
      this.headers = this.$uiconfig.getListHeaders(this.$props.objectname);
      for (let itm of this.headers) {
        if (itm.type == "reference" && itm.code && itm.code.length == 1) {
          this.getRefItems(itm);
        }
      }
      this.editconfig = this.$uiconfig.getLayout(this.$props.objectname);
      this.getQryData();
    },
    getQryData() {
      this.dataloading = true;
      this.$axios
        .get(`/api/list/${this.$props.objectname}`, {
          params: { visible: this.selectvisible },
        })
        .then((r) => {
          if (r.data) {
            if(this.hasReference(this.editconfig)) {
              this.items = r.data.map((row) => {
                for(const f of this.editconfig) {
                  if(f.type === "reference" && f.refitems) {
                    const cval = row[f.value];
                    const nval = f.refitems.find(c => c.value === cval);
                    if(nval) {
                      row[f.value] = nval['text'] || cval;
                    }
                  } else if(f.type == "code" && f.code?.length > 0) {
                    const cval = row[f.value];
                    const nval = f.code.find(c => c.value === cval);
                    if(nval) {
                      row[f.value] = nval['text'] || cval;
                    }
                  }
                }
                return row;
              });
            } else {
              this.items = r.data;
            }
          } else {
            this.items = [];
          }
        })
        .catch((e) => {
          console.error(e);
          this.items = [];
        });
      this.dataloading = false;
    },
    async getRefItems(itm) {
      if (!itm.codeitems) {
        itm.codeitems = this.$uiconfig.getCodeItems(this.$props.objectname, itm.value, this.$axios);
      }
      itm.refitems = await itm.codeitems.qryValue(this.$props.objectname, v => {
        const vallist = v.split(":");
        if(vallist[0] === "$DATE") {
          return this.date.setDate(this.date.getDate() + (parseInt(vallist[1]) || -1)).format(vallist[2] || "yyyy/MM/dd");
        } else if(vallist[0] === "$PARENT") {
          return this.$props.objectname;
        } else {
          console.error('UIConfig.getFilterJson.valueEvaluation:' + v);
          return v;
        }

      });
    },
    hasReference(fields) {
      for(const f of fields) {
        if(f.type === "reference" || f.type === "code") {
          return true;
        }
      }
      return false;
    },
    showDetail(data) {
      this.$router.push(`/info/${data.INFO_GRP}/${data.INFO_ID}`);
    },
    openEdit(data) {
      this.editdata = data;
      this.viewdialog = true;
    },
    onCloseEdit(refresh) {
      this.viewdialog = false;
      if (refresh) {
        this.getQryData();
      }
    },
  },
};
</script>

<style>
.v-data-table-header {
  background-color: #f3eeee;
}
</style>
