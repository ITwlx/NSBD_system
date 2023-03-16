<template>
  <div id="word-list">
    <h2 v-if="title" style="text-align: center; border-bottom: 1px solid">{{title}}</h2>
    <p>
      <span>#</span>
      <span>{{label_name}}</span>
      <span>数量</span>
    </p>
    <div>
      <div v-if="nums === 0" style="text-align: center; font-size: large; margin: 8px">无数据</div>
      <p v-for="index of nums">
        <span> {{index}} </span>
        <span> {{data_list[index - 1]['name']}}</span>
        <span> {{data_list[index - 1]['value']}}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "WordList",
  props: {
    data_list: {
      type: Array,
      require: true
    },
    title: {
      type: String,
      default: ""
    },
    label_name: {
      type: String,
      default: "名称"
    }
  },
  computed: {
    nums() {
      return Math.min(10, this.data_list.length)
    }
  }
}
</script>

<style scoped>
#word-list {
  margin-top: 10px;
  padding: 0 10px;
}
div p {
  display: flex;
  line-height: 39px;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
p span {
  display: inline-block;
}
p >:first-of-type{
  width: 100px;
}
p >:nth-of-type(2){
  flex: 1;
}
p >:nth-of-type(3){
  text-align: center;
  width: 100px;
}
/*p:first-of-type {
  font-size: x-large;
  font-weight: bolder;
}
p:nth-of-type(2) {
  font-size: large;
  font-weight: bolder;
}
p:nth-of-type(3) {
  font-size: medium;
  font-weight: bolder;
}*/
</style>