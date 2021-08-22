<template>
  <v-container grid-list-xs>
    <v-row>
      <v-col
        v-for="itm in objectconfig"
        :key="itm.value"
        cols="12" sm="6" lg="3"
      >
        <v-textarea
          v-if="itm.type == 'textarea'"
          :value="jsondata[itm.value]"
          :label="itm.text"
          rows="1"
          readonly
          dense
          hide-details="true"
        ></v-textarea>
        <v-select
          v-else-if="itm.type == 'reference'"
          v-model="jsondata[itm.value]"
          :items="itm.refitems"
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
export default {
  props: {
    objectname: String,
    objectconfig: Array,
    objectid: String,
    jsondata: Object
  },
  beforeMount() {
    console.info(this.$props);
  },
  computed: {
    getTitle() {
      return this.$props.jsondata['title'] || this.$props.jsondata['name'] || this.$props.jsondata['caption'];
    }
  }
}
</script>

<style>

</style>