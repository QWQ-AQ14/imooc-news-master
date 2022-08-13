<template>
	<view class="label">
		<view class="label-box">
			<view class="label-header">
				<text class="label-title">我的标签</text>
				<text class="label-edit" @click="editLabel">{{isEdit?'完成':'编辑'}}</text>
			</view>
			<uni-load-more v-if="loading" status="loading" iconType="snow"></uni-load-more>
			<view class="label-content">
				<view class="label-item" v-for="(item, index) in labelList" :key="item._id">
					{{item.name}}
					<uni-icons @click="del(index)" v-if="isEdit" type="clear" class="icons-close" size="20" color="red">
					</uni-icons>
				</view>
				<view v-if="labelList.length === 0 && !loading" class="no-data">
					当前没有数据
				</view>
			</view>
		</view>
		<view class="label-box">
			<view class="label-header">
				<text class="label-title">推荐标签</text>
			</view>
			<uni-load-more v-if="loading" status="loading" iconType="snow"></uni-load-more>
			<view class="label-content">
				<view class="label-item" v-for="(item, index) in list" :key="item._id" @click="add(index)">
					{{item.name}}
				</view>
				<view v-if="list.length === 0 && !loading" class="no-data">
					当前没有数据
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				labelList: [],
				list: [],
				isEdit: false,
				// 当前我的标签是否存在内容
				loading: false
			}
		},
		onLoad() {
			this.getLabel();
		},
		methods: {
			async getLabel() {
				this.loading = true;
				const {
					data
				} = await this.$api.getLabel({
					type: 'all'
				});
				this.loading = false;
				//我的标签
				this.labelList = data.filter(item => item.current);
				// 推荐标签
				this.list = data.filter(item => !item.current);
			},
			editLabel() {
				if (this.isEdit) {
					this.isEdit = false
					this.updateLabel(this.labelList);
				} else {
					this.isEdit = true
				}
			},
			// 点击推荐标签中的标签移入我的标签中
			add(index) {
				// 只有在编辑状态下才能改动
				if (this.isEdit) {
					this.labelList.push(this.list[index]);
					this.list.splice(index, 1);
				}
			},
			// 点击标签中的删除触发
			del(index) {
				this.list.push(this.labelList[index]);
				// 删除我的标签中已经删去的标签
				this.labelList.splice(index, 1);
			},
			//保存标签编辑过后的内容
			async updateLabel(label) {
				let arr = [];
				label.forEach(item => {
					arr.push(item._id);
				});
				uni.showLoading();
				await this.$api.updateLabel({
					label: arr
				});
				uni.hideLoading();
				uni.showToast({
					title: '更新成功'
				});
				// 使用uni自定义事件 uni.emit 接收 uni.on
				// 自定义事件，只能在打开的页面触发 
				// 标签设置完成后，需要将设置的标签传递给首页
				uni.$emit('labelChange');
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;
	}

	.label {
		.label-box {
			background-color: #fff;
			margin-bottom: 10px;

			.label-header {
				display: flex;
				justify-content: space-between;
				padding: 10px 15px;
				font-size: 14px;
				color: #666;
				border-bottom: 1px solid #f5f5f5;

				.label-edit {
					color: #30b33a;
					font-weight: bold;
				}
			}

			.label-content {
				display: flex;
				flex-wrap: wrap;
				padding: 15px;

				//padding-bottom: 0;
				.label-item {
					position: relative;
					margin-top: 12px;
					margin-right: 10px;
					border-radius: 5px;
					padding: 2px 5px;
					border: 1px solid #666;
					color: #666;
					font-size: 14px;

					.icons-close {
						position: absolute;
						top: -8px;
						right: -8px;
						background-color: #fff;
						border-radius: 50%;
					}
				}
			}
		}
	}

	.no-data {
		width: 100%;
		padding: 50px 0;
		color: #999;
		text-align: center;
	}
</style>
