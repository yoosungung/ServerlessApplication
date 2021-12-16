<template>
  <div style="all: unset">
    <div class="asldigram">
      <div class="wrapper">
        <div class="col-left">
          <v-tabs v-model="tabIdx">
            <v-tab key="Tasks">Tasks</v-tab>
            <v-tab key="Flows">Flows</v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabIdx">
            <v-tab-item key="Tasks">
              <div
                v-for="itm in TaskItems"
                :key="itm.name"
                class="drag-drawflow"
                :data-node="itm.name"
                draggable="true"
                v-on:dragstart="drag"
                v-on:touchend="drop"
                v-on:touchmove="positionMobile"
                v-on:touchstart="drag"
              >
                <v-icon>{{ itm.icon }}</v-icon
                ><span> {{ itm.name }}</span>
              </div>
            </v-tab-item>
            <v-tab-item key="Flows">
              <div
                v-for="itm in flowItems"
                :key="itm.name"
                class="drag-drawflow"
                :data-node="itm.name"
                draggable="true"
                v-on:dragstart="drag"
                v-on:touchend="drop"
                v-on:touchmove="positionMobile"
                v-on:touchstart="drag"
              >
                <v-icon>{{ itm.icon }}</v-icon
                ><span> {{ itm.name }}</span>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </div>
        <div class="col-right">
          <div id="drawflow" v-on:drop="drop" v-on:dragover="allowDrop">
            <div class="btn-export" v-on:click="exportAslJson">Save</div>
            <div
              class="btn-clear"
              v-on:click="
                $editor.clearModuleSelected();
                $editor.import(cleanAslJson());
              "
            >
              Clear
            </div>
            <div class="btn-lock">
              <i
                ref="lock"
                class="
                  v-icon
                  notranslate
                  mdi
                  theme--dark
                  mdi-lock-open-variant-outline
                "
                v-on:click="
                  $editor.editor_mode = 'fixed';
                  changeMode('lock');
                "
              ></i>
              <i
                ref="unlock"
                class="v-icon notranslate mdi theme--dark mdi-lock-outline"
                v-on:click="
                  $editor.editor_mode = 'edit';
                  changeMode('unlock');
                "
                style="display: none"
              ></i>
            </div>
            <div class="bar-zoom">
              <i
                class="
                  v-icon
                  notranslate
                  mdi
                  theme--dark
                  mdi-magnify-minus-outline
                "
                v-on:click="$editor.zoom_out()"
              ></i>
              <i
                class="v-icon notranslate mdi theme--dark mdi-magnify"
                v-on:click="$editor.zoom_reset()"
              ></i>
              <i
                class="
                  v-icon
                  notranslate
                  mdi
                  theme--dark
                  mdi-magnify-plus-outline
                "
                v-on:click="$editor.zoom_in()"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Drawflow from "../utils/drawflow";

export default {
  props: {
    parentid: String,
    parentdata: Object,
    objectype: String,
    jsondata: Array,
  },
  data() {
    return {
      tabIdx: 0,
      flowItems: [],
      TaskItems: [],

      $drawflow: null,
      $editor: null,
      aslJson: {},

      mobile_item_selec: "",
      mobile_last_move: null,
    };
  },

  mounted() {
    this.qryStates();

    this.$drawflow = document.getElementById("drawflow");
    this.$editor = new Drawflow(this.$drawflow);
    this.$editor.reroute = true;
    this.$editor.reroute_fix_curvature = true;
    this.$editor.force_first_input = false;
    this.$editor.start();
    this.$editor.import(this.queryAslJson());

    this.setEditorEvent();
  },

  methods: {
    qryStates() {
      this.flowItems = [
        {
          name: "Pass",
          icon: "mdi-arrow-right-circle-outline",
          inputcnt: 1,
          outputcnt: 1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-arrow-right-circle-outline"></i> PASS</div></div>`,
        },
        {
          name: "Choice",
          icon: "mdi-call-split",
          inputcnt: 1,
          outputcnt: 2,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-call-split"></i> CHOICE</div></div>`,
        },
        {
          name: "Wait",
          icon: "mdi-alarm",
          inputcnt: 1,
          outputcnt: 1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-alarm"></i> WAIT</div></div>`,
        },
        {
          name: "Succeed",
          icon: "mdi-check-underline",
          inputcnt: 1,
          outputcnt: -1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-check-underline"></i> SUCCEED</div></div>`,
        },
        {
          name: "Fail",
          icon: "mdi-message-alert",
          inputcnt: 1,
          outputcnt: -1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-message-alert"></i> FAIL</div></div>`,
        },
        {
          name: "Parallel",
          icon: "mdi-play-box-multiple",
          inputcnt: 1,
          outputcnt: 2,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-play-box-multiple"></i> PARALLEL</div></div>`,
        },
        {
          name: "Map",
          icon: "mdi-reload",
          inputcnt: 1,
          outputcnt: 1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-reload"></i> MAP</div></div>`,
        },
        {
          name: "Merge",
          icon: "mdi-merge",
          inputcnt: 1,
          outputcnt: 1,
          dataformat: {},
          html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-merge"></i> MERGE</div></div>`,
        },
      ];
      this.$axios
        .get(`/api/list/TTaskTemplate`)
        .then((r) => {
          if (r && r.data) {
            this.TaskItems = r.data.map((v) => {
              if (!v.html) {
                v.html = `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light ${v.icon}"></i> ${v.name}</div></div>`;
              }
              return v;
            });
          } else {
            this.TaskItems = [];
          }
        })
        .catch((e) => {
          console.error(e);
          this.TaskItems = [];
        });
    },
    cleanAslJson() {
      this.aslJson = {
        drawflow: {
          Home: {
            data: {
              0: {
                id: 0,
                name: "start",
                data: {},
                class: "start",
                html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-play"></i>START</div></div>`,
                typenode: false,
                inputs: {},
                outputs: {
                  output_1: {
                    connections: [],
                  },
                },
                pos_x: 400,
                pos_y: 50,
              },
              99999999: {
                id: 99999999,
                name: "end",
                data: {},
                class: "end",
                html: `<div><div class="title-box"><i class="v-icon notranslate mdi theme--light mdi-stop"></i>END</div></div>`,
                typenode: false,
                inputs: {
                  input_1: {
                    connections: [],
                  },
                },
                outputs: {},
                pos_x: 400,
                pos_y: 500,
              },
            },
          },
        },
      };
      return this.aslJson;
    },

    queryAslJson() {
      if (this.$props.jsondata?.length > 0) {
        this.$axios
          .get(`/api/info/${this.$props.jsondata[0]["INFO_ID"]}`)
          .then((r) => {
            if (r?.data?.Define) {
              return (this.aslJson = {
                drawflow: { Home: { data: r.data.Define } },
              });
            } else {
              return this.cleanAslJson();
            }
          })
          .catch((e) => {
            console.error(e);
            return this.cleanAslJson();
          });
      } else {
        return this.cleanAslJson();
      }
    },
    exportAslJson() {
      const flowJson = this.$editor.export();
      const tasks = flowJson?.drawflow?.Home?.data || {};

      const stacktask = [];
      let t = tasks["0"]?.outputs?.output_1.connections[0].node;

      const stepJson = {
        Comment: this.$props.parentdata["Description"],
        StartAt: t,
        States: {},
      };
      let sts = [stepJson.States];

      while (t) {
        const tobj = tasks[t];
        switch(tobj['class']) {
          case "Succeed": 
            sts[-1][tobj['id']] = { "Type": tobj['class'], "end": true };
            break;
          case "Fail": 
            sts[-1][tobj['id']] = { "Type": tobj['class'], "end": true };
            break;
          case "Pass": 
            const nxt = tobj.outputs?.output_1.connections[0].node;
            sts[-1][tobj['id']] = { "Type": tobj['class'], "Next": nxt };
            stacktask.push(nxt);
            break;
          case "Choice": 
            tobj.outputs.map(v => {
              const nxt = v.connections[0].node;
              sts[-1][tobj['id']] = { "Type": tobj['class'], "Choices": nxt };
              stacktask.push(nxt);
            });
            break;
          case "Wait": 
            const nxt = tobj.outputs?.output_1.connections[0].node;
            sts[-1][tobj['id']] = { "Type": tobj['class'], "Next": nxt };
            stacktask.push(nxt);
            break;
          case "Parallel": 
            const states = {};
            sts[-1][tobj['id']] = { "Type": tobj['class'], "States": states };
            sts.push(states);
            break;
          case "Map": 
            const states = {};
            sts[-1][tobj['id']] = { "Type": tobj['class'], "States": states };
            sts.push(states);
            break;
          case "Merge":
            sts.pop();
            break;
          default:
            break;
        }
        t = stacktask.pop();
      }
    },
    /*
{
  "0":{
    "id":0,
    "name":"start",
    "data":{},
    "class":"start",
    "html":"<div><div class=\"title-box\"><i class=\"v-icon notranslate mdi theme--light mdi-play\"></i>START</div></div>",
    "typenode":false,
    "inputs":{},
    "outputs":{
      "output_1":{
        "connections":[
          {"node":"10000000","output":"input_1"}
        ]
      }
    },
    "pos_x":400,"pos_y":50
  },
  "9999999":{
    "id":9999999,
    "name":"end",
    "data":{},
    "class":"end",
    "html":"<div><div class=\"title-box\"><i class=\"v-icon notranslate mdi theme--light mdi-stop\"></i>END</div></div>",
    "typenode":false,
    "inputs":{
      "input_1":{
        "connections":[
          {"node":"10000000","input":"output_1"}
        ]
      }
    },
    "outputs":{},
    "pos_x":400,"pos_y":500
    },
    "10000000":{
      "id":10000000,
      "name":"테스트",
      "data":"{}",
      "class":"테스트",
      "html":"<div><div class=\"title-box\"><i class=\"v-icon notranslate mdi theme--light mdi-test-tube\"></i> 테스트</div></div>",
      "typenode":false,
      "inputs":{
        "input_1":{
          "connections":[
            {"node":"0","input":"output_1"}
          ]
        }
      },
      "outputs":{
        "output_1":{
          "connections":[
            {"node":"9999999","output":"input_1"}
          ]
        }
      },
      "pos_x":363,"pos_y":180
    }
  }
    */

    setEditorEvent() {
      /*
      this.$editor.on('nodeCreated', function(id) {
        console.log("Node created " + id);
      });
      this.$editor.on('nodeRemoved', function(id) {
        console.log("Node removed " + id);
      });
      */
      this.$editor.on("nodeSelected", function (id) {
        console.log("Node selected " + id);
      });
      /*
      this.$editor.on('moduleCreated', function(name) {
        console.log("Module Created " + name);
      });
      this.$editor.on('moduleChanged', function(name) {
        console.log("Module Changed " + name);
      });
      this.$editor.on('connectionCreated', function(connection) {
        console.log('Connection created');
        console.log(connection);
      });
      this.$editor.on('connectionRemoved', function(connection) {
        console.log('Connection removed');
        console.log(connection);
      });
      this.$editor.on('mouseMove', function(position) {
        console.log('Position mouse x:' + position.x + ' y:'+ position.y);
      });
      this.$editor.on('nodeMoved', function(id) {
        console.log("Node moved " + id);
      });
      this.$editor.on('zoom', function(zoom) {
        console.log('Zoom level ' + zoom);
      });
      this.$editor.on('translate', function(position) {
        console.log('Translate x:' + position.x + ' y:'+ position.y);
      });
      this.$editor.on('addReroute', function(id) {
        console.log("Reroute added " + id);
      });
      this.$editor.on('removeReroute', function(id) {
        console.log("Reroute removed " + id);
      });
      */
    },

    changeMode(option) {
      //console.log('changeMode', option);
      if (option == "lock") {
        this.$refs.lock.style.display = "none";
        this.$refs.unlock.style.display = "block";
      } else {
        this.$refs.lock.style.display = "block";
        this.$refs.unlock.style.display = "none";
      }
    },

    positionMobile(ev) {
      //console.log('positionMobile', ev);
      this.mobile_last_move = ev;
    },
    drag(ev) {
      //console.log('drag', ev);
      if (ev.type === "touchstart") {
        this.mobile_item_selec = ev.target
          .closest(".drag-drawflow")
          .getAttribute("data-node");
      } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute("data-node"));
      }
    },
    drop(ev) {
      //console.log('drop', ev);
      if (ev.type === "touchend") {
        var parentdrawflow = document
          .elementFromPoint(
            this.mobile_last_move.touches[0].clientX,
            this.mobile_last_move.touches[0].clientY
          )
          .closest("#drawflow");
        if (parentdrawflow != null) {
          this.addNodeToDrawFlow(
            this.mobile_item_selec,
            this.mobile_last_move.touches[0].clientX,
            this.mobile_last_move.touches[0].clientY
          );
        }
        this.mobile_item_selec = "";
      } else {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("node");
        this.addNodeToDrawFlow(data, ev.clientX, ev.clientY);
      }
    },
    allowDrop(ev) {
      //console.log('allowDrop', ev);
      ev.preventDefault();
    },

    addNodeToDrawFlow(name, pos_x, pos_y) {
      if (this.$editor.editor_mode === "fixed") {
        return false;
      }
      pos_x =
        pos_x *
          (this.$editor.precanvas.clientWidth /
            (this.$editor.precanvas.clientWidth * this.$editor.zoom)) -
        this.$editor.precanvas.getBoundingClientRect().x *
          (this.$editor.precanvas.clientWidth /
            (this.$editor.precanvas.clientWidth * this.$editor.zoom));
      pos_y =
        pos_y *
          (this.$editor.precanvas.clientHeight /
            (this.$editor.precanvas.clientHeight * this.$editor.zoom)) -
        this.$editor.precanvas.getBoundingClientRect().y *
          (this.$editor.precanvas.clientHeight /
            (this.$editor.precanvas.clientHeight * this.$editor.zoom));

      let itm;
      itm =
        this.TaskItems.find((v) => {
          return v.name == name;
        }) ||
        this.flowItems.find((v) => {
          return v.name == name;
        });
      this.$editor.addNode(
        name,
        itm?.inputcnt || 1,
        itm?.outputcnt || 1,
        pos_x,
        pos_y,
        name,
        itm?.dataformat || {},
        itm?.html || `<div><div class="title-box">${name}</div></div>`
      );
      /*
        <div>
          <div class="title-box"><i class="fab fa-facebook"></i> Facebook Message</div>
          <div class="box">
            <p>Enter repository url</p>
            <input type="text" df-name>
            <input type="text" df-db-key placeholder="DB key">
            <select df-channel>
              <option value="channel_1">Channel 1</option>
              <option value="channel_2">Channel 2</option>
            </select>
            <span class="close" onclick="closemodal(event)">&times;</span>
            Change your variable {name} !
            <input type="text" df-name>
          </div>
        </div>
        editor.addNode('aws', 1, 1, pos_x, pos_y, 'aws', { "db": { "dbname": '', "key": '' }}, aws );
      */
    },
  },
};
</script>

<style>
.asldigram {
  --border-color: #cacaca;
  --background-color: #ffffff;
  --background-box-title: #f7f7f7;

  margin: 0px;
  padding: 0px;
  overflow: hidden;
  font-family: "Roboto", sans-serif;

  position: relative;
}

.wrapper {
  display: flex;
}

.col-left {
  float: left;
  overflow: auto;
  width: 30%;
  max-width: 300px;
  height: 100%;
  min-height: 600px;
  background: var(--background-color);
  border-right: 1px solid var(--border-color);
  z-index: 3;
}

.drag-drawflow {
  line-height: 50px;
  border-bottom: 1px solid var(--border-color);
  padding-left: 20px;
  cursor: move;
  user-select: none;
  text-align: left;
}

.col-right {
  float: right;
  flex-grow: 1;
}

#drawflow {
  position: relative;
  height: 100%;
  background: var(--background-color);
  background-size: 25px 25px;
  background-image: linear-gradient(to right, #f1f1f1 1px, transparent 1px),
    linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
}

.btn-export {
  float: right;
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-weight: bold;
  border: 1px solid #0e5ba3;
  background: #4ea9ff;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 3;
}
.btn-clear {
  float: right;
  position: absolute;
  top: 10px;
  right: 85px;
  color: white;
  font-weight: bold;
  border: 1px solid #96015b;
  background: #e3195a;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 3;
}
.btn-lock {
  float: right;
  position: absolute;
  bottom: 10px;
  right: 140px;
  display: flex;
  font-size: 24px;
  color: white;
  padding: 5px 10px;
  background: #555555;
  border-radius: 4px;
  border-right: 1px solid var(--border-color);
  z-index: 3;
  cursor: pointer;
}
.bar-zoom {
  float: right;
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  font-size: 24px;
  color: white;
  padding: 5px 10px;
  background: #555555;
  border-radius: 4px;
  border-right: 1px solid var(--border-color);
  z-index: 3;
}
.bar-zoom svg {
  cursor: pointer;
  padding-left: 10px;
}
.bar-zoom svg:nth-child(1) {
  padding-left: 0px;
}

@media only screen and (max-width: 768px) {
  .col {
    width: 50px;
  }
  .col .drag-drawflow span {
    display: none;
  }
  #drawflow {
    width: calc(100vw - 51px);
  }
}

.drawflow {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none;
}
.drawflow .parent-node {
  position: relative;
}
.drawflow .drawflow-node:hover {
  cursor: move;
}
.drawflow .drawflow-node .inputs,
.drawflow .drawflow-node .outputs {
  /* by YSU
  width: 0px; */
  height: 0px;

  display: flex;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.drawflow .drawflow-node .drawflow_content_node {
  width: 100%;
  display: block;
}
.drawflow svg {
  z-index: 0;
  position: absolute;
  overflow: visible !important;
}
.drawflow .connection {
  position: absolute;
  left: 0px;
  top: 0px;
  pointer-events: none;
}
.drawflow .connection .main-path:hover {
  stroke: #1266ab;
  cursor: pointer;
}
.drawflow .connection .main-path.selected {
  stroke: #43b993;
}
.drawflow .main-path {
  fill: none;
  stroke-width: 5px;
  stroke: steelblue;
}

/* Editing Drawflow */
.drawflow .drawflow-node {
  /* by YSU
  display: flex; */
  display: block;
  align-items: center;
  position: absolute;
  min-height: 40px;
  border-radius: 4px;
  color: black;
  z-index: 2;

  background: var(--background-color);
  border: 1px solid var(--border-color);
  -webkit-box-shadow: 0 2px 15px 2px var(--border-color);
  box-shadow: 0 2px 15px 2px var(--border-color);
  padding: 0px;
  width: 200px;
}
.drawflow .drawflow-node.selected {
  background: white;
  border: 1px solid #4ea9ff;
  -webkit-box-shadow: 0 2px 20px 2px #4ea9ff;
  box-shadow: 0 2px 20px 2px #4ea9ff;
}
.drawflow .drawflow-node.selected .title-box {
  color: #22598c;
  /*border-bottom: 1px solid #4ea9ff;*/
}
.drawflow .connection .main-path {
  fill: none;
  pointer-events: all;

  stroke: #4ea9ff;
  stroke-width: 3px;
}
.drawflow .drawflow-node .input,
.drawflow .drawflow-node .output {
  position: relative;
  background: white;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 1;
  margin-bottom: 5px;

  height: 15px;
  width: 15px;
  border: 2px solid var(--border-color);
}
.drawflow .drawflow-node .input:hover,
.drawflow .drawflow-node .output:hover {
  background: #4ea9ff;
}
.drawflow .drawflow-node .output {
  /* by YSU
  top: 2px;
  right: 10px; */
  top: 5px;
  right: 0px;
}
.drawflow .drawflow-node .input {
  top: -0px;
  left: 0px;
  /* by YSU
  top: 2px;
  left: -10px; */

  background: white;
}
.drawflow > .drawflow-delete {
  margin-left: -15px;
  margin-top: 15px;

  border: 2px solid #43b993;
  background: white;
  color: #43b993;
  -webkit-box-shadow: 0 2px 20px 2px #43b993;
  box-shadow: 0 2px 20px 2px #43b993;
}
.drawflow-delete {
  position: absolute;
  display: block;
  width: 30px;
  height: 30px;
  z-index: 4;
  line-height: 30px;
  font-weight: bold;
  text-align: center;
  border-radius: 50%;
  font-family: monospace;
  cursor: pointer;

  border: 2px solid #4ea9ff;
  background: white;
  color: #4ea9ff;
  -webkit-box-shadow: 0 2px 20px 2px #4ea9ff;
  box-shadow: 0 2px 20px 2px #4ea9ff;
}
.drawflow-node .title-box {
  height: 50px;
  line-height: 50px;
  background: var(--background-box-title);
  border-bottom: 1px solid #e9e9e9;
  border-radius: 4px 4px 0px 0px;
  padding-left: 10px;
}
.drawflow .title-box svg {
  position: initial;
}
.drawflow-node .box {
  padding: 10px 20px 20px 20px;
  font-size: 14px;
  color: #555555;
}
.drawflow-node .box p {
  margin-top: 5px;
  margin-bottom: 5px;
}
.drawflow-node.start,
.drawflow-node.end {
  width: 110px;
}
.drawflow-node input,
.drawflow-node select,
.drawflow-node textarea {
  border-radius: 4px;
  border: 1px solid var(--border-color);
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  width: 158px;
  color: #555555;
}
.drawflow-node textarea {
  height: 100px;
}
.drawflow-node.personalized {
  background: red;
  height: 200px;
  text-align: center;
  color: white;
}
.drawflow-node.personalized .input {
  background: yellow;
}
.drawflow-node.personalized .output {
  background: green;
}
.drawflow-node.personalized.selected {
  background: blue;
}
.drawflow .connection .point {
  cursor: move;
  pointer-events: all;

  stroke: var(--border-color);
  stroke-width: 2;
  fill: white;
}
.drawflow .connection .point.selected,
.drawflow .connection .point:hover {
  fill: #4ea9ff;
}
</style>