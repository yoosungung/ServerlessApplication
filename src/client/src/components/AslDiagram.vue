<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <v-expansion-panels>
          <v-expansion-panel v-for="(item,i) in preItems" :key="i">
            <v-expansion-panel-header>{{ item.name }}</v-expansion-panel-header>
            <v-expansion-panel-content>{{ item.descript }}</v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="8">
        <v-card style="height: 100%;">
          <v-card-actions>
            <v-btn>Export</v-btn>
            <v-btn>Clear</v-btn>
            <v-spacer/>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                >
                  LOCK
                </v-btn>
              </template>
              <v-list>
                <v-list-item :key="Lock" link>
                  <v-list-item-title>Lock</v-list-item-title>
                </v-list-item>
                <v-list-item :key="Unlock" link>
                  <v-list-item-title>Unlock</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                >
                  ZOOM
                </v-btn>
              </template>
              <v-list>
                <v-list-item :key="ZoomOut" link>
                  <v-list-item-title>Zoom Out</v-list-item-title>
                </v-list-item>
                <v-list-item :key="ZoomReset" link>
                  <v-list-item-title>Zoom Reset</v-list-item-title>
                </v-list-item>
                <v-list-item :key="ZoomIn" link>
                  <v-list-item-title>Zoom In</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-actions>
          <v-card-text>
            <div id="drawflow" ondrop="drop(event)" ondragover="allowDrop(event)"  style="all: unset;"/>
            <!--div class="btn-export" onclick="alert({ title: 'Export', html: '<pre><code>'+JSON.stringify($editor.export(), null,4)+'</code></pre>' })">Export</div>
            <div class="btn-clear" onclick="$editor.clearModuleSelected()">Clear</div>
            <div class="btn-lock">
              <i id="lock" class="fas fa-lock" onclick="$editor.editor_mode='fixed'; changeMode('lock');"></i>
              <i id="unlock" class="fas fa-lock-open" onclick="$editor.editor_mode='edit'; changeMode('unlock');" style="display:none;"></i>
            </div>
            <div class="bar-zoom">
              <i class="fas fa-search-minus" onclick="$editor.zoom_out()"></i>
              <i class="fas fa-search" onclick="$editor.zoom_reset()"></i>
              <i class="fas fa-search-plus" onclick="$editor.zoom_in()"></i>
            </div-->
          </v-card-text>

        </v-card>
      </v-col>
    </v-row>
  </v-container>  
</template>

<script>
import Drawflow from "../utils/drawflow";

export default {
  data() {
    return {
      preItems: [
        { name: "test1", icon: "", descript: "test 1"},
        { name: "test2", icon: "", descript: "test 2"},
        { name: "test3", icon: "", descript: "test 3"},
        { name: "test4", icon: "", descript: "test 4"},
      ],

      $drawflow: null,
      $editor: null,
      aslJson: {}
    }
  },

  mounted() {
    const data = this.getAslJson();
    this.$drawflow = document.getElementById("drawflow");
    this.$editor = new Drawflow(this.$drawflow);
    this.$editor.reroute = true;
    this.$editor.reroute_fix_curvature = true;
    this.$editor.force_first_input = false;
    this.$editor.start();
    this.$editor.import(data);
  },

  methods: {
    getAslJson() {
      this.aslJson = {
        "drawflow": {
          "Home": {
            "data": {
              "1": {
                "id":1,
                "name":"welcome",
                "data":{},
                "class":"welcome",
                "html":"\n    <div>\n      <div class=\"title-box\">👏 Welcome!!</div>\n      <div class=\"box\">\n        <p>Simple flow library <b>demo</b>\n        <a href=\"https://github.com/jerosoler/Drawflow\" target=\"_blank\">Drawflow</a> by <b>Jero Soler</b></p><br>\n\n        <p>Multiple input / outputs<br>\n           Data sync nodes<br>\n           Import / export<br>\n           Modules support<br>\n           Simple use<br>\n           Type: Fixed or Edit<br>\n           Events: view console<br>\n           Pure Javascript<br>\n        </p>\n        <br>\n        <p><b><u>Shortkeys:</u></b></p>\n        <p>🎹 <b>Delete</b> for remove selected<br>\n        💠 Mouse Left Click == Move<br>\n        ❌ Mouse Right == Delete Option<br>\n        🔍 Ctrl + Wheel == Zoom<br>\n        📱 Mobile support<br>\n        ...</p>\n      </div>\n    </div>\n    ", 
                "typenode": false, 
                "inputs":{},
                "outputs":{},
                "pos_x":50,
                "pos_y":50
              },
              "2": {
                "id":2,
                "name":"slack",
                "data":{},
                "class":"slack",
                "html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-slack\"></i> Slack chat message</div>\n          </div>\n          ", "typenode": false, "inputs":{"input_1":{"connections":[{"node":"7","input":"output_1"}]}},"outputs":"aaa","pos_x":"lala","pos_y":87},"3":{"id":3,"name":"telegram","data":{"channel":"channel_2"},"class":"telegram","html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-telegram-plane\"></i> Telegram bot</div>\n            <div class=\"box\">\n              <p>Send to telegram</p>\n              <p>select channel</p>\n              <select df-channel>\n                <option value=\"channel_1\">Channel 1</option>\n                <option value=\"channel_2\">Channel 2</option>\n                <option value=\"channel_3\">Channel 3</option>\n                <option value=\"channel_4\">Channel 4</option>\n              </select>\n            </div>\n          </div>\n          ", 
                "typenode": false, 
                "inputs":{
                  "input_1":{
                    "connections":[
                      {"node":"7","input":"output_1"}
                    ]
                  }
                },
                "outputs":{},
                "pos_x":1032,
                "pos_y":184
              },
              "4":{
                "id":4,
                "name":"email",
                "data":{},
                "class":"email",
                "html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-at\"></i> Send Email </div>\n            </div>\n            ", 
                "typenode": false, 
                "inputs": {
                  "input_1": {
                    "connections": [
                      {"node":"5","input":"output_1"}
                    ]
                  }
                },
                "outputs":{},
                "pos_x":1033,
                "pos_y":439
              },
              "5": {
                "id":5,
                "name":"template",
                "data": {
                  "template":"Write your template"
                },
                "class":"template",
                "html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-code\"></i> Template</div>\n              <div class=\"box\">\n                Ger Vars\n                <textarea df-template></textarea>\n                Output template with vars\n              </div>\n            </div>\n            ", 
                "typenode": false, 
                "inputs": {
                  "input_1": {
                    "connections": [
                      { "node":"6", "input":"output_1" }
                    ]
                  }
                },
                "outputs": {
                  "output_1": {
                    "connections": [
                      { "node":"4", "output":"input_1" },
                      { "node":"11", "output":"input_1" }
                    ]
                  }
                },
                "pos_x":607,
                "pos_y":304
              },
              "6": {
                "id":6,
                "name":"github",
                "data": {
                  "name":"https://github.com/jerosoler/Drawflow"
                },
                "class":"github",
                "html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-github \"></i> Github Stars</div>\n            <div class=\"box\">\n              <p>Enter repository url</p>\n            <input type=\"text\" df-name>\n            </div>\n          </div>\n          ", 
                "typenode": false, 
                "inputs": {},
                "outputs": {
                  "output_1": {
                    "connections": [
                      { "node":"5", "output":"input_1" }
                    ]
                  }
                },
                "pos_x":341,
                "pos_y":191
              },
              "7":{
                "id":7,
                "name":"facebook",
                "data":{},
                "class":"facebook",
                "html":"\n        <div>\n          <div class=\"title-box\"><i class=\"fab fa-facebook\"></i> Facebook Message</div>\n        </div>\n        ", 
                "typenode": false, 
                "inputs":{},
                "outputs": {
                  "output_1": {
                    "connections": [
                      {"node":"2","output":"input_1"},
                      {"node":"3","output":"input_1"},
                      {"node":"11","output":"input_1"}
                    ]
                  }
                },
                "pos_x":347,
                "pos_y":87
              },
              "11": {
                "id":11,
                "name":"log",
                "data":{},
                "class":"log",
                "html":"\n            <div>\n              <div class=\"title-box\"><i class=\"fas fa-file-signature\"></i> Save log file </div>\n            </div>\n            ", 
                "typenode": false, 
                "inputs": {
                  "input_1": {
                    "connections": [
                      {"node":"5","input":"output_1"},
                      {"node":"7","input":"output_1"}
                    ]
                  }
                },
                "outputs":{},
                "pos_x":1031,
                "pos_y":363
              }
            }
          },
          "Other":{
            "data":{
              "8":{
                "id":8,
                "name":"personalized",
                "data":{},
                "class":"personalized",
                "html":"\n            <div>\n              Personalized\n            </div>\n            ", 
                "typenode": false, 
                "inputs":{
                  "input_1":{
                    "connections":[
                      { "node":"12","input":"output_1" },
                      { "node":"12","input":"output_2" },
                      { "node":"12","input":"output_3" },
                      { "node":"12","input":"output_4" }
                    ]
                  }
                },
                "outputs":{
                  "output_1":{
                    "connections":[
                      { "node":"9","output":"input_1" }
                    ]
                  }
                },
                "pos_x":764,
                "pos_y":227
              },
              "9":{
                "id":9,
                "name":"dbclick",
                "data":{
                  "name":"Hello World!!"
                },
                "class":"dbclick",
                "html":"\n            <div>\n            <div class=\"title-box\"><i class=\"fas fa-mouse\"></i> Db Click</div>\n              <div class=\"box dbclickbox\" ondblclick=\"showpopup(event)\">\n                Db Click here\n                <div class=\"modal\" style=\"display:none\">\n                  <div class=\"modal-content\">\n                    <span class=\"close\" onclick=\"closemodal(event)\">&times;</span>\n                    Change your variable {name} !\n                    <input type=\"text\" df-name>\n                  </div>\n\n                </div>\n              </div>\n            </div>\n            ", 
                "typenode": false, 
                "inputs":{
                  "input_1":{
                    "connections":[
                      { "node":"8","input":"output_1" }
                    ]
                  }
                },
                "outputs":{
                  "output_1":{
                    "connections":[
                      { "node":"12","output":"input_2" }
                    ]
                  }
                },
                "pos_x":209,
                "pos_y":38
              },
              "12":{
                "id":12,
                "name":"multiple",
                "data":{},
                "class":"multiple",
                "html":"\n            <div>\n              <div class=\"box\">\n                Multiple!\n              </div>\n            </div>\n            ", 
                "typenode": false, 
                "inputs":{
                  "input_1":{
                    "connections":[]
                  },
                  "input_2":{
                    "connections":[
                      {"node":"9","input":"output_1"}
                    ]
                  },
                  "input_3":{
                    "connections":[]
                  }
                },
                "outputs":{
                  "output_1":{
                    "connections":[
                      {"node":"8","output":"input_1"}
                    ]
                  },
                  "output_2":{
                    "connections":[
                      {"node":"8","output":"input_1"}
                    ]
                  },
                  "output_3":{
                    "connections":[
                      {"node":"8","output":"input_1"}
                    ]
                  },
                  "output_4":{
                    "connections":[
                      {"node":"8","output":"input_1"}
                    ]
                  }
                },
                "pos_x":"lala",
                "pos_y":272
              }
            }
          }
        }
      };
      return this.aslJson;
    },

    changeMode(mode) {
      console.log('changeMode', mode);
    },

    drop(event) {
      console.log('drop', event);
    },

    allowDrop(event) {
      console.log('allowDrop', event);
    }

  }
}
</script>

<style>
</style>