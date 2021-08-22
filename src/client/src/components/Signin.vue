<template>
  <v-container fluid fill-height grid-list-xs>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="300">
        <v-toolbar dark color="primary">
          <v-toolbar-title>SignIn</v-toolbar-title>
        </v-toolbar>
        <v-card light class="elevation-12">
          <v-card-title>to your workspace</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                prepend-icon="mdi-account"
                v-model="form.id"
                label="Id"
                type="email"
              ></v-text-field>
              <v-text-field
                prepend-icon="mdi-lock"
                v-model="form.password"
                label="Password"
                type="password"
                v-on:keyup.enter="signin"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="signin">signin</v-btn>
            <v-btn color="secondary" @click="reset">cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        id: "",
        password: "",
      },
      valid: true,
      dialog: true
    };
  },
  methods: {
    signin() {
      this.$axios
        .post(
          `/api/sign/in`,
          JSON.stringify({
            id: this.form.id,
            password: this.form.password,
          })
        )
        .then((r) => {
          if(r.data.signin === "ok") {
            this.$router.push({ name: 'home', path: '/' });
          }          
        })
        .catch((e) => {
          console.log(e);
          this.$emit("messageBar", "Signin fail !", e);
        });
    },
    reset() {
      this.$refs.form.reset();
    },
  },
};
</script>

<style>
</style>