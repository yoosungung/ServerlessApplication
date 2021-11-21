<template>
    <div style="all: unset;">
      <div class="asldigram">
        <div class="wrapper">
          <div class="col-left">
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="facebook">
              <i class="fab fa-facebook"></i><span> Facebook</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="slack">
              <i class="fab fa-slack"></i><span> Slack recive message</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="github">
              <i class="fab fa-github"></i><span> Github Star</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="telegram">
              <i class="fab fa-telegram"></i><span> Telegram send message</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="aws">
              <i class="fab fa-aws"></i><span> AWS</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="log">
              <i class="fas fa-file-signature"></i><span> File Log</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="google">
              <i class="fab fa-google-drive"></i><span> Google Drive save</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="email">
              <i class="fas fa-at"></i><span> Email send</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="template">
              <i class="fas fa-code"></i><span> Template</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="multiple">
              <i class="fas fa-code-branch"></i><span> Multiple inputs/outputs</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="personalized">
              <i class="fas fa-fill"></i><span> Personalized</span>
            </div>
            <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="dbclick">
              <i class="fas fa-mouse"></i><span> DBClick!</span>
            </div>


          </div>
          <div class="col-right">
            <!-- div class="menu">
              <ul>
                <li onclick="editor.changeModule('Home'); changeModule(event);" class="selected">Home</li>
                <li onclick="editor.changeModule('Other'); changeModule(event);">Other Module</li>
              </ul>
            </div -->
            <div id="drawflow" ondrop="drop(event)" ondragover="allowDrop(event)">
              <div class="btn-export" onclick="Swal.fire({ title: 'Export',
              html: '<pre><code>'+JSON.stringify(editor.export(), null,4)+'</code></pre>'
              })">Export</div>
              <div class="btn-clear" onclick="editor.clearModuleSelected()">Clear</div>
              <div class="btn-lock">
                <i id="lock" class="fas fa-lock" onclick="editor.editor_mode='fixed'; changeMode('lock');"></i>
                <i id="unlock" class="fas fa-lock-open" onclick="editor.editor_mode='edit'; changeMode('unlock');" style="display:none;"></i>
              </div>
              <div class="bar-zoom">
                <i class="fas fa-search-minus" onclick="editor.zoom_out()"></i>
                <i class="fas fa-search" onclick="editor.zoom_reset()"></i>
                <i class="fas fa-search-plus" onclick="editor.zoom_in()"></i>
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
                "name":"slack",
                "data":{},
                "class":"slack",
                "html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-slack\"></i> Slack chat message</div>\n          </div>\n          ", 
                "typenode": false, 
                "inputs":{},
                "outputs":{
                  "output_1":{
                    "connections":[
                      {"node":"2","input":"input_1"}
                    ]
                  }
                },
                "pos_x": 10,
                "pos_y":10
              },
              "2":{
                "id":2,
                "name":"telegram",
                "data":{"channel":"channel_2"},
                "class":"telegram",
                "html":"\n          <div>\n            <div class=\"title-box\"><i class=\"fab fa-telegram-plane\"></i> Telegram bot</div>\n            <div class=\"box\">\n              <p>Send to telegram</p>\n              <p>select channel</p>\n              <select df-channel>\n                <option value=\"channel_1\">Channel 1</option>\n                <option value=\"channel_2\">Channel 2</option>\n                <option value=\"channel_3\">Channel 3</option>\n                <option value=\"channel_4\">Channel 4</option>\n              </select>\n            </div>\n          </div>\n          ", 
                "typenode": false, 
                "inputs":{
                  "input_1":{
                    "connections":[
                      {"node":"1","input":"output_1"}
                    ]
                  }
                },
                "outputs":{},
                "pos_x":300,
                "pos_y":300
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
.asldigram {
  --border-color: #cacaca;
  --background-color: #ffffff;
  --background-box-title: #f7f7f7;

  margin: 0px;
  padding: 0px;
  overflow: hidden;
  font-family: 'Roboto', sans-serif;

  position: relative;
}

.wrapper {
  display: flex;
}

.col-left {
  float:left;
  overflow: auto;
  width: 30%;
  max-width: 300px;
  height: 100%;
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
  background-image:
   linear-gradient(to right, #f1f1f1 1px, transparent 1px),
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
    display:none;
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
.drawflow .drawflow-node .inputs, .drawflow .drawflow-node .outputs {
  width: 0px;
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
  display: flex;
  align-items: center;
  position: absolute;
  min-height: 40px;
  border-radius:4px;
  color: black;
  z-index: 2;

  background: var(--background-color);
  border: 1px solid var(--border-color);
  -webkit-box-shadow: 0 2px 15px 2px var(--border-color);
  box-shadow: 0 2px 15px 2px var(--border-color);
  padding: 0px;
  width: 200px;
}
.drawflow .drawflow-node.selected  {
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
.drawflow .drawflow-node .input, .drawflow .drawflow-node .output {
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
.drawflow .drawflow-node .input:hover, .drawflow .drawflow-node .output:hover {
  background: #4ea9ff;
}
.drawflow .drawflow-node .output {
  top: 2px;

  right: 10px;
}
.drawflow .drawflow-node .input {
  top: 2px;

  left: -10px;
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
.drawflow-node.welcome {
  width: 250px;
}
.drawflow-node.slack .title-box {
  border-radius: 4px;
}
.drawflow-node input, .drawflow-node select, .drawflow-node textarea {
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
.drawflow .connection .point.selected, .drawflow .connection .point:hover {
  fill: #4ea9ff;
}
</style>