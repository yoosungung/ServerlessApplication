<template>
  <v-card light class="elevation-12">
    <v-card-title>
      <div>선택 {{getObjecType}}</div>
    </v-card-title>
    <v-card-text>
      <v-toolbar flat>
        <v-text-field
          v-model="search"
          label="Search"
          single-line
          hide-details
          append-icon="mdi-magnify"
        ></v-text-field>
        <v-btn icon><v-icon>mdi-filter</v-icon></v-btn>
      </v-toolbar>
      <v-data-table
        :loading="dataloading"
        :search="search"
        :headers="headers"
        :items="items"
        :items-per-page="5"
        class="elevation-2"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon small @click="selectRow(item)">mdi-check-bold</v-icon>
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <!-- v-btn color="primary" @click="selectRow">select</v-btn -->
      <v-btn color="secondary" @click="closeSelect">cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: { 
    objectname: String
  },
  data() {
    return {
      search: "",
      headers: [],
      editconfig: [],
      items: [],
    };
  },
  computed: {
    getObjecType() {
      return this.$uiconfig.getName(this.$props.objectype);
    },
  },
  async beforeMount() {
    await this.getPageConfig();
  },
  methods: {
    async getPageConfig() {
      this.headers = this.$uiconfig.getListHeaders(this.$props.objectname);
      for (let itm of this.headers) {
        if (
          itm.type == "reference" && 
          (itm.refitems === undefined || itm.refitems.length == 0) &&
          itm.code && itm.code.length == 1
        ) {
          await this.getRefItems(itm);
        }
      }
      this.editconfig = this.$uiconfig.getLayout(this.$props.objectname);
      this.getQryData();
    },
    getQryData() {
      this.dataloading = true;
      this.$axios
        .get(`/api/list/${this.$props.objectname}`, {
          params: { visible: "all" },
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
    async getRefItems(itm) {
      if (!itm.codeitems) {
        itm.codeitems = this.$uiconfig.getCodeItems(this.$props.objectname, itm.value, this.$axios);
      }
      itm.refitems = await itm.codeitems.qryValue(this.$props.objectid, v => {
        const vallist = v.split(":");
        if(vallist[0] === "$DATE") {
          return this.date.setDate(this.date.getDate() + (parseInt(vallist[1]) || -1)).format(vallist[2] || "yyyy/MM/dd");
        } else if(vallist[0] === "$VALUE") {
          return 'this.[vallist[1]]';
        } else if(vallist[0] === "$PARENT") {
          return this.$props.objectid;
        } else {
          console.error('UIConfig.getFilterJson.valueEvaluation:' + v);
          return v;
        }
      });
    },
    hasReference(fields) {
      for(const f of fields) {
        if(f.type === "reference") {
          return true;
        }
      }
      return false;
    },
    selectRow(row) {
      if(row) {
        this.$emit("close-selector", row);        
      }
    },
    closeSelect() {
      this.$emit("close-selector");
    }
  },
};
</script>

<style>
</style>
