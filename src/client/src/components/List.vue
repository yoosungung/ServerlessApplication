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
        <v-toolbar flat>
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
  beforeMount() {
    this.getPageConfig();
  },
  methods: {
    getPageConfig() {
      this.visible = this.$uiconfig.getVisible(this.$props.objectname);
      this.selectvisible = "owner";
      this.headers = this.$uiconfig.getListHeaders(this.$props.objectname);
      for (let itm of this.headers) {
        if (
          itm.type == "reference" && 
          (itm.refitems === undefined || itm.refitems.length == 0) &&
          itm.code && itm.code.length == 1
        ) {
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
    getRefItems(itm) {
      if ((!itm.refitems) || (itm.refitems.length == 0)) {
        const valname = itm.code[0].value;
        const txtname = itm.code[0].text;
        this.$axios
          .get(`/api/code/${itm.code[0].object}`, 
              { "value": valname, "text": txtname })
          .then((r) => {
            if (r && r.data) {
              itm.refitems = r.data.map((row) => {
                return { "value": row[valname], "text": row[txtname] };
              });
            } else {
              itm.refitems = [];  
            }
          })
          .catch((e) => {
            console.error(e);
            itm.refitems = [];
          });
      }
    },
    hasReference(fields) {
      for(const f of fields) {
        if(f.type === "reference") {
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
</style>
