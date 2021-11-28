<template>
  <v-container fluid>
    <v-row justify="end">
      <v-col cols="1" sm="3" align-self="center">
        <v-select :items="viewModeItems" v-model="viewMode" label="View Mode" @change="OnChangeOption"/>
      </v-col>
      <v-col cols="1" sm="1" align-self="center">
        <v-checkbox v-model="showLinks" label="Show Links" @change="OnChangeOption"/>
      </v-col>
      <v-col cols="1" sm="1" align-self="center">
        <v-checkbox v-model="showDelay" label="Show Delay" @change="OnChangeOption"/>
      </v-col>
      <v-col cols="auto" sm="auto" align-self="center">
        <v-btn @click="OnClickReSchedule">ReSchedule</v-btn>
        <v-btn @click="OnClickLoad">Load</v-btn>
        <v-btn @click="OnClickSave">Save</v-btn>
      </v-col>
    </v-row>
    <v-row class="overflow-x-auto">
      <v-col cols="auto">
        <div id="svg-root" v-html="ganttHTML" style="{all:unset;}"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {SVGGantt, utils} from '../utils/gantt';

export default {
  props: {
    objectname: String,
    parentid: String,
  },

  data() {
    return {
      viewMode: "week",
      viewModeItems: ["day", "week", "month"],
      showLinks: true,
      showDelay: true,

      svgGantt: null,
      ganttHTML: "",

      tasks: [],
      links: [],

      $svg: null,
      moving: false,
      $start: null,
      $line: null,
    }
  },
  
  mounted() {
    this.getData(this.$props.parentid, this.$props.objectname)
      .then(({tasks, links}) => {
        this.tasks = tasks;
        this.links = links;
        const data = utils.formatData(this.tasks, this.links);
        //console.log(data);

        const options = {
          viewMode: this.viewMode,
          showLinks: `${this.showLinks?"showLinks":""}`,
          showDelay: `${this.showDelay?"showDelay":""}`,
          onClick: this.OnClickGantt
        }
        //console.log(options);

        this.svgGantt = new SVGGantt('#svg-root', data, options);
        this.ganttHTML = this.svgGantt.render();

        this.$svg = document.getElementById('svg-root');
        this.$svg.addEventListener('mousedown', this.onmousedown);
        this.$svg.addEventListener('mousemove', this.onmousemove);
        this.$svg.addEventListener('mouseup', this.onmouseup);
      });
  },

  methods: {
    getData(objectid, objectype) {
      let objty = { task: "TTask", link: "TLink" };
      if(objectype == "TProcess") {
        objty = { task: "TClassTask", link: "TClassLink" };
      }
      this.ganttHTML = "";
      return this.$axios.get(`/api/info/${objectid}`)
        .then((r) => {
          const tasks = [];
          const links = [];

          for (const dat of r.data) {
            delete dat.INFO_GRP;
            delete dat.INFO_BY;
            delete dat.INFO_AT;
            const objtype = dat['INFO_TYPE'];
            //delete dat.INFO_TYPE;

            if (objtype === objty.task) {
              dat['id'] = dat['INFO_ID'];
              //delete dat.INFO_ID;
              if(dat['start']) {
                dat['start'] = new Date(dat['start']);
              }
              if(dat['end']) {
                dat['end'] = new Date(dat['end']);
              }
              tasks.push(dat);
            } else if (objtype === objty.link) {
              //delete dat.INFO_ID;
              links.push(dat);
            }
          }

          tasks.sort((a,b) => {
            if (a.no > b.no) {
              return 1;
            }
            if (a.no < b.no) {
              return -1;
            }
            return 0;
          });

          return {tasks, links};
        })
        .catch((e) => {
          this.tasks = [];
          this.links = [];
          console.error(e);
        });
    },

    setData(objectid) {
      const tasks = this.tasks.map( vo => {
        if(vo['start']) {
          if(typeof vo['start'].getMonth === 'function') {
            vo['start'] = vo['start'].toISOString().substring(0, 10); 
          } else {
            vo['start'] = vo['start'].substring(0, 10); 
          }          
        }
        if(vo['end']) {
          if(typeof vo['end'].getMonth === 'function') {
            vo['end'] = vo['end'].toISOString().substring(0, 10); 
          } else {
            vo['end'] = vo['end'].substring(0, 10); 
          }          
        }
        return vo;
      });
      this.$axios
        .post(`/api/gantt/${objectid}`, { tasks, links: this.links })
        .then((r) => {
          console.info(r);
          this.$emit("message-bar", "Infomation", "Save Tasks and Links !");
        })
        .catch((e) => {
          console.error(e);
          this.$emit("message-bar", "Error", `Faile Save to Tasks and Links ! ${e}`);
        });
    },

    changeData() {
      const data = utils.formatData(this.tasks, this.links);
      this.svgGantt.setData(data);
      this.ganttHTML = this.svgGantt.render();
    },

    OnChangeOption() {
      const options = {
        viewMode: this.viewMode,
        showLinks: `${this.showLinks?"showLinks":""}`,
        showDelay: `${this.showDelay?"showDelay":""}`,
      }
      this.svgGantt.setOptions(options);
      this.ganttHTML = this.svgGantt.render();
    },

    OnClickReSchedule() {
      utils.autoSchedule(this.tasks, this.links);
      this.changeData();
    },

    OnClickLoad() {
      this.getData(this.$props.parentid)
      .then(({tasks, links}) => {
        this.tasks = tasks;
        this.links = links;
        this.changeData();
      });
    },

    OnClickSave() {
      this.setData(this.$props.parentid);
    },

    OnClickGantt(evt) {
      if(evt?.id) {
        const objtype = (this.$props.objectname == "TProcess"?"TClassTask":"TTask");
        this.$emit("open-task", evt, objtype);
      }
    },

    addLink(s, e) {
      const sid = s.dataset['id'];
      const eid = e.dataset['id'];
      const snode = this.tasks.find(t => t.id === sid);
      const enode = this.tasks.find(t => t.id === eid);
      let stype = isStart(s) ? 'S' : 'F';
      let etype = isStart(e) ? 'S' : 'F';
      if (snode.type === 'milestone') {
        stype = 'F';
      }
      if (enode.type === 'milestone') {
        etype = 'S';
      }
      this.links.push({ source: sid, target: eid, type: `${stype}${etype}` });
      this.changeData();
    },

    onmousedown(e) {
      if (!isStart(e.target) && !isFinish(e.target)) {
        return;
      }
      e.preventDefault();
      this.$start = e.target;
      document.querySelectorAll('.gantt-ctrl-start,.gantt-ctrl-finish').forEach(elem => {
        elem.style['display'] = 'block';
      });
      this.moving = true;
      this.$line = document.createElementNS(NS, 'line');
      const x = this.$start.getAttribute('cx');
      const y = this.$start.getAttribute('cy');
      this.$line.setAttribute('x1', x);
      this.$line.setAttribute('y1', y);
      this.$line.setAttribute('x2', x);
      this.$line.setAttribute('y2', y);
      this.$line.style['stroke'] = '#ffa011';
      this.$line.style['stroke-width'] = '2';
      this.$line.style['stroke-dasharray'] = '5';
      this.$svg.appendChild(this.$line);
    },

    onmousemove(e) {
      if (!this.moving) return;
      e.preventDefault();
      if (isStart(e.target) || isFinish(e.target)) {
        const x = e.target.getAttribute('cx');
        const y = e.target.getAttribute('cy');
        this.$line.setAttribute('x2', x);
        this.$line.setAttribute('y2', y);
      } else {
        const x = e.clientX;
        const y = e.clientY;
        const rect = this.$svg.getBoundingClientRect();
        this.$line.setAttribute('x2', x - rect.left);
        this.$line.setAttribute('y2', y - rect.top);
      }
    },

    onmouseup(e) {
      if (!this.moving) return;
      e.preventDefault();
      const isCtrl = isStart(e.target) || isFinish(e.target);
      if (this.$start && isCtrl) {
        this.addLink(this.$start, e.target);
      }

      document.querySelectorAll('.gantt-ctrl-start,.gantt-ctrl-finish').forEach(elem => {
        elem.style['display'] = 'none';
      });
      this.moving = false;
      if (this.$start) {
        this.$start.style['display'] = 'none';
        this.$start = null;
      }
      if (this.$line) {
        this.$svg.removeChild(this.$line);
        this.$line = null;
      }
    }
  }
}

function isStart(el) {
  return el.classList.contains('gantt-ctrl-start');
}

function isFinish(el) {
  return el.classList.contains('gantt-ctrl-finish');
}

const NS = 'http://www.w3.org/2000/svg';

</script>

<style>
</style>