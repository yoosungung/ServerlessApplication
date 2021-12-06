<template>
  <v-container grid-list-xs>
    <v-row>
      <v-col
        v-for="itm in objectconfig"
        :key="itm.value"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-text-field
          v-if="itm.type == 'icon'"
          :prepend-icon="jsondata[itm.value]"
          v-model="jsondata[itm.value]"
          :label="itm.text"
          readonly
          dense
          hide-details="true"
        ></v-text-field>
        <v-textarea
          v-else-if="itm.type == 'textarea'"
          :value="jsondata[itm.value]"
          :label="itm.text"
          rows="1"
          readonly
          dense
          hide-details="true"
        ></v-textarea>
        <v-file-input
          v-else-if="itm.type == 'file'"
          v-model="filedata[itm.value]"
          :label="fileProps(itm)"
          prepend-icon="mdi-paperclip"
          append-outer-icon="mdi-download"
          dense
          hide-details="true"
          @click:append-outer="fileDownload(itm)"
        ></v-file-input>
        <v-select
          v-else-if="itm.type == 'select' || itm.type == 'code'"
          v-model="jsondata[itm.value]"
          :items="itm.code"
          :label="itm.text"
          readonly
          dense
          hide-details="true"
        ></v-select>
        <v-select
          v-else-if="itm.type == 'reference'"
          v-model="jsondata[itm.value]"
          :items="qryRefItems(itm)"
          item-value="value"
          item-text="text"
          :label="itm.text"
          readonly
          dense
          hide-details="true"
        ></v-select>
        <v-text-field
          v-else
          :value="jsondata[itm.value]"
          :label="itm.text"
          :type="itm.type"
          readonly
          dense
          hide-details="true"
        ></v-text-field>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import s3File from "../utils/s3file.js";

export default {
  props: {
    objectype: String,
    objectconfig: Array,
    jsondata: Object,
  },
  data() {
    return {
      filedata: {},
    };
  },
  methods: {
    qryRefItems(item) {
      //console.log("jinfo.qryRefItems:", item);
      const cis = this.$uiconfig.getCodeItems(
        this.$props.objectype,
        item.value
      );
      if (cis) {
        if (cis.isDynamicFilter) {
          if (cis.hasValueFilter) {
            cis
              .qryValue(null, this.$props.jsondata)
              .then((r) => {
                return r;
              })
              .catch((e) => {
                console.error(e);
                return [];
              });
          } else {
            return item.refitems;
          }
        } else {
          return item.refitems;
        }
      } else {
        return item.refitems;
      }
    },
    fileDownload(item) {
      const f = this.$props.jsondata[item?.value];
      const s3path =
        f["s3key"] ||
        s3File.getPath(
          this.$props.jsondata?.INFO_ID,
          item?.value,
          this.filedata
        );
      this.$axios
        .get(`/api/file/${s3path}`)
        .then((r) => {
          if (r?.data) {
            window.open(r.data.url);
          }
        })
        .catch((e) => {
          console.error(e);
          this.onMessageBox("Erorr", "File down load error !");
        });
    },
    fileProps(item) {
      s3File.api2file(item?.value, this.filedata, this.$props.jsondata);
      return item?.value;
    },
  },
};
</script>

<style>
</style>