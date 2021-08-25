<template>
  <v-card light class="elevation-12">
    <v-card-title>
      <div>{{this.isedit ? "[수정]" : "[신규]"}} {{getObjecType}}</div>
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-container grid-list-xs>
          <v-row>
            <v-col
              v-for="itm in editlayout"
              :key="itm.value"
              cols="12" sm="6" lg="3"
            >
              <v-checkbox
                v-if="itm.type == 'bool'"
                v-model="editdata[itm.value]"
                :label="itm.text"
              ></v-checkbox>
              <v-file-input
                v-if="itm.type == 'file'"
                v-model="editdata[itm.value]"
                :label="itm.text"
                prepend-icon="mdi-paperclip"
              ></v-file-input>
              <v-radio-group
                v-if="itm.type == 'code'"
                v-model="editdata[itm.value]"
              >
                <v-radio v-for="n in itm.code" :key="n.value" :value="n.value" :label="n.text">
                </v-radio>
              </v-radio-group>
              <v-select
                v-if="itm.type == 'select'"
                v-model="editdata[itm.value]"
                :items="itm.code"
                :label="itm.text"
              ></v-select>
              <v-select
                v-if="itm.type == 'reference' && itm.code && itm.code.length == 1"
                v-model="editdata[itm.value]"
                :items="itm.refitems"
                item-value="value"
                item-text="text"
                :label="itm.text"
              ></v-select>
              <v-slider
                v-if="itm.type == 'number' && itm.code && itm.code.length == 2"
                v-model="editdata[itm.value]"
                :min="itm.code[0]"
                :max="itm.code[1]"
                :label="itm.text"
              >
                <template v-slot:append>
                  <v-text-field
                    v-model="editdata[itm.value]"
                    class="mt-0 pt-0"
                    type="number"
                    style="width: 60px"
                  ></v-text-field>
                </template>
              </v-slider>
              <v-menu
                v-if="itm.type == 'date'"
                v-model="itm[itm.value + '_picker']"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="editdata[itm.value]"
                    :label="itm.text"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="editdata[itm.value]"
                  @input="itm[itm.value + '_picker'] = false"
                ></v-date-picker>
              </v-menu>
              <v-menu
                v-if="itm.type == 'time'"
                :ref="itm.value + '_picker'"
                v-model="itm[itm.value + '_picker']"
                :close-on-content-click="false"
                :nudge-right="40"
                :return-value.sync="editdata[itm.value]"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="290px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="editdata[itm.value]"
                    :label="itm.text"
                    prepend-icon="mdi-clock-time-four-outline"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-time-picker
                  v-model="editdata[itm.value]"
                  full-width
                  @click:minute="inputTime(itm.value)"
                ></v-time-picker>
              </v-menu>
              <v-textarea
                v-if="itm.type == 'textarea'"
                v-model="editdata[itm.value]"
                :label="itm.text"
                rows="1"
              ></v-textarea>
              <v-text-field
                v-if="
                  itm.type == 'text' ||
                  (itm.type == 'number' &&
                    (!itm.code || itm.code.length != 2)) ||
                  itm.type == 'email' ||
                  itm.type == 'password' ||
                  itm.type == 'tel' ||
                  itm.type == 'url' ||
                  (itm.type == 'reference' &&
                    (!itm.code || itm.code.length != 1))
                "
                v-model="editdata[itm.value]"
                :label="itm.text"
                :type="itm.type"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveEditData">save</v-btn>
      <v-btn color="secondary" @click="closeEdit">cancel</v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if="$props.selectobject" color="third" @click="openSelect">select</v-btn>
      <v-dialog v-model="viewselect" persistent>
        <jselect
          v-if="viewselect"
          :objectname="$props.selectobject"
          v-on:close-selector="onCloseSelector"
        />
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import jselect from "./jSelect.vue";

export default {
  components: { jselect },
  props: {
    objectgroup: String,
    objectype: String,
    objectconfig: Array,
    selectobject: String,
    jsondata: Object,
  },
  data() {
    return {
      id: null,
      isedit: false,
      editlayout: [],
      editdata: {},
      valid: true,
      viewselect: false
    };
  },
  computed: {
    getObjecType() {
      return this.$uiconfig.getName(this.$props.objectype);
    },
  },
  beforeMount() {
    if(this.$props.objectconfig) {
      this.editlayout = this.$props.objectconfig;
    } else {
      this.editlayout = this.$uiconfig.getLayout(this.$props.objectype);
    }    
    this.setEditLayout();

    if (this.$props.jsondata && this.$props.jsondata.INFO_ID) {
      this.isedit = true;
      this.id = this.$props.jsondata.INFO_ID;
      this.qryEditData();
    } else {
      this.isedit = false;
      this.editdata = this.$props.jsondata || {};
    }
  },
  methods: {
    setEditLayout() {
      for (let itm of this.editlayout) {
        if (itm.type == "number") {
          if (itm.code && itm.code.length > 0) {
            this.editdata[itm.value] = itm.code[0];
          } else {
            this.editdata[itm.value] = "";
          }
        } else if (itm.type == "date" || itm.type == "time") {
          itm[itm.value + "_picker"] = false;
        } else if (
          itm.type == "reference" &&
          (itm.refitems === undefined || itm.refitems.length == 0) &&
          itm.code &&
          itm.code.length == 1
        ) {
          this.getRefItems(itm);
        }
      }
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
    inputTime(name) {
      this.$refs[name + "_picker"][0].save(this.editdata[name]);
      this.editlayout[name + "_picker"] = false;
    },
    qryEditData() {
      this.$axios
        .get(`/api/info/${this.$props.objectgroup}/${this.id}`)
        .then((r) => {
          if (r && r.data) {
            this.editdata = r.data;
          } else {
            this.editdata = {};
          }
        })
        .catch((e) => {
          console.error(e);
          this.editdata = {}
        });
    },
    closeEdit() {
      this.$emit("close-editor");
    },
    saveEditData() {
      this.editdata['INFO_TYPE'] = this.$props.objectype;
      if (this.isedit) {
        this.$axios
          .put(`/api/info/${this.$props.objectgroup}/${this.id}`, this.editdata)
          .then((r) => {
            //console.info(r);
            this.$emit("close-editor", r.data);
          })
          .catch((e) => {
            console.error(e);
          });
      } else {
        if(this.editdata.INFO_ID) {
          this.$axios
            .post(`/api/info/${this.$props.objectgroup}/${this.editdata.INFO_ID}`, this.editdata)
            .then((r) => {
              //console.info(r);
              this.$emit("close-editor", r.data);
            })
            .catch((e) => {
              console.error(e);
            });
        } else {
          this.$axios
            .post(`/api/info/${this.$props.objectgroup}`, this.editdata)
            .then((r) => {
              //console.info(r);
              this.$emit("close-editor", r.data);
            })
            .catch((e) => {
              console.error(e);
            });
        }
      }
    },
    openSelect() {
      this.viewselect = true;
    },
    onCloseSelector(selectData) {
      if(selectData) {
        let data = {};
        for(const itm of this.editlayout) {
          if(selectData[itm.value]) {
            data[itm.value] = selectData[itm.value]
          }
        }
        this.editdata = data;
      }
      this.viewselect = false;
    }
  },
};
</script>

<style scoped>
.e4 {
  width: 400px;
  margin: auto;
}
</style>