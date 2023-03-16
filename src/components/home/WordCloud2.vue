<template>
  <div class="dis-flex-center">
    <div id="word_cloud_view_id" class="dis-flex-center" :style="style"></div>
  </div>
</template>
<script>
import "echarts-wordcloud";
export default {
  name: "WordCloud2",
  props: {
    words: {
      type: Array,
      required: true
    },
    width: {
      type: String,
      default: '500px',
    },
    height: {
      type: String,
      default: '300px',
    }
  },
  data() {
    return {
      word_cloud_view: null,
      word_cloud_options: {},
      word_list: [{
          name: "局部战争",
          id: "123",
          value: 1500,
        },
        {
          name: "教育",
          id: "123",
          value: 1200,
        },
        {
          name: "职业教育",
          id: "123",
          value: 1100,
        },
        {
          name: "兵法",
          id: "123",
          value: 900,
        },
        {
          name: "一国两制",
          id: "123",
          value: 800,
        },
        {
          name: "特色社会主义思想",
          id: "123",
          value: 700,
        },
      ],
    };
  },
  mounted() {
    this.draw_word_cloud_view()
    this.init_view_data();
  },
  computed: {
    style() {
      return {
        width: this.width,
        height: this.height
      }
    }
  },
  watch: {
    words: {
      deep: true,
      handler() {
        this.init_view_data()
      }
    },
    width() {
      this.word_cloud_view.resize()
    },
    height() {
      this.word_cloud_view.resize()
    }
  },
  methods: {
    // 初始化控件
    draw_word_cloud_view() {
      if (this.word_cloud_view) {
        this.word_cloud_view.dispose();
      }
      this.word_cloud_view = document.getElementById('word_cloud_view_id') && this.$echarts.init(document.getElementById('word_cloud_view_id'));
      this.word_cloud_view && this.word_cloud_view.setOption(this.word_cloud_options);
    },
    // 初始化参数
    init_view_data() {
      let word_cloud_series = [
        {
          type: "wordCloud",
          shape: "circle",
          left: "center",
          clickable: true,
          top: "center",
          width: "100%",
          height: "100%",
          right: null,
          bottom: null,
          sizeRange: [12, 50], // 字号范围
          rotationRange: [0, 0], // 云中文字的角度
          rotationStep: 0, // 渲染的梯度
          gridSize: 50, // 词的间距
          drawOutOfBound: false, // 是否允许词云在边界外渲染
          layoutAnimation: true,
          textStyle: {
            fontFamily: "sans-serif",
            fontWeight: "bold",
            color:  () => {
              return (
                  "rgb(" +
                  [
                    Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255),
                    Math.round(Math.random() * 255),
                  ].join(",") +
                  ")"
              );
            },
          },
          // 鼠标进入样式
          emphasis: {
            focus: "self",
            textStyle: {
              shadowBlur: 5,
              shadowColor: "#F5F5F5",
            },
          },
          data: this.words, // 数据
        },
      ];
      this.word_cloud_options = {
        series: word_cloud_series,
      };
      // 设置参数
      this.word_cloud_view.setOption(this.word_cloud_options);
      // 绑定点击事件
      this.word_cloud_view.on("click", (params) => {
        this.getItemInfo(params.data.id);
      });
    },
    // 点击词云项
    getItemInfo(id) {
      console.log("---", id);
    }
  },
};
</script>
<style scoped>
.dis-flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
