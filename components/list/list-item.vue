<template>
  <list-scroll class="list-scroll" @loadmore="loadmore">
	  <view class=""> 
	  <!-- 为了兼容小程序 包一个外壳 -->
	  	<list-card :item="item" v-for="item in list" :key="item._id"></list-card>
	  </view>
    
    <uni-load-more :status="load.loading || 'loading'" v-if="list.length === 0 || list.length > 7"></uni-load-more>
  </list-scroll>
</template>

<script>
  export default {
    props: {
      list: {
        type: Array,
        default () {
          return []
        }
      },
      load: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    methods: {
      loadmore() {
        this.$emit('loadmore')
      }
    }
  }
</script>

<style lang="scss">
  .list-scroll {
    height: 100%;
  }
</style>
