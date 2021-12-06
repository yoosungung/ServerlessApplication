<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="minVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item-group v-model="selectedItem" color="primary">
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" color="primary" dark fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn icon @click.stop="minVariant = !minVariant">
        <v-icon>mdi-{{ `chevron-${minVariant ? "right" : "left"}` }}</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer></v-spacer>
      <v-text-field
        hide-details
        solo
        append-icon="mdi-magnify"
        placeholder="search"
        light
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-btn
        ref="btn_power"
        icon
        :color="signUser ? 'primery' : 'disable'"
        @click="onPower"
      >
        <v-icon>mdi-power</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view v-on:message-bar="onMessageBar" />
    </v-main>
    <v-snackbar v-model="snackbar" :timeout="timeout">
      <div>
        <h3>{{ snackbar_title }}</h3>
        <span>{{ snackbar_message }}</span>
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn icon dark v-bind="attrs" @click="snackbar = false"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    clipped: false,
    drawer: false,
    selectedItem: 0,
    items: [],
    minVariant: false,
    title: "AWS 업무 관리",
    snackbar: false,
    snackbar_message: "",
    snackbar_title: "",
    timeout: 2000,
    signUser: undefined,
  }),
  async beforeMount() {
    if (await this.$uiconfig.loadConfigs()) {
      this.items = this.$uiconfig.getMenus(false);
      this.$axios.use(this, this.$uiconfig.getApiUrl());
      this.$uiconfig.setAxios(this.$axios);
    }
  },
  methods: {
    onMessageBar(title, message) {
      this.snackbar_title = title;
      this.snackbar_message = message;
      this.snackbar = true;
    },
    onSignin(employee) {
      if (employee) {
        this.signUser = employee;
        if (this.signUser.isadmin) {
          this.items = this.$uiconfig.getMenus(true);
        }
      }
    },
    onPower() {
      this.signUser = undefined;
      this.$axios.defaults.headers["Authorization"] = "";
      this.$router.push({ name: "signin", path: "/signin" });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.v-main {
  background-color: #fbf7f7;
}
</style>