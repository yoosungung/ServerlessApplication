<template>
  <v-text-field
    :prepend-icon="propsValue"
    v-bind:value="propsValue"
    v-on:input="updateInput"
    :label="propsLabel"
    :ref="propsRef"
    :readonly="propsReadonly"
    :dense="propsReadonly"
    :hide-details="propsReadonly"
  >
  </v-text-field>
</template>

<script>
export default {
  props: {
    value: String,
    label: String,
    ref: String,
    readonly: Boolean,
  },
  mounted() {
    console.log(this.$props);
    this.propsValue = this.$props.value;
    this.propsLabel = this.$props.label;
    this.propsRef = this.$props.ref || "textfield";
    this.propsReadonly = this.$props.readonly || false;
    console.log(this.$data);
  },
  data() {
    return {
      propsValue: "",
      propsLabel: "",
      propsRef: "",
      propsReadonly: false
    }
  },
  methods: {
    updateInput(event) {
      this.propsValue = event;
      this.$emit('input', event);
    }
  }
}
</script>

<style>
</style>